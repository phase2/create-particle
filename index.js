#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const clone = require('git-clone');

// Run script via `npx phase2/create-particle <folder-name>`
const folder = process.argv.slice(2)[0];

// Exit from the process if no folder argument is passed
if (!folder) {
  console.log('You must pass a folder as an argument.');
  process.exit(1);
}

const options = { cwd: folder, stdio: 'inherit' };

// Removes the \n from the stringified buffer
const extractHash = buffer => {
  const arr = buffer.toString('utf8').split('\n');
  return arr[0];
};

/* 
 * Function fetches the tags off the repository and then pulls
 * the latest tag, rather than the current HEAD of master.
 */

const checkoutLatestTag = () => {
  console.log('Checking out latest tag...');
  // Make sure to fetch the tags to pull the latest
  spawnSync('git', ['fetch', '--tags'], options);

  // Pull the latest tag from the repository
  const pullTag = spawnSync('git', ['rev-list', '--tags', '--max-count=1'], {
    cwd: folder,
  });
  const tagHash = extractHash(pullTag.output[1]);

  // Checkout the local repo to the latest tag
  spawnSync('git', ['checkout', tagHash], { cwd: folder });
};

/*
 * npm commands must be run synchronously.
 * `npm run setup` utilizes dependencies initialized with `npm install`
 */

const setupParticle = () => {
  // This function must complete before the subsequent installs can be ran.
  checkoutLatestTag();

  spawn('rm', ['-rf', '.git/'], options);
  console.log('Running Particle dependency installation...');
  spawnSync('npm', ['install'], options);
  console.log('Running Particle setup...');
  spawnSync('npm', ['run', 'setup'], options);
};

console.log('Cloning Particle repo...');
clone('https://github.com/phase2/particle', folder, {}, setupParticle);
