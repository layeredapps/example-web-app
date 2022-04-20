NODE_ENV=testing \
GENERATE_SCREENSHOTS=true \
SCREENSHOT_PATH=/home/appstore-project/workspace/dashboard/layeredapps.github.io/screenshots/example-web-app \
PORT=9200 \
APPLICATION_SERVER=http://localhost:3000 \
APPLICATION_SERVER_TOKEN=token \
DASHBOARD_SERVER=http://localhost:9200 \
START_APPLICATION_SERVER=false \
APPLICATION_SERVER_PORT=3000 \
node --expose-gc --max-old-space-size=2048 ./node_modules/.bin/mocha --file test-helper.js --timeout 480000 --ignore 'node_modules/hpagent/**/*' --slow 480000 --recursive --extension .test.js . 2>&1 | tee tests.txt