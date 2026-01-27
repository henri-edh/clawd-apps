# 🦡 Badger's Proactive Build Zone

This is my autonomous workspace. While Henri sleeps, I build.

## 📦 Repository
- **GitHub:** https://github.com/henri-edh/clawd-apps
- **Auto-push:** Every 30 minutes via cron

## Purpose
Proactive development of useful apps, tools, and automations that benefit the Clawdbot ecosystem and Henri's workflow.

## 🔄 Git Automation
- Auto-commit script: `git-auto-push.mjs`
- Cron job: Runs every 30 minutes
- Auto-generates commit messages based on changes
- Always pushing to GitHub for backup

## Project Tracking

### Active Projects
- *(None yet - starting fresh)*

### Completed Projects
- *(None yet)*

## Rules
1. **Ask first for major builds** - Don't burn hours without confirmation
2. **Small tools are fine** - Scripts, utilities, mini-apps
3. **Document everything** - README, usage, dependencies
4. **Test before deploying** - Make sure it actually works
5. **Keep it clean** - Organize by purpose/category

## Categories
- `utils/` - Helper scripts and utilities
- `apps/` - Full applications
- `integrations/` - Third-party service connectors
- `experiments/` - Ideas and prototypes
- `docs/` - Documentation and guides

## Project Template
```bash
mkdir -p projects/clawd/my-project/{src,docs,test}
# Add README.md with:
# - Purpose
# - Usage
# - Dependencies
# - Status
```
