var replace = require("replace");
var version = process.argv.slice(2);

var banner = `/*!
 * Platform.js v<VERSION> <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */`.replace("<VERSION>", version);

replace({
  regex: /\/\*!(\*(?!\/)|[^*])*\*\//g,
  replacement: banner,
  paths: ['platform.js'],
  recursive: false,
  silent: false
});
