<#
.SYNOPSIS
  Provisions the whole Oversight Engagement Hub: two team sites, then the hub that ties them together.
.EXAMPLE
  Copy config/environments.sample.json to config/environments.json, edit it, then:
  ./Deploy-All.ps1 -Environment dev -WhatIf
  ./Deploy-All.ps1 -Environment dev
.NOTES
  NOT TESTED against a live tenant. Use a developer tenant first.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [ValidateSet('dev', 'test', 'prod')] [string] $Environment,
    [string] $ConfigPath = (Join-Path $PSScriptRoot 'config/environments.json')
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $ConfigPath)) { throw "Missing $ConfigPath. Copy environments.sample.json and fill in your values (never commit it)." }
$cfg = (Get-Content -Raw $ConfigPath | ConvertFrom-Json).$Environment
if (-not $cfg) { throw "Environment '$Environment' not found in $ConfigPath" }

$common = @{ TenantName = $cfg.tenantName; ClientId = $cfg.clientId }

& "$PSScriptRoot/Deploy-TeamSite.ps1" @common -Alias 'eoo-audit' -Title 'EOO Audit' `
    -Owners $cfg.audit.owners -Members $cfg.audit.members -Visitors $cfg.audit.visitors -WhatIf:$WhatIfPreference

& "$PSScriptRoot/Deploy-TeamSite.ps1" @common -Alias 'eoo-investigations' -Title 'EOO Investigations' `
    -Owners $cfg.investigations.owners -Members $cfg.investigations.members -RestrictVisitors -WhatIf:$WhatIfPreference

& "$PSScriptRoot/Deploy-Hub.ps1" @common -Visitors $cfg.hub.visitors -WhatIf:$WhatIfPreference

Write-Host "All sites provisioned for '$Environment'."
