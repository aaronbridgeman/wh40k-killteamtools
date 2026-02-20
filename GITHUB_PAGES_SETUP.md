# GitHub Pages Setup Guide

This document explains how to enable GitHub Pages for this repository to allow automatic deployments from the GitHub Actions workflow.

## Problem

The deployment workflow fails with a 404 error:
```
Failed to create deployment (status: 404) ... Ensure GitHub Pages has been enabled
```

This occurs because GitHub Pages is not enabled in the repository settings.

## Solution

To fix the deployment failure, GitHub Pages must be enabled with the correct source configuration.

### Steps to Enable GitHub Pages

1. **Navigate to Repository Settings**
   - Go to `https://github.com/aaronbridgeman/wh40k-killteamtools/settings/pages`
   - Or: Repository → Settings → Pages (in the left sidebar)

2. **Configure Build and Deployment**
   - Under "Build and deployment"
   - Set **Source** to: `GitHub Actions`
   - (NOT "Deploy from a branch")

3. **Save Changes**
   - The setting should save automatically
   - No branch selection is needed when using GitHub Actions

4. **Verify Configuration**
   - After saving, you should see a message indicating Pages is set up
   - The next push to `main` branch will trigger a deployment
   - Check the Actions tab to monitor deployment progress

### Expected Result

Once configured:
- Pushes to `main` branch will automatically trigger the deployment workflow
- The workflow will:
  1. Build the application
  2. Run tests and type checks
  3. Upload the built artifacts
  4. Deploy to GitHub Pages
- The site will be available at: `https://aaronbridgeman.github.io/wh40k-killteamtools/`

### Why GitHub Actions Source?

This repository uses the modern GitHub Actions deployment method, which:
- Provides better control over the build process
- Runs tests before deployment
- Supports custom build tools (Vite, TypeScript, React)
- Eliminates the need to commit build artifacts to the repository

### Troubleshooting

If deployment still fails after enabling Pages:

1. **Check Permissions**: Ensure the workflow has `pages: write` and `id-token: write` permissions (already configured in `.github/workflows/deploy.yml`)

2. **Verify Workflow**: Check the Actions tab for detailed error messages

3. **Branch Protection**: Ensure branch protection rules don't block the deployment

4. **Repository Visibility**: Pages works with both public and private repositories (with GitHub Pro/Team)

## Technical Details

### Build Output

- Build tool: Vite
- Output directory: `docs/`
- Base path: `/wh40k-killteamtools/`
- Entry point: `docs/index.html`

### Workflow Configuration

The deployment is configured in `.github/workflows/deploy.yml`:
- **Build Job**: Compiles the application and creates an artifact
- **Deploy Job**: Uploads the artifact to GitHub Pages

### .nojekyll File

The build process automatically creates a `.nojekyll` file in the output directory. This prevents GitHub Pages from processing the site with Jekyll, which is important for Single Page Applications (SPAs) that use client-side routing.
