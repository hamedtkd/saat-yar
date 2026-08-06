# Windows installation and `npm ci` troubleshooting

Run these commands from the repository root, where `package.json` and `package-lock.json` are located. This guide applies to a fresh clone, a full phase ZIP replacement, and a clean dependency reinstall.

## Fast diagnostic path

```powershell
node --version
npm --version
git status
Test-Path .\package.json
npm config get registry
npm ci
npm run check:dependencies
```

The repository expects Node.js `22.x`, an intact lockfile, and a successful direct-dependency preflight after installation.

## Wrong Node.js version

```powershell
node --version
where.exe node
```

If multiple Node.js installations are listed, the first executable on `PATH` wins. Close every terminal after changing Node.js, open a new one, and verify the version again.

```powershell
npm ci
npm run check:dependencies
```

## Incomplete install or `Cannot find module`

Do not patch individual files inside `node_modules`. Stop active Node processes and perform a clean reinstall:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm cache verify
npm ci
npm run check:dependencies
```

Do not delete `package-lock.json` merely to work around a broken install. The release pipeline relies on the exact locked dependency tree.

## `E404` while downloading a package

Inspect the active registry:

```powershell
npm config get registry
npm config list
```

Common causes include an incomplete corporate registry mirror, proxy/VPN redirection, stale registry metadata, or organization policy that blocks the public registry.

Recommended response:

1. Record the package name, version, and URL from the first `E404`.
2. Confirm that the active registry is the one your environment is supposed to use.
3. Do not edit resolved package URLs in `package-lock.json` as an undocumented workaround.
4. When public npm is allowed, override the registry for that installation only:

```powershell
npm ci --registry=https://registry.npmjs.org
```

5. When a corporate registry is mandatory, the missing package must be mirrored or fixed there.

## `EPERM`, `EBUSY`, and locked files

Node.js, a dev server, Chromium, antivirus software, or a file indexer may still own a handle:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process chrome,msedge,chromium -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm ci
```

If the problem remains, close VS Code and other terminals, avoid a concurrently synchronized OneDrive folder, inspect antivirus or Controlled Folder Access, and retry after a restart.

A cleanup `EPERM` warning is not automatically an install failure. Use the final `npm ci` exit code and `npm run check:dependencies` as the acceptance criteria.

## Stale `.git/index.lock`

Close every Git operation and commit editor, then check for active Git processes:

```powershell
Get-Process git* -ErrorAction SilentlyContinue
```

Only when no Git command is active and the lock came from an earlier crash:

```powershell
Remove-Item .\.git\index.lock
git status
```

Never remove the lock while a real commit, rebase, merge, or Git GUI operation is running.

## Build failure after applying a phase ZIP

Keep the existing `.git` directory. Copy the new source over the repository instead of deleting the entire working directory.

```powershell
Test-Path .\.git
Test-Path .\package.json
git status
```

Then remove generated build caches and rerun the locked install:

```powershell
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm ci
npm run check:quality
```

These generated folders are not the user's IndexedDB product data.

## Production smoke test cannot find a browser

Set an explicit executable for the current PowerShell session:

```powershell
$env:SAATYAR_BROWSER_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run test:browser:production
```

Edge example:

```powershell
$env:SAATYAR_BROWSER_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm run test:browser:production
```

The script searches Chrome, Edge, and Chromium by default. A short-lived temporary profile lock after a successful smoke test is treated as cleanup evidence rather than a product failure.

## Notifications do not appear

- Serve the application through local HTTP or HTTPS; opening build files with `file://` is not sufficient.
- Inspect the browser's site permission for notifications.
- After a denial, the browser may require a manual Site Settings change before prompting again.
- Notification and PWA behavior differs by browser and operating system. See the [browser compatibility matrix](./BROWSER_COMPATIBILITY.md).

## Data is missing after changing browser or URL

IndexedDB is isolated by browser profile and origin. These addresses do not share the same local database:

```text
http://localhost:3000
http://localhost:5173
https://saat-yar.vercel.app
```

Export a backup from the old origin and restore it on the new origin. Clearing site data, private browsing, and changing browser profiles can make local data unavailable.

## Final verification before commit and push

```powershell
npm run check:quality
npm run check:release
git diff --check
git status
```

When reporting an installation failure, include the Node.js and npm versions, the exact command, the first meaningful error, the active npm registry for download failures, and `git status`.
