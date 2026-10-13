<#
.SYNOPSIS
  Creates (if missing) and configures one engagement team site: columns, content types, lists, views, permissions, navigation.
.DESCRIPTION
  Idempotent: safe to re-run. Reads the declarative definition from templates/schema.json.
  -RestrictVisitors removes the Visitors group from engagement lists (used for the Investigations site,
  where even read access is need-to-know).
.NOTES
  Requires PowerShell 7+ and PnP.PowerShell 2.x. NOT TESTED against a live tenant.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $TenantName,        # e.g. contoso  (-> contoso.sharepoint.com)
    [Parameter(Mandatory)] [string] $ClientId,          # Entra ID app registration for interactive PnP auth
    [Parameter(Mandatory)] [string] $Alias,             # e.g. eoo-audit
    [Parameter(Mandatory)] [string] $Title,             # e.g. EOO Audit
    [Parameter(Mandatory)] [string[]] $Owners,          # UPNs
    [string[]] $Members = @(),
    [string[]] $Visitors = @(),
    [switch] $RestrictVisitors
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Deploy-Common.ps1')
$schema = Read-Schema (Join-Path $PSScriptRoot 'templates/schema.json')
$siteUrl = "https://$TenantName.sharepoint.com/sites/$Alias"

# 1. Site ---------------------------------------------------------------
Write-Host "== Site: $siteUrl"
Connect-PnPOnline -Url "https://$TenantName-admin.sharepoint.com" -ClientId $ClientId -Interactive   # admin URL: needed for Get-PnPTenantSite
$site = Get-PnPTenantSite -Identity $siteUrl -ErrorAction SilentlyContinue
if (-not $site) {
    if ($PSCmdlet.ShouldProcess($siteUrl, 'Create team site')) {
        New-PnPSite -Type TeamSite -Title $Title -Alias $Alias -Owners $Owners -Wait | Out-Null
    }
}
Connect-PnPOnline -Url $siteUrl -ClientId $ClientId -Interactive

# 2. Schema: columns -> content types -> lists (lookup needs the target list to exist first)
Write-Host "== Columns and content types"
Ensure-SiteColumns $schema
Ensure-ContentTypes $schema -Names @('EOO Engagement', 'EOO Engagement Document')

Write-Host "== Lists and libraries"
$engDef = $schema.lists | Where-Object key -eq 'Engagements'
$engList = Ensure-List $schema $engDef
Ensure-ListContentType $schema $engDef
Ensure-SiteColumns $schema -LookupListKey 'Engagements' -LookupListId ("{" + $engList.Id.ToString() + "}")
Ensure-ContentTypes $schema -Names @('EOO Recommendation')
foreach ($def in ($schema.lists | Where-Object key -ne 'Engagements')) {
    Ensure-List $schema $def | Out-Null
    Ensure-ListContentType $schema $def
}

Write-Host "== Views"
foreach ($def in $schema.lists) { Ensure-Views $def }

# 3. Permissions (least privilege) ---------------------------------------
Write-Host "== Permissions"
$ownersGroup   = (Get-PnPGroup -AssociatedOwnerGroup).Title
$membersGroup  = (Get-PnPGroup -AssociatedMemberGroup).Title
$visitorsGroup = (Get-PnPGroup -AssociatedVisitorGroup).Title
foreach ($u in $Members)  { Add-PnPGroupMember -LoginName $u -Group $membersGroup }
foreach ($u in $Visitors) { Add-PnPGroupMember -LoginName $u -Group $visitorsGroup }

$noDelete = Ensure-NoDeleteRole
$roles = [ordered]@{ $ownersGroup = 'Full Control'; $membersGroup = $noDelete }
if (-not $RestrictVisitors) { $roles[$visitorsGroup] = 'Read' }
foreach ($def in $schema.lists) { Set-UniquePermissions -ListTitle $def.title -GroupRoles $roles }

# 4. Navigation -------------------------------------------------------------
Write-Host "== Navigation"
Ensure-Navigation @(
    @{ Title = 'Engagements';          Url = "$siteUrl/Lists/Engagements" },
    @{ Title = 'Recommendations';      Url = "$siteUrl/Lists/Recommendations" },
    @{ Title = 'Engagement Documents'; Url = "$siteUrl/Engagement%20Documents" }
)

# 5. Confidentiality banner (SPFx Application Customizer) ----------------------
# Requires the .sppkg to be uploaded to the app catalog and approved first. Component ID = manifest id.
Write-Host "== Confidentiality banner"
$bannerId = "66e953a9-ad82-4f09-bba2-014b937fddcb"
$classification = if ($RestrictVisitors) { 'Strictly Confidential' } else { 'Confidential' }
if (-not (Get-PnPCustomAction -Scope Web | Where-Object { $_.ClientSideComponentId -eq $bannerId })) {
    Add-PnPCustomAction -Name 'EOO-ConfidentialityBanner' -Title 'EOO Confidentiality Banner' -Location 'ClientSideExtension.ApplicationCustomizer' `
        -ClientSideComponentId $bannerId -ClientSideComponentProperties ((@{ classification = $classification } | ConvertTo-Json -Compress)) -Scope Web | Out-Null
}

Write-Host "Done: $siteUrl"
