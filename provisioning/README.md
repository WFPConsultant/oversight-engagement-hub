# Provisioning

> **Untested on a live tenant.** Scripts are syntax-checked only.

Prerequisites: PowerShell 7+, `Install-Module PnP.PowerShell`, and an Entra ID app registration for interactive PnP sign-in (`Register-PnPEntraIDAppForInteractiveLogin`). Use a Microsoft 365 developer/test tenant.

```powershell
Copy-Item config/environments.sample.json config/environments.json   # git-ignored; edit values
./Deploy-All.ps1 -Environment dev -WhatIf    # preview
./Deploy-All.ps1 -Environment dev
```

All scripts are idempotent. The design lives in `templates/schema.json`; see `docs/architecture.md`.
