var replace = require("replace");
var version = process.argv.slice(2);

var banner = `/*!
 * Platform.js v<VERSION>
 * Copyright 2014-2018 Benjamin Tan
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license
 */`.replace("<VERSION>", version);

replace({
  regex: /\/\*!(\*(?!\/)|[^*])*\*\//g,
  replacement: banner,
  paths: ['platform.js'],
  recursive: false,
  silent: false
});
