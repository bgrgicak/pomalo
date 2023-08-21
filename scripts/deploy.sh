#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

echo "Deploying MAIN branch to production"

git checkout main
git pull

git checkout production
git pull
git merge --no-edit main

nvm use
npm ci
npm run build

git commit -am "Deploying to production"

if [ $? -eq 0 ]; then
    echo "Deploying to production"
    git push
    git checkout $CURRENT_BRANCH

    exit 0
else
    echo "Failed to deploy to production"
    git checkout -- .

    git checkout $CURRENT_BRANCH
    exit 1
fi
