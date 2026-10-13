<#
.SYNOPSIS
  Shared, idempotent helper functions for provisioning the Oversight Engagement Hub.
.NOTES
  Requires PowerShell 7+ and PnP.PowerShell 2.x. Dot-source this file; do not run it directly.
  STATUS: NOT TESTED against a live Microsoft 365 tenant (syntax-checked only).
#>

Set-StrictMode -Version Latest

function Get-DeterministicGuid([string]$Name) {
    # Same column => same ID on every site, so re-runs and multi-site deployments stay consistent.
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $bytes = $md5.ComputeHash([Text.Encoding]::UTF8.GetBytes("EOO:$Name"))
    return ([Guid]::new($bytes)).ToString('B')
}

function Read-Schema([string]$Path) {
    Get-Content -Raw -Path $Path | ConvertFrom-Json
}

function ConvertTo-FieldXml($Column, [string]$Group, [string]$LookupListId) {
    $id = Get-DeterministicGuid $Column.name
    $req = if ($Column.PSObject.Properties['required'] -and $Column.required) { 'TRUE' } else { 'FALSE' }
    $idx = if ($Column.PSObject.Properties['indexed'] -and $Column.indexed) { 'TRUE' } else { 'FALSE' }
    $uniq = if ($Column.PSObject.Properties['unique'] -and $Column.unique) { ' EnforceUniqueValues="TRUE"' } else { '' }
    $desc = if ($Column.PSObject.Properties['description']) { [Security.SecurityElement]::Escape($Column.description) } else { '' }
    $title = [Security.SecurityElement]::Escape($Column.title)
    $common = "ID=`"$id`" Name=`"$($Column.name)`" StaticName=`"$($Column.name)`" DisplayName=`"$title`" Group=`"$Group`" Required=`"$req`" Indexed=`"$idx`"$uniq Description=`"$desc`""

    switch ($Column.type) {
        'Text'     { return "<Field Type=`"Text`" $common MaxLength=`"255`" />" }
        'Note'     { return "<Field Type=`"Note`" $common NumLines=`"6`" RichText=`"FALSE`" />" }
        'Number'   { $min = if ($Column.PSObject.Properties['min']) { " Min=`"$($Column.min)`"" } else { '' }
                     return "<Field Type=`"Number`" $common$min />" }
        'DateTime' { return "<Field Type=`"DateTime`" $common Format=`"DateOnly`" />" }
        'User'     { return "<Field Type=`"User`" $common UserSelectionMode=`"PeopleOnly`" UserSelectionScope=`"0`" List=`"UserInfo`" ShowField=`"ImnName`" />" }
        'Choice'   {
            $choices = ($Column.choices | ForEach-Object { "<CHOICE>$([Security.SecurityElement]::Escape($_))</CHOICE>" }) -join ''
            $default = if ($Column.PSObject.Properties['default']) { "<Default>$($Column.default)</Default>" } else { '' }
            return "<Field Type=`"Choice`" $common Format=`"Dropdown`">$default<CHOICES>$choices</CHOICES></Field>"
        }
        'Lookup'   { return "<Field Type=`"Lookup`" $common List=`"$LookupListId`" ShowField=`"$($Column.showField)`" />" }
        default    { throw "Unsupported column type '$($Column.type)' for $($Column.name)" }
    }
}

function Ensure-SiteColumns($Schema, [string]$LookupListKey = $null, [string]$LookupListId = $null) {
    foreach ($col in $Schema.columns) {
        $isLookup = $col.type -eq 'Lookup'
        # Lookups need the target list's ID, so they are created in a second pass (see Ensure-LookupColumns).
        if ($isLookup -and -not $LookupListId) { continue }
        if ($isLookup -and $col.lookupList -ne $LookupListKey) { continue }
        if (Get-PnPField -Identity $col.name -ErrorAction SilentlyContinue) {
            Write-Host "  column exists: $($col.name)"; continue
        }
        Write-Host "  + column: $($col.name)"
        $xml = ConvertTo-FieldXml $col $Schema.group $LookupListId
        Add-PnPFieldFromXml -FieldXml $xml | Out-Null
    }
}

function Ensure-ContentTypes($Schema, [string[]]$Names = @()) {
    foreach ($ct in $Schema.contentTypes) {
        if ($Names.Count -gt 0 -and $Names -notcontains $ct.name) { continue }
        $existing = Get-PnPContentType -Identity $ct.name -ErrorAction SilentlyContinue
        if (-not $existing) {
            Write-Host "  + content type: $($ct.name)"
            $parent = Get-PnPContentType -Identity $ct.parent
            $existing = Add-PnPContentType -Name $ct.name -Description $ct.description -Group $Schema.group -ParentContentType $parent
        }
        foreach ($f in $ct.fields) {
            $already = Get-PnPProperty -ClientObject $existing -Property FieldLinks | Where-Object { $_.Name -eq $f }
            if (-not $already) {
                $col = $Schema.columns | Where-Object { $_.name -eq $f }
                $required = [bool]($col.PSObject.Properties['required'] -and $col.required)
                Add-PnPFieldToContentType -Field $f -ContentType $ct.name -Required:$required
            }
        }
    }
}

function Ensure-List($Schema, $ListDef) {
    $list = Get-PnPList -Identity $ListDef.title -ErrorAction SilentlyContinue
    if (-not $list) {
        Write-Host "  + list: $($ListDef.title)"
        $list = New-PnPList -Title $ListDef.title -Template $ListDef.template -EnableContentTypes -OnQuickLaunch
    }
    Set-PnPList -Identity $list -EnableContentTypes $true -EnableVersioning $ListDef.versioning -MajorVersions $(if ($ListDef.PSObject.Properties['majorVersions']) { $ListDef.majorVersions } else { 50 }) | Out-Null
    return $list
}

function Ensure-ListContentType($Schema, $ListDef) {
    $ctName = $ListDef.contentType
    $onList = Get-PnPContentType -List $ListDef.title | Where-Object { $_.Name -eq $ctName }
    if (-not $onList) { Add-PnPContentTypeToList -List $ListDef.title -ContentType $ctName -DefaultContentType }
    # Remove the generic default type so users can only create the intended item type.
    $generic = if ($ListDef.template -eq 'DocumentLibrary') { 'Document' } else { 'Item' }
    if (Get-PnPContentType -List $ListDef.title | Where-Object { $_.Name -eq $generic }) {
        Remove-PnPContentTypeFromList -List $ListDef.title -ContentType $generic
    }
    foreach ($f in $ListDef.indexedFields) {
        Set-PnPField -List $ListDef.title -Identity $f -Values @{ Indexed = $true } | Out-Null
    }
}

function Ensure-Views($ListDef) {
    foreach ($v in $ListDef.views) {
        if (Get-PnPView -List $ListDef.title -Identity $v.title -ErrorAction SilentlyContinue) {
            Write-Host "  view exists: $($v.title)"; continue
        }
        Write-Host "  + view: $($ListDef.title) / $($v.title)"
        $query = $v.query
        if ($v.PSObject.Properties['groupBy']) {
            $query += "<GroupBy Collapse='FALSE'><FieldRef Name='$($v.groupBy)'/></GroupBy>"
        }
        $isDefault = [bool]($v.PSObject.Properties['default'] -and $v.default)
        Add-PnPView -List $ListDef.title -Title $v.title -Fields $v.fields -Query $query -SetAsDefault:$isDefault | Out-Null
    }
}

function Ensure-NoDeleteRole {
    # Least privilege: editors can add/edit but cannot delete engagement records.
    $name = 'Contribute (No Delete)'
    if (-not (Get-PnPRoleDefinition -Identity $name -ErrorAction SilentlyContinue)) {
        Add-PnPRoleDefinition -RoleName $name -Clone 'Contribute' -Exclude DeleteListItems `
            -Description 'Add and edit items; cannot delete. Used for engagement staff.' | Out-Null
    }
    return $name
}

function Set-UniquePermissions([string]$ListTitle, [hashtable]$GroupRoles) {
    # Break inheritance, drop copied assignments, then grant only what is listed.
    Set-PnPList -Identity $ListTitle -BreakRoleInheritance -CopyRoleAssignments:$false -ClearSubscopes | Out-Null
    foreach ($g in $GroupRoles.Keys) {
        Set-PnPListPermission -Identity $ListTitle -Group $g -AddRole $GroupRoles[$g]
    }
}

function Ensure-Navigation([array]$Nodes, [string]$Location = 'TopNavigationBar') {
    $existing = Get-PnPNavigationNode -Location $Location
    foreach ($n in $Nodes) {
        if ($existing | Where-Object { $_.Title -eq $n.Title }) { continue }
        Add-PnPNavigationNode -Location $Location -Title $n.Title -Url $n.Url | Out-Null
    }
}
