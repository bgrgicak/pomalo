#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

echo "Deploying MAIN branch to production"

git checkout main
git pull

git checkout production
git pull
git merge main

npm run build

git add -f public
git commit --no-verify -m "Deploying to production"
git push

git checkout $CURRENT_BRANCH
