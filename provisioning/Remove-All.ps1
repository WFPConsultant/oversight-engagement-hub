<#
.SYNOPSIS
  Removes the three sites (to the SharePoint recycle bin) so a dev tenant can be reset. Refuses to run for 'prod'.
.NOTES
  NOT TESTED against a live tenant.
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory)] [ValidateSet('dev', 'test')] [string] $Environment,
    [string] $ConfigPath = (Join-Path $PSScriptRoot 'config/environments.json')
)
$ErrorActionPreference = 'Stop'
$cfg = (Get-Content -Raw $ConfigPath | ConvertFrom-Json).$Environment
Connect-PnPOnline -Url "https://$($cfg.tenantName)-admin.sharepoint.com" -ClientId $cfg.clientId -Interactive
foreach ($alias in 'eoo-hub', 'eoo-audit', 'eoo-investigations') {
    $url = "https://$($cfg.tenantName).sharepoint.com/sites/$alias"
    if ($PSCmdlet.ShouldProcess($url, 'Move site to recycle bin')) { Remove-PnPTenantSite -Url $url -Force }
}
