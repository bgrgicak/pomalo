#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

echo "Deploying MAIN branch to production"

git checkout main
git pull

git checkout production
git pull
git merge --no-edit main

npm ci
npm run build

git add -f public/
git commit -m "Deploying to production"
git push

git checkout $CURRENT_BRANCH
