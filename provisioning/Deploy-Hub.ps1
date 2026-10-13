<#
.SYNOPSIS
  Creates the hub site (communication site), registers it as a hub, and sets shared hub navigation.
.NOTES
  Registering a hub site and associating sites need SharePoint Administrator rights.
  Requires PowerShell 7+ and PnP.PowerShell 2.x. NOT TESTED against a live tenant.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $TenantName,
    [Parameter(Mandatory)] [string] $ClientId,
    [string] $Alias = 'eoo-hub',
    [string] $Title = 'Example Oversight Office Hub',
    [string[]] $AssociateSiteAliases = @('eoo-audit', 'eoo-investigations'),
    [string[]] $Visitors = @()      # e.g. an "all office staff" security group (read-only)
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Deploy-Common.ps1')
$root = "https://$TenantName.sharepoint.com"
$hubUrl = "$root/sites/$Alias"

Write-Host "== Hub site: $hubUrl"
Connect-PnPOnline -Url "https://$TenantName-admin.sharepoint.com" -ClientId $ClientId -Interactive
if (-not (Get-PnPTenantSite -Identity $hubUrl -ErrorAction SilentlyContinue)) {
    if ($PSCmdlet.ShouldProcess($hubUrl, 'Create communication site')) {
        New-PnPSite -Type CommunicationSite -Title $Title -Url $hubUrl -Wait | Out-Null
    }
}
if (-not (Get-PnPHubSite -Identity $hubUrl -ErrorAction SilentlyContinue)) {
    Register-PnPHubSite -Site $hubUrl | Out-Null
}
foreach ($a in $AssociateSiteAliases) {
    Add-PnPHubSiteAssociation -Site "$root/sites/$a" -HubSite $hubUrl
}

Write-Host "== Hub navigation"
Connect-PnPOnline -Url $hubUrl -ClientId $ClientId -Interactive
$visitorsGroup = (Get-PnPGroup -AssociatedVisitorGroup).Title
foreach ($u in $Visitors) { Add-PnPGroupMember -LoginName $u -Group $visitorsGroup }
Ensure-Navigation @(
    @{ Title = 'Home';           Url = $hubUrl },
    @{ Title = 'Audit';          Url = "$root/sites/eoo-audit" },
    @{ Title = 'Investigations'; Url = "$root/sites/eoo-investigations" }
)
Write-Host "Done: $hubUrl"
