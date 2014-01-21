var platform = require('../platform'),
	testUA = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
	parsed = platform.parse(testUA);

console.log(parsed.os.toString());
console.log(parsed.os.version === '8.1');
