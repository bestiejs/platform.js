var replace = require('replace');
var version = process.argv[2];

var banner = `/*!
 * Platform.js v${version}
 * Copyright 2014-2020 Benjamin Tan
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license
 */`;

replace({
  'regex': /\/\*!(\*(?!\/)|[^*])*\*\//,
  'replacement': banner,
  'paths': ['platform.js'],
  'recursive': false,
  'silent': false
});
