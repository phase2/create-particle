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

/* 
 * Function fetches the tags off the repository and then pulls
 * the latest tag, rather than the current HEAD of master.
 */

const checkoutLatestTag = () => {
  console.log('Checking out latest tag');
  spawnSync('git', ['fetch', '--tags'], options);
  const pullTag = spawnSync('git', ['rev-list', '--tags', '--max-count=1'], {
    cwd: folder,
  });
  const tagHash = pullTag.output[1].toString('utf8');
  console.log(tagHash);
  const describeTag = spawnSync(
    'git',
    ['describe', '--tags', tagHash],
    options,
  );
  // const tagName = describeTag.output[1].toString('utf8');
  console.log(describeTag.output);
};

/*
 * npm commands must be run synchronously.
 * `npm run setup` utilizes dependencies initialized with `npm install`
 */

const setupParticle = () => {
  spawn('rm', ['-rf', '.git/'], options);
  console.log('Running Particle dependency installation...');
  spawnSync('npm', ['install'], options);
  console.log('Running Particle setup...');
  spawnSync('npm', ['run', 'setup'], options);
};

console.log('Cloning Particle repo...');
clone('https://github.com/phase2/particle', folder, {}, checkoutLatestTag);
