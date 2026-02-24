# Ultracite Setup Guide

This project uses **Ultracite** (v6.5.1) with **Biome** (v2.3.10) - a lightning-fast linting and formatting tool built in Rust.

## What is Ultracite?

Ultracite is a CLI wrapper around Biome that provides:
- ⚡ **Lightning-fast** linting and formatting (written in Rust)
- 🎯 **Zero configuration** - works out of the box
- 🔧 **Single tool** replaces ESLint + Prettier
- 🤖 **AI-ready** - designed for AI coding assistants
- 📦 **Minimal dependencies** - only 2 packages vs 10+ for ESLint/Prettier

## Installation

Dependencies are already installed in this project:

```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.3.10",
    "ultracite": "^6.5.1",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11"
  }
}
```

To install dependencies:

```bash
pnpm install
```

## Configuration

The project uses `biome.json` at the root with custom configuration optimized for Next.js + Node.js backend:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.10/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git"
  },
  "files": {
    "include": [
      "src/**/*.{js,jsx,ts,tsx,json,jsonc}",
      "backend/**/*.{js,ts,json}",
      "models/**/*.{js,ts,json}",
      "packages/**/*.{js,ts,json}",
      "types/**/*.{ts,d.ts}"
    ],
    "ignore": [
      "node_modules",
      ".next",
      "dist",
      "coverage",
      "logs",
      "mysql"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Note:** Biome 2.x does not support `extends` for external presets. The configuration is now inlined with sensible defaults for your stack.

### Covered Directories

- ✅ `src/**` - Next.js frontend code
- ✅ `backend/**` - Node.js/TypeScript backend
- ✅ `models/**` - Sequelize models
- ✅ `packages/**` - Shared packages
- ✅ `types/**` - TypeScript type definitions

### Ignored Directories

- ❌ `node_modules`, `.next`, `dist`, `build`
- ❌ `coverage`, `.pnpm-store`
- ❌ `public/uploads`, `logs`

## Usage

### Check for Issues (Lint)

Check all files for linting issues without fixing them:

```bash
pnpm lint
```

This runs: `ultracite check`

### Format Code

Format all files and write changes:

```bash
pnpm format
```

This runs: `ultracite format --write`

### Auto-Fix Issues

Automatically fix linting and formatting issues:

```bash
pnpm fix
```

This runs: `ultracite fix` (equivalent to format + lint --fix)

### Check Formatting (without writing)

To check if files are formatted correctly (useful in CI):

```bash
pnpm format --check
```

## Pre-commit Hooks

The project uses **Husky** + **lint-staged** to automatically lint staged files before commit.

### How it Works

When you run `git commit`, the pre-commit hook automatically:
1. Finds all staged `.js`, `.jsx`, `.ts`, `.tsx`, `.json` files
2. Runs `ultracite check` on those files only
3. Blocks the commit if issues are found

### Hook Location

`.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

### Lint-staged Configuration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,jsonc}": [
      "ultracite fix"
    ]
  }
}
```

This automatically formats and fixes linting issues on staged files before commit.

### Skip Pre-commit Hook (Not Recommended)

If you need to bypass the pre-commit hook (emergency only):

```bash
git commit --no-verify -m "emergency fix"
```

## CI/CD Integration

The project includes a GitHub Actions workflow at `.github/workflows/lint.yml`:

```yaml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format --check
```

This ensures all PRs and commits are linted before merging.

## Migration from ESLint/Prettier

The old linting tools are still available (but deprecated):

```bash
# Old ESLint (deprecated)
pnpm lint:old

# Old Prettier (deprecated)
pnpm format:old
```

**Recommendation:** Use the new `pnpm lint` and `pnpm format` commands instead.

To completely remove ESLint/Prettier:

```bash
# Remove old config files (optional)
rm .eslintrc.json .eslintignore prettier.config.js .prettierrc .prettierignore

# Remove old dependencies (optional, but not recommended until fully migrated)
# pnpm remove eslint prettier @typescript-eslint/eslint-plugin ...
```

## Editor Integration

### VS Code

Install the Biome extension:

```bash
code --install-extension biomejs.biome
```

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### Other Editors

- **Zed**: Built-in Biome support
- **WebStorm/IntelliJ**: Use Biome plugin
- **Neovim**: Use `biome-lsp`

## Troubleshooting

### Issue: `ultracite: command not found`

**Cause:** Dependencies not installed.

**Fix:**
```bash
pnpm install
```

### Issue: Pre-commit hook not running

**Cause:** Husky not initialized or hook not executable.

**Fix:**
```bash
# Initialize Husky
pnpm prepare

# Make hook executable
chmod +x .husky/pre-commit
```

### Issue: Linting errors in legacy code

**Cause:** Existing code may not follow Biome's strict rules.

**Fix:**

1. **Auto-fix most issues:**
   ```bash
   pnpm fix
   ```

2. **If auto-fix doesn't resolve everything:**
   - Review errors: `pnpm lint`
   - Fix manually or adjust rules in `biome.json`

3. **Temporarily disable specific rules** (if needed):
   ```json
   {
     "linter": {
       "rules": {
         "suspicious": {
           "noExplicitAny": "off"
         }
       }
     }
   }
   ```

### Issue: Slow performance on large files

**Cause:** Biome is very fast, but extremely large files (>10k lines) may slow down.

**Fix:**
- Add specific files to `files.ignore` in `biome.json`
- Break large files into smaller modules

### Issue: Format check fails in CI

**Cause:** Local formatting differs from CI.

**Fix:**
```bash
# Format all files locally
pnpm format

# Commit the changes
git add .
git commit -m "chore: format code with ultracite"
```

## Production Impact

**Important:** Ultracite is a **development-only** tool. It does NOT affect production runtime.

- ✅ Only in `devDependencies`
- ✅ Not included in Docker production image (Dockerfile.prod)
- ✅ Not part of `pnpm build` or `pnpm start`
- ✅ Zero impact on Next.js client bundle size
- ✅ Zero impact on backend runtime

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm lint` | Check for linting issues |
| `pnpm format` | Format code and write changes |
| `pnpm fix` | Auto-fix linting + formatting |
| `pnpm format --check` | Check if formatted (CI) |
| `pnpm lint:old` | Legacy ESLint (deprecated) |
| `pnpm format:old` | Legacy Prettier (deprecated) |

## Learn More

- **Ultracite Docs**: https://www.ultracite.ai/
- **Biome Docs**: https://biomejs.dev/
- **GitHub**: https://github.com/haydenbleasel/ultracite

---

**Last Updated:** 2025-12-31
**Ultracite Version:** 6.5.1
**Biome Version:** 2.3.10
