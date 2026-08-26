# Deployment

Cloudflare builds this repository from GitHub.

Production branch: `main`

Preview branches are used for validation before promotion. The build command is:

```text
npm run build
```

which executes the base site generator, supplemental authority content generator, and validation guard.
