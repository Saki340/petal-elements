<!-- catalog-only-start --><!-- ---
name: Releasing
title: Releasing
order: 11
-----><!-- catalog-only-end -->

# Releasing

How a version of petal-elements is published. Only maintainers do this.

## One-time setup

1.  On GitHub, in the repository settings:
    *   Pages > Build and deployment > Source: "GitHub Actions" (for the
        catalog, `.github/workflows/catalog.yml`).
    *   Environments: create `npm`, and add required reviewers so that every
        publish waits for approval.
    *   Security: turn on private vulnerability reporting (see SECURITY.md).
2.  On npmjs.com, in the package settings, add a Trusted Publisher: GitHub
    Actions, user `Saki340`, repository `petal-elements`, workflow
    `release.yml`, environment `npm`, with `npm publish` allowed. The release
    workflow then publishes with OIDC, and no npm token is stored on GitHub.
    Publish within 2 days of saving it, or the setting expires.
3.  Run the "Visual baselines" workflow once and commit the Linux baseline it
    produces (see [Visual testing](visual-testing.md)).

## Each release

1.  Update `CHANGELOG.md`: move the entries from "unreleased" to the new
    version with the date.
2.  Set `version` in `package.json` (and run `npm install` so that
    `package-lock.json` follows).
3.  Check locally:

    ```sh
    npm ci
    npm run check:licenses
    npm run check:rebrand
    npm run build
    npm run check:tokens
    npm test
    npm run test:visual
    npm pack --dry-run   # look at the file list
    ```

4.  Commit, then tag and push:

    ```sh
    git tag v0.2.0
    git push origin main v0.2.0
    ```

5.  The "Release" workflow (`.github/workflows/release.yml`) runs the checks
    again and publishes to npm through trusted publishing, after approval in
    the `npm` environment; npm adds provenance itself. It fails if the tag
    does not match `package.json`.
6.  Create a GitHub release for the tag with the changelog entries.

## What is published

The npm package contains the compiled components (`*.js`, `*.d.ts`, `*.css`),
the Sass sources (`*.scss`), the token files (`tokens/css/`,
`tokens/dtcg/web/`, `tokens/sources.json`), `custom-elements.json`, `LICENSE`,
`NOTICE` and the READMEs. Tests, scripts, docs and the catalog are not
published; see `files` in `package.json`.
