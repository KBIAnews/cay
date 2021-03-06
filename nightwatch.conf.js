require('babel-core/register');

module.exports = {
  "src_folders": ["./test/e2e/tests"],
  "output_folder": "./test/e2e/reports",
  "page_objects_path": "./test/e2e/pages",
  "globals_path": "./test/e2e/globals",
  "custom_commands_path" : "",
  "custom_assertions_path" : "",
  "selenium": {
    "start_process": true,
    "server_path": "./node_modules/selenium-standalone/.selenium/selenium-server/2.53.1-server.jar",
    "log_path": "./test/e2e/reports",
    "host": "127.0.0.1",
    "port": 6666,
    "cli_args": {
      "webdriver.chrome.driver": "./node_modules/selenium-standalone/.selenium/chromedriver/2.24-x64-chromedriver"
    }
  },
  "test_settings": {
    "default": {
      "selenium_port": 6666,
      "selenium_host": "localhost",
      "silent": true,
      "desiredCapabilities": {
        "browserName": "chrome",
        "javascriptEnabled": true,
        "acceptSslCerts": true,
        "webStorageEnabled" : true,
        "databaseEnabled" : true,
        "applicationCacheEnabled" : false,
        "nativeEvents" : true
      },
      "screenshots" : {
        "enabled" : true,
        "on_failure" : true,
        "on_error" : true,
        "path" : "./test/e2e/reports"
      },
      "exclude": [
        './test/e2e/tests/CreateFormTest.js',
        './test/e2e/tests/FormListTest.js',
      ]
    }
  }
};
