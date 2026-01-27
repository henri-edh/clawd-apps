#!/usr/bin/env node
/**
 * Auto-push git changes for Badger's build zone
 * Runs via cron to ensure frequent GitHub backups
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_PATH = '/Users/henrijohnson/clawd/projects/clawd';

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { cwd: REPO_PATH, encoding: 'utf-8', ...options });
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${err.message}`);
  }
}

function hasChanges() {
  try {
    const status = exec('git status --porcelain');
    return status.trim().length > 0;
  } catch (err) {
    console.error('Error checking git status:', err.message);
    return false;
  }
}

function getCurrentTime() {
  return new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
}

function getCommitMessage() {
  // Check if there's a custom message in a temporary file
  const msgPath = path.join(REPO_PATH, '.commit-message.txt');
  if (fs.existsSync(msgPath)) {
    const msg = fs.readFileSync(msgPath, 'utf-8').trim();
    fs.unlinkSync(msgPath);
    return msg;
  }

  // Generate automatic message based on changes
  const changes = exec('git status --short');

  if (changes.includes('new file')) {
    const newFiles = [...changes.matchAll(/new file:\s+(.+)/g)].map(m => m[1].trim());
    return `feat: ${newFiles.length} new file${newFiles.length > 1 ? 's' : ''} added`;
  }

  if (changes.includes('modified')) {
    const modified = [...changes.matchAll(/modified:\s+(.+)/g)].map(m => m[1].trim());
    return `update: ${modified.length} file${modified.length > 1 ? 's' : ''} modified`;
  }

  if (changes.includes('deleted')) {
    const deleted = [...changes.matchAll(/deleted:\s+(.+)/g)].map(m => m[1].trim());
    return `chore: ${deleted.length} file${deleted.length > 1 ? 's' : ''} removed`;
  }

  return `chore: Auto-sync at ${getCurrentTime()}`;
}

async function main() {
  console.log(`[${getCurrentTime()}] Checking for changes...`);

  if (!hasChanges()) {
    console.log('No changes to push.');
    process.exit(0);
  }

  console.log('Changes detected. Committing and pushing...');

  try {
    // Stage all changes
    exec('git add .');

    // Commit with automatic message
    const message = getCommitMessage();
    exec(`git commit -m "${message}"`);

    // Push to GitHub
    exec('git push');

    console.log(`✅ Successfully pushed to GitHub: ${message}`);
  } catch (err) {
    console.error(`❌ Failed to push: ${err.message}`);
    process.exit(1);
  }
}

main();
