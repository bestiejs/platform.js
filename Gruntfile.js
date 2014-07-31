module.exports = function (grunt) {
  var request = require('request');

  var user = process.env.SAUCE_USERNAME;
  var pass = process.env.SAUCE_ACCESS_KEY;

  grunt.initConfig({
    'http-server': {
      'dev': {
        root: './',
        port: 8282,
        host: "127.0.0.1",
        showDir: true,
        autoIndex: true,
        defaultExt: "html",
        runInBackground: true
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          username: user,
          key: pass,
          urls: ['http://127.0.0.1:8282/test/index.html'],
          testname: 'Platform.js tests',
          browsers: [
            {
              browserName: 'firefox',
              version: '19',
              platform: 'XP'
            }
          ],
          onTestComplete: function (result, callback) {
            //Update Sauce Labs build status
            request.put({
              url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
              auth: {
                user: user,
                pass: pass
              },
              json: {
                passed: result.passed
              }
            }, function (error, response, body) {
              if (error) {
                callback(error);
              } else if (response.statusCode !== 200) {
                callback(new Error('Unexpected response status'));
              } else {
                callback(null, result.passed);
              }
            });
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('saucelabs', ['http-server', 'saucelabs-qunit']);
};