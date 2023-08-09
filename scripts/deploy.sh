git checkout production
git pull
git merge main

npm run build

git add -f public
git commit -m "Deploying to production"
git push