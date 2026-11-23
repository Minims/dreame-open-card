---
name: hacs-release
description: Use when publishing, packaging, or creating a new HACS release or tag for dreame-open-card.
---

# HACS Release Workflow

Follow these steps to build and publish an official HACS release of `dreame-open-card`:

## 1. Pre-Release Quality Checks

Run the automated test suite and ensure zero regressions:

```bash
npm test && node --check dreame-open-card.js && git status --short
```

Confirm all 32+ tests pass and no uncommitted files exist.

## 2. Update Version Identifiers

Update the version string (e.g. `2026.11.0b`) in:
1. `dreame-open-card.js`:
   ```javascript
   export const CARD_VERSION = "<version>";
   ```
2. `package.json`:
   ```json
   "version": "<version>"
   ```
3. `README.md`: update the installation version reference.

## 3. Commit and Push

Commit the version bump and push to `main`:

```bash
git add dreame-open-card.js package.json README.md docs/preview.png
git commit -m "release: <version>"
git push origin main
```

## 4. Create and Push Git Tag

Create an annotated git tag matching the release version:

```bash
git tag -a <version> -m "Dreame Open Card <version>"
git push origin <version>
```

## 5. Publish GitHub Release with Attached Asset

HACS requires the built standalone `dreame-open-card.js` bundle to be attached as an asset to the GitHub release:

```bash
gh release create <version> dreame-open-card.js --title "Dreame Open Card <version>" --notes "Release notes summary..."
```

## 6. Verification

Verify the release is available on GitHub:

```bash
gh release view <version>
```

In Home Assistant:
Go to **HACS → Dashboards → Dreame Open Card** to confirm the update is discovered.
