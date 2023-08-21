#!/bin/bash

root="$(pwd)"

echo "Setting up project"

echo "Installing dependencies"
nvm use
npm ci

echo "Setting up git hooks"
ln -s "$root/scripts/hooks" "$root/.git/hooks"

echo "Project setup complete"