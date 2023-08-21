#!/bin/bash

root="$(pwd)"

echo "Setting up project"

echo "Installing dependencies"
npm install -g nvm
nvm use
npm ci

echo "Setting up git hooks"
ln -s "$root/scripts/hooks/pre-commit" "$root/.git/hooks"

echo "Project setup complete"