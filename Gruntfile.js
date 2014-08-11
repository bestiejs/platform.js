module.exports = function(grunt) {
  var http = require('http'),
      send = require('send');

  var user = process.env.SAUCE_USERNAME;
  var pass = process.env.SAUCE_ACCESS_KEY;

  var server = http.createServer(function() {
    send(req, req.url).pipe(res);
  });

  grunt.initConfig({
    'saucelabs-qunit': {
      options: {
        username: user,
        key: pass,
        urls: ['http://127.0.0.1:8080/test/index.html'],
        testname: 'Platform.js Tests',
        browsers: [
          {
            browserName: 'firefox',
            version: '19',
            platform: 'XP'
          }
        ]
      }
    },
    'shell': {
      'options': {
        'stdout': true,
        'stderr': true,
        'failOnError': true
      },
      'cover-html': {
        'command': 'istanbul cover --report "html" --verbose --dir "coverage" "test/test.js"'
      },
      'cover-coveralls': {
        'command': 'istanbul cover --verbose --dir "coverage" "test/test.js" && cat coverage/lcov.info | coveralls; rm -rf coverage/lcov*'
      },
      'test-narwhal': {
        'command': 'echo "Testing in Narwhal..."; export NARWHAL_OPTIMIZATION=-1; narwhal "test/test.js"'
      },
      'test-phantomjs': {
        'command': 'echo "Testing in PhantomJS..."; phantomjs "test/test.js"'
      },
      // Rhino 1.7R4 has a bug that makes it impossible to test in.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=775566
      // To test, use Rhino 1.7R3, or wait for the 1.7R5 release.
      'test-rhino': {
        'command': 'echo "Testing in Rhino..."; rhino -opt -1 "test.js"',
        'options': {
          'execOptions': {
            'cwd': 'test'
          }
        }
      },
      'test-ringo': {
        'command': 'echo "Testing in Ringo..."; ringo -o -1 "test/test.js"'
      },
      'test-node': {
        'command': 'echo "Testing in Node..."; node "test/test.js"'
      },
      'test-browser': {
        'command': 'echo "Testing in a browser..."; open "test/index.html"'
      }
    }
  });

  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('server-start', function() {
    var done = this.async();
    server.listen(8080, function() {
      grunt.log.ok('Server listening on port 8080.');
      done();
    });
  });

  grunt.registerTask('server-stop', function() {
    var done = this.async();
    server.close(function() {
      grunt.log.ok('Server listening on port 8080.');
      done();
    });
  });


  grunt.registerTask('cover', 'shell:cover-html');

  grunt.registerTask('coveralls', 'shell:cover-coveralls');

  grunt.registerTask('test', [
    'shell:test-narwhal',
    'shell:test-phantomjs',
    'shell:test-rhino',
    'shell:test-ringo',
    'shell:test-node',
    'shell:test-browser'
  ]);

  grunt.registerTask('saucelabs', [
    'server-start',
    'saucelabs-qunit',
    'server-stop'
  ]);
};
