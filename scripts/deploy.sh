#!/bin/bash
ROOT="$(pwd)"
CURRENT_BRANCH=$(git branch --show-current)

source ~/.nvm/nvm.sh
nvm use

echo "Deploying MAIN branch to production"

git checkout main
git pull

git checkout production
git pull
git merge --no-edit main

npm ci
npm run build

# Run tests
./hooks/pre-commit

git add -f "$ROOT/public/*"
git commit -m "Deploying to production"

if [ $? -eq 0 ]; then
    echo "Deploying to production"
    git push
    git checkout $CURRENT_BRANCH
	echo -e "\033[32mDeployment completed \033[0m"

    exit 0
else
    echo -e "\033[41mCOMMIT FAILED:\033[0m There was an error while commiting the latest version to production.\n"
    git checkout -- .

    git checkout $CURRENT_BRANCH
    exit 1
fi
