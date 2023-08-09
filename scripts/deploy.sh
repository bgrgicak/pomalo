#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

git checkout production
git pull
git merge $CURRENT_BRANCH

npm run build

git add -f public
git commit -m "Deploying to production"
git push

git checkout $CURRENT_BRANCH
