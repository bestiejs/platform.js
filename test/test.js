;(function(window) {
  'use strict';

  /** Use a single load function */
  var load = typeof require == 'function' ? require : window.load;

  /** The `platform` object to test */
  var platform =
    window.platform ||
    load('../platform.js') ||
    window.platform;

  /** The unit testing framework */
  var QUnit =
    window.QUnit || (
      window.setTimeout || (window.addEventListener = window.setTimeout = / /),
      window.QUnit = load('../vendor/qunit/qunit/qunit' + (platform.name == 'Narwhal' ? '-1.8.0' : '') + '.js') || window.QUnit,
      load('../vendor/qunit-clib/qunit-clib.js'),
      (window.addEventListener || 0).test && delete window.addEventListener,
      window.QUnit
    );

  /*--------------------------------------------------------------------------*/

  /**
   * An iteration utility for arrays.
   *
   * @private
   * @param {Array} object The array to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(array, callback) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      callback(array[index], index, array);
    }
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      hasKey(object, key) && callback(object[key], key, object);
    }
  }

  /**
   * Checks if an object has the specified key as a direct property.
   *
   * @private
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */
  function hasKey(object, key) {
    var o = {},
        hasOwnProperty = o.hasOwnProperty,
        parent = object != null && (object.constructor || Object).prototype,
        result = false;

    if (parent) {
      // for modern browsers
      object = Object(object);
      if (typeof hasOwnProperty == 'function') {
        result = hasOwnProperty.call(object, key);
      }
      // for Safari 2
      else if (o.__proto__ == Object.prototype) {
        object.__proto__ = [object.__proto__, object.__proto__ = null, result = key in object][0];
      }
      // for others (not as accurate)
      else {
        result = key in object && !(key in parent && object[key] === parent[key]);
      }
    }
    return result;
  }

  /**
   * Modify a string by replacing named tokens with matching object property values.
   *
   * @private
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */
  function interpolate(string, object) {
    forOwn(object || {}, function(value, key) {
      string = string.replace(RegExp('#\\{' + key + '\\}', 'g'), value);
    });
    return string;
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
   *
   * @private
   * @param {Mixed} object The owner of the property.
   * @param {String} property The property to check.
   * @returns {Boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Returns a platform object of a simulated environment.
   *
   * @private
   * @param {Object} options The options object to simulate environment objects.
   * @returns {Object} The modified string.
   */
  var getPlatform = (function() {
    var code,
        result,
        xhr;

    if (window.document) {
      if (isHostType(window, 'ActiveXObject')) {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      } else if (isHostType(window, 'XMLHttpRequest')) {
        xhr = new XMLHttpRequest;
      }
      each(document.getElementsByTagName('script'), function(element) {
        var src = element.src;
        if (/platform\.js$/.test(src)) {
          xhr.open('get', src + '?t=' + (+new Date), false);
          xhr.send(null);
          code = xhr.responseText;
        }
      });
    }
    else {
      try {
        // Node.js
        code = require('fs').readFileSync('../platform.js');
      } catch(e) {
        // Narwhal, Rhino, and Ringo
        code = readFile('../platform.js');
      }
    }
    return Function('options',
      ('return ' +
      /\(function[\s\S]+?(?=if\s*\(typeof define)/.exec(code)[0] +
      ' return parse()}(this))')
        .replace('/internal|\\n/i.test(toString.toString())', '!me.likeChrome')
        .replace(/(function\s*\(\s*window\s*\)[^\n]+\n)/, '$1me=options;\n')
        .replace(/\bvar thisBinding\s*=[^\n]+?(;\n)/, '')
        .replace(/\boldWin\s*=[^\n]+?(;\n)/, 'oldWin=options$1')
        .replace(/\bfreeGlobal\s*=(?:.|\n)+?(;\n)/, 'freeGlobal=options.global$1')
        .replace(/\buserAgent\s*=[^\n]+?(;\n)/, 'userAgent=me.ua$1')
        .replace(/\b(?:thisBinding|window)\b/g, 'me')
        .replace(/([^.])\bsystem\b/g, '$1me.system')
        .replace(/\bgetClassOf\(opera\)/g, 'opera&&opera["[[Class]]"]')
        .replace(/\b(?:Environment|RuntimeObject|ScriptBridgingProxyObject)\b/g, 'Object')
        .replace(/\bnav\.appMinorVersion/g, 'me.appMinorVersion')
        .replace(/\bnav\.cpuClass/g, 'me.cpuClass')
        .replace(/\bnav\.platform/g, 'me.platform')
        .replace(/\bexports\b/g, 'me.exports')
        .replace(/\bexternal/g, 'me.external')
        .replace(/\bprocess\b/g, 'me.process')
        .replace(/\brequire\b/g, 'me.require')
        .replace(/\bdoc\.documentMode/g, 'me.mode'));
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * An object of UA variations.
   *
   * @type Object
   */
  var Tests = {
    'Adobe AIR 2.5 (like Safari 4.x) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; en-US) AppleWebKit/531.9 (KHTML, like Gecko) AdobeAIR/2.5',
      'layout': 'WebKit',
      'name': 'Adobe AIR',
      'os': 'Windows XP',
      'runtime': { 'flash': { 'system': { 'Capabilities': { 'os': 'Windows XP' }}}},
      'version': '2.5'
    },

    'Android Browser (like Safari 4.x) on Android 2.1': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; Sprint APA9292KT Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko)',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'os': 'Android 2.1'
    },

    'Android Browser (like Chrome 8.0) on Asus Transformer': {
      'ua': 'Mozilla/5.0 (Linux; U; Linux Ventana; en-us; Transformer TF101 Build/HMJ37) AppleWebKit/534.13 (KHTML, like Gecko) Chrome/8.0 Safari/534.13',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'Asus',
      'name': 'Android Browser',
      'os': 'Android',
      'product': 'Transformer'
    },

    'Android Browser (like Safari 4.x) on Sony PlayStation Vita 1.00': {
      'ua': 'Mozilla/5.0 (PlayStation Vita 1.00) AppleWebKit/531.22.8 (KHTML, like Gecko) Silk/3.2',
      'layout': 'WebKit',
      'manufacturer': 'Sony',
      'name': 'Android Browser',
      'product': 'PlayStation Vita 1.00',
      'os': 'Android'
    },

    'Android Browser 3.0.4 (like Chrome 1.x) on Motorola Xoom (Android 3.0)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 3.0; xx-xx; Xoom Build/HRI39) AppleWebKit/525.10+ (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'Motorola',
      'name': 'Android Browser',
      'os': 'Android 3.0',
      'product': 'Xoom',
      'version': '3.0.4'
    },

    'Android Browser 3.1.2 (like Safari 4.x) on Android 1.6': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 1.6; en-us; HTC_TATTOO_A3288 Build/DRC79) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'os': 'Android 1.6',
      'version': '3.1.2'
    },

    'Android Browser 4.0 (like Chrome 5.x) on Samsung Galaxy S (Android 2.3.3)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3.3; en-gb; GT-I9000 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'Samsung',
      'name': 'Android Browser',
      'os': 'Android 2.3.3',
      'product': 'Galaxy S',
      'version': '4.0'
    },

    'Android Browser 4.0 (like Chrome 5.x) on Samsung Galaxy S2 (Android 2.3)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3; xx-xx; GT-I9100 Build/GRH78) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'Samsung',
      'name': 'Android Browser',
      'os': 'Android 2.3',
      'product': 'Galaxy S2',
      'version': '4.0'
    },

    'Android Browser 4.1#{alpha} (like Chrome 5.x) on Android 2.2.1': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; Nexus One Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.1a Mobile Safari/533.1',
      'layout': 'WebKit',
      'likeChrome': true,
      'name': 'Android Browser',
      'os': 'Android 2.2.1',
      'prerelease': 'alpha',
      'version': '4.1#{alpha}'
    },

    'Arora 0.4 (like Safari 3.x) on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; cs-CZ) AppleWebKit/523.15 (KHTML, like Gecko, Safari/419.3) Arora/0.4 (Change: 333 41e3bc6)',
      'layout': 'WebKit',
      'name': 'Arora',
      'os': 'Linux',
      'version': '0.4'
    },

    'Arora 0.6 (like Safari 4.x) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6 (Change: )',
      'layout': 'WebKit',
      'name': 'Arora',
      'os': 'Windows Server 2008 / Vista',
      'version': '0.6'
    },

    'Arora 0.8.0 (like Safari 4.x) on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; de-DE) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.8.0',
      'layout': 'WebKit',
      'name': 'Arora',
      'os': 'Linux',
      'version': '0.8.0'
    },

    'Avant Browser on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Avant Browser)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Avant Browser',
      'os': 'Windows Server 2008 / Vista'
    },

    'Avant Browser (IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; Avant Browser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Avant Browser',
      'os': 'Windows XP'
    },

    'BlackBerry Browser on BlackBerry 7250 (Device Software 4.0.0)': {
      'ua': 'BlackBerry7250/4.0.0 Profile/MIDP-2.0 Configuration/CLDC-1.1',
      'manufacturer': 'BlackBerry',
      'name': 'BlackBerry Browser',
      'os': 'Device Software 4.0.0',
      'product': 'BlackBerry 7250'
    },

    'BlackBerry Browser on BlackBerry 8900 (Device Software 4.5.1.231)': {
      'ua': 'BlackBerry8900/4.5.1.231 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/100',
      'manufacturer': 'BlackBerry',
      'name': 'BlackBerry Browser',
      'os': 'Device Software 4.5.1.231',
      'product': 'BlackBerry 8900'
    },

    'BlackBerry Browser (like Safari 5.x) on BlackBerry 9800 (Device Software 6.0.0.91)': {
      'ua': 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.1  (KHTML, like Gecko) Version/6.0.0.91 Mobile Safari/534.1 ,gzip(gfe),gzip(gfe)',
      'layout': 'WebKit',
      'manufacturer': 'BlackBerry',
      'name': 'BlackBerry Browser',
      'os': 'Device Software 6.0.0.91',
      'product': 'BlackBerry 9800'
    },

    'Camino 0.7 on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.0.1) Gecko/20030306 Camino/0.7',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X',
      'version': '0.7'
    },

    'Camino 1.0#{beta}2+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.0.1) Gecko/20060119 Camino/1.0b2+',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X',
      'prerelease': 'beta',
      'version': '1.0#{beta}2+'
    },

    'Camino 1.0+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1) Gecko/20061013 Camino/1.0+ (Firefox compatible)',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X',
      'version': '1.0+'
    },

    'Camino 1.1#{alpha}1+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en; rv:1.8.1.1pre) Gecko/20061126 Camino/1.1a1+',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X',
      'prerelease': 'alpha',
      'version': '1.1#{alpha}1+'
    },

    'Camino 1.6#{alpha} on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en; rv:1.8.1.4pre) Gecko/20070511 Camino/1.6pre',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X',
      'prerelease': 'alpha',
      'version': '1.6#{alpha}'
    },

    'Camino 2.0#{beta}3 on Mac OS X 10.5': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en; rv:1.9.0.10pre) Gecko/2009041800 Camino/2.0b3pre (like Firefox/3.0.10pre)',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X 10.5',
      'prerelease': 'beta',
      'version': '2.0#{beta}3'
    },

    'Camino 2.0.3 on Mac OS X 10.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; nl; rv:1.9.0.19) Gecko/2010051911 Camino/2.0.3 (MultiLang) (like Firefox/3.0.19)',
      'layout': 'Gecko',
      'name': 'Camino',
      'os': 'Mac OS X 10.6',
      'version': '2.0.3'
    },

    'Chrome 0.2.149.27 on Windows 2000': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13',
      'layout': 'WebKit',
      'name': 'Chrome',
      'os': 'Windows 2000',
      'version': '0.2.149.27'
    },

    'Chrome 5.0.375.127 on Google TV (Linux i686)': {
      'ua': 'Mozilla/5.0 (X11; U: Linux i686; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.127 Large Screen Safari/533.4 GoogleTV/b39389',
      'layout': 'WebKit',
      'manufacturer': 'Google',
      'name': 'Chrome',
      'os': 'Linux i686',
      'product': 'Google TV',
      'version': '5.0.375.127'
    },

    'Chrome 8.1.0.0 on Ubuntu 10.10 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/540.0 (KHTML, like Gecko) Ubuntu/10.10 Chrome/8.1.0.0 Safari/540.0',
      'layout': 'WebKit',
      'name': 'Chrome',
      'os': 'Ubuntu 10.10 64-bit',
      'version': '8.1.0.0'
    },

    'Chrome 11.0.696.77 on Google TV (Linux armv7l)': {
      'ua': 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.77 Large Screen Safari/534.24 GoogleTV/192312',
      'layout': 'WebKit',
      'manufacturer': 'Google',
      'name': 'Chrome',
      'os': 'Linux armv7l',
      'product': 'Google TV',
      'version': '11.0.696.77'
    },

    'Chrome Mobile 16.0.912.77 on Android 4.0.3': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; HTC Sensation XE with Beats Audio Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.77 Mobile Safari/535.7',
      'layout': 'WebKit',
      'name': 'Chrome Mobile',
      'os': 'Android 4.0.3',
      'version': '16.0.912.77'
    },

    'Chrome Mobile 19.0.1084.60 on Apple iPhone (iOS 5.1.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en-gb) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Chrome Mobile',
      'os': 'iOS 5.1.1',
      'product': 'iPhone',
      'version': '19.0.1084.60'
    },

    'Chrome Mobile (desktop mode) on iOS 4.3+': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.53.11 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'Apple',
      'name': 'Chrome Mobile',
      'os': 'iOS 4.3+'
    },

    'Epiphany 0.9.2 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.4) Gecko/20030908 Epiphany/0.9.2',
      'layout': 'Gecko',
      'name': 'Epiphany',
      'os': 'Linux i686',
      'version': '0.9.2'
    },

    'Epiphany 2.22 on Fedora 2.24.3 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en; rv:1.9.0.8) Gecko/20080528 Fedora/2.24.3-4.fc10 Epiphany/2.22 Firefox/3.0',
      'layout': 'Gecko',
      'name': 'Epiphany',
      'os': 'Fedora 2.24.3 64-bit',
      'version': '2.22'
    },

    'Epiphany 2.30.6 on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7',
      'layout': 'WebKit',
      'name': 'Epiphany',
      'os': 'Linux 64-bit',
      'version': '2.30.6'
    },

    'Firefox 2.0.0.7 on Gentoo': {
      'ua': 'Mozilla/5.0 (X11; U; Linux Gentoo; pl-PL; rv:1.8.1.7) Gecko/20070914 Firefox/2.0.0.7',
	  'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Gentoo',
      'version': '2.0.0.7'
    },

    'Firefox 3.0#{alpha}1 on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.9a1) Gecko/20061204 Firefox/3.0a1',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Mac OS X',
      'prerelease': 'alpha',
      'version': '3.0#{alpha}1'
    },

    'Firefox 3.0 on Debian 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9) Gecko/2008062908 Firefox/3.0 (Debian-3.0~rc2-2)',
	  'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Debian 64-bit',
      'version': '3.0'
    },

    'Firefox 3.0 on SuSE': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; tr-TR; rv:1.9.0) Gecko/2008061600 SUSE/3.0-1.2 Firefox/3.0',
	  'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'SuSE',
      'version': '3.0'
    },

    'Firefox 3.0.1#{alpha} on Linux armv7l': {
      'ua': 'Mozilla/5.0 (X11; U; Linux armv7l; en-US; rv:1.9.0.1) Gecko/2009010915 Minefield/3.0.1',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Linux armv7l',
      'prerelease': 'alpha',
      'version': '3.0.1#{alpha}'
    },

    'Firefox 3.0.13 on Xubuntu 9.04 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; zh-TW; rv:1.9.0.13) Gecko/2009080315 Xubuntu/9.04 (jaunty) Firefox/3.0.13',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Xubuntu 9.04 64-bit',
      'version': '3.0.13'
    },

    'Firefox 3.5.1 on Linux Mint 7 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.1.1) Gecko/20090716 Linux Mint/7 (Gloria) Firefox/3.5.1',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Linux Mint 7 64-bit',
      'version': '3.5.1'
    },

    'Firefox 3.6.7 on CentOS': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.2.7) Gecko/20100726 CentOS/3.6-3.el5.centos Firefox/3.6.7',
	  'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'CentOS',
      'version': '3.6.7'
    },

    'Firefox 3.6.11 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.11) Gecko/20101012 Firefox/3.6.11 (.NET CLR 3.5.30729)',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Windows XP',
      'version': '3.6.11'
    },

    'Firefox 3.6.20 on Red Hat 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.20) Gecko/20110804 Red Hat/3.6-2.el5 Firefox/3.6.20',
	  'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Red Hat 64-bit',
      'version': '3.6.20'
    },

    'Firefox 3.7#{alpha}5 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a5pre) Gecko/20100418 Minefield/3.7a5pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Windows XP',
      'prerelease': 'alpha',
      'version': '3.7#{alpha}5'
    },

    'Firefox 4.0#{beta}8 on Windows Server 2008 / Vista 64-bit': {
      'ua': 'Mozilla/5.0 (Windows NT 6.0; Win64; IA64; rv:2.0b8pre) Gecko/20101213 Firefox/4.0b8pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Windows Server 2008 / Vista 64-bit',
      'platform': 'Win64',
      'prerelease': 'beta',
      'version': '4.0#{beta}8'
    },

    'Firefox 4.0#{beta}8 32-bit on Windows Server 2008 R2 / 7 64-bit': {
      'ua': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:2.0b8pre) Gecko/20101114 Firefox/4.0b8pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Windows Server 2008 R2 / 7 64-bit',
      'platform': 'Win32',
      'prerelease': 'beta',
      'version': '4.0#{beta}8'
    },

    'Firefox 4.0#{beta}11 on Mac OS X 10.6': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0b11pre) Gecko/20110126 Firefox/4.0b11pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'Mac OS X 10.6',
      'prerelease': 'beta',
      'version': '4.0#{beta}11'
    },

    'Firefox 5.0 on FreeBSD 64-bit': {
      'ua': 'Mozilla/5.0 (X11; FreeBSD amd64; rv:5.0) Gecko/20100101 Firefox/5.0',
      'layout': 'Gecko',
      'name': 'Firefox',
      'os': 'FreeBSD 64-bit',
      'version': '5.0'
    },

    'Firefox Mobile 2.0#{beta}1 on Android': {
      'ua': 'Mozilla/5.0 (Android; Linux armv7l; rv:2.0b6pre) Gecko/20100907 Firefox/4.0b6pre Fennec/2.0b1pre',
      'layout': 'Gecko',
      'name': 'Firefox Mobile',
      'os': 'Android',
      'prerelease': 'beta',
      'version': '2.0#{beta}1'
    },

    'Firefox Mobile 2.0.1 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; Linux i686 on x86_64; rv:2.0.1) Gecko/20100101 Firefox/4.0.1 Fennec/2.0.1',
      'layout': 'Gecko',
      'name': 'Firefox Mobile',
      'os': 'Linux i686',
      'version': '2.0.1'
    },

    'Firefox Mobile 10.0.5 on Android': {
      'ua': 'Mozilla/5.0 (Android; Mobile; rv:10.0.5) Gecko/10.0.5 Firefox/10.0.5 Fennec/10.0.5',
      'layout': 'Gecko',
      'name': 'Firefox Mobile',
      'os': 'Android',
      'version': '10.0.5'
    },

    'Flock 2.0#{alpha}1 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9pre) Gecko/2008051917 Firefox/3.0pre Flock/2.0a1pre',
      'layout': 'Gecko',
      'name': 'Flock',
      'os': 'Linux i686',
      'prerelease': 'alpha',
      'version': '2.0#{alpha}1'
    },

    'Flock 2.0#{beta}3 on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; es-AR; rv:1.9.0.2) Gecko/2008091920 Firefox/3.0.2 Flock/2.0b3',
      'layout': 'Gecko',
      'name': 'Flock',
      'os': 'Linux 64-bit',
      'prerelease': 'beta',
      'version': '2.0#{beta}3'
    },

    'Flock 2.6.0 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.19) Gecko/2010061201 Firefox/3.0.19 Flock/2.6.0',
      'layout': 'Gecko',
      'name': 'Flock',
      'os': 'Windows XP',
      'version': '2.6.0'
    },

    'Galeon 1.2.5 on Linux i686': {
      'ua': 'Mozilla/5.0 Galeon/1.2.5 (X11; Linux i686; U;) Gecko/20020809',
      'layout': 'Gecko',
      'name': 'Galeon',
      'os': 'Linux i686',
      'version': '1.2.5'
    },

    'Galeon 2.0.7 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko/20090327 Galeon/2.0.7',
      'layout': 'Gecko',
      'name': 'Galeon',
      'os': 'Linux i686',
      'version': '2.0.7'
    },

    'GreenBrowser (IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; GreenBrowser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'GreenBrowser',
      'os': 'Windows XP'
    },

    'GreenBrowser (IE 5 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; GreenBrowser)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'GreenBrowser',
      'os': 'Windows XP'
    },

    'iCab 2.8.1 on Mac OS': {
      'ua': 'Mozilla/4.5 (compatible; iCab 2.8.1; Macintosh; I; PPC)',
      'layout': 'iCab',
      'name': 'iCab',
      'os': 'Mac OS',
      'version': '2.8.1'
    },

    'iCab 3.0.2 on Mac OS': {
      'ua': 'iCab/3.0.2 (Macintosh; U; PPC Mac OS)',
      'layout': 'iCab',
      'name': 'iCab',
      'os': 'Mac OS',
      'version': '3.0.2'
    },

    'iCab 4.5 on Mac OS X 10.5.8': {
      'ua': 'iCab/4.5 (Macintosh; U; Mac OS X Leopard 10.5.8)',
      'layout': 'WebKit',
      'name': 'iCab',
      'os': 'Mac OS X 10.5.8',
      'version': '4.5'
    },

    'iCab 4.7 on Mac OS X': {
      'ua': 'iCab/4.7 (Macintosh; U; Intel Mac OS X)',
      'layout': 'WebKit',
      'name': 'iCab',
      'os': 'Mac OS X',
      'version': '4.7'
    },

    'Iceweasel 3.5.5 on Debian': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; de; rv:1.9.1.5) Gecko/20091112 Iceweasel/3.5.5 (like Firefox/3.5.5; Debian-3.5.5-1)',
      'layout': 'Gecko',
      'name': 'Iceweasel',
      'os': 'Debian',
      'version': '3.5.5'
    },

    'Iceweasel 5.0 on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; Linux x86_64; rv:5.0) Gecko/20100101 Firefox/5.0 Iceweasel/5.0',
      'layout': 'Gecko',
      'name': 'Iceweasel',
      'os': 'Linux 64-bit',
      'version': '5.0'
    },

    'IE 4.0 on Windows 95': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 4.0; Windows 95)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows 95',
      'version': '4.0'
    },

    'IE 5.5#{beta}1 on Mac OS': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 5.5b1; Mac_PowerPC)',
      'layout': 'Tasman',
      'name': 'IE',
      'os': 'Mac OS',
      'prerelease': 'beta',
      'version': '5.5#{beta}1'
    },

    'IE 5.5 on Windows 98': {
      'ua': 'Mozilla/4.0 (compatible;MSIE 5.5; Windows 98)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows 98',
      'version': '5.5'
    },

    'IE 5.05 on Windows NT': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 5.05; Windows NT 4.0)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows NT',
      'version': '5.05'
    },

    'IE 6.0#{beta} on Windows ME': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0b; Windows 98; Win 9x 4.90)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows ME',
      'prerelease': 'beta',
      'version': '6.0#{beta}'
    },

    'IE 6.0': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '6.0'
    },

    'IE 6.0 on Windows 2000': {
      'ua': 'Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.0)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows 2000',
      'version': '6.0'
    },

    'IE 6.1 on Windows 2000 SP1': {
      'ua': 'Mozilla/4.0 (Windows; MSIE 6.1; Windows NT 5.01)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows 2000 SP1',
      'version': '6.1'
    },

    'IE 7.0#{beta} on Windows Server 2003 / XP 64-bit': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 5.2)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows Server 2003 / XP 64-bit',
      'prerelease': 'beta',
      'version': '7.0#{beta}'
    },

    'IE 7.0 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 5.1; en-US)',
      'layout': 'Trident',
      'name': 'IE',
      'os': 'Windows XP',
      'version': '7.0'
    },

    'IE 8.0#{beta}2 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
      'appMinorVersion': 'beta 2',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'os': 'Windows XP',
      'prerelease': 'beta',
      'version': '8.0#{beta}2'
    },

    'IE 8.0 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; chromeframe/10.0.648.133; chromeframe)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'os': 'Windows XP',
      'version': '8.0'
    },

    'IE 8.0 (IE 5 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'IE',
      'os': 'Windows XP',
      'version': '8.0'
    },

    'IE 8.0 (IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; chromeframe)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'IE',
      'os': 'Windows XP',
      'version': '8.0'
    },

    'IE 8.0 32-bit on Windows Server 2008 / Vista 64-bit': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0)',
      'cpuClass': 'x86',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'os': 'Windows Server 2008 / Vista 64-bit',
      'platform': 'Win32',
      'version': '8.0'
    },

    'IE 8.0 on Windows Server 2008 R2 / 7 64-bit': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Win64; x64; Trident/4.0)',
      'cpuClass': 'x64',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'os': 'Windows Server 2008 R2 / 7 64-bit',
      'platform': 'Win64',
      'version': '8.0'
    },

    'IE 9.0 (platform preview) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'external': null,
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE',
      'os': 'Windows Server 2008 R2 / 7',
      'version': '9.0'
    },

    'IE 9.0#{beta} (IE 7 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 7,
      'name': 'IE',
      'os': 'Windows Server 2008 R2 / 7',
      'prerelease': 'beta',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (platform preview; IE 8 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'cpuClass': 'x86',
      'external': null,
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'os': 'Windows Server 2008 R2 / 7',
      'prerelease': 'beta',
      'version': '9.0#{beta}'
    },

    'IE 9.0 on Windows Server 2008 R2 / 7 64-bit': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; AMD64; Trident/5.0)',
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE',
      'os': 'Windows Server 2008 R2 / 7 64-bit',
      'version': '9.0'
    },

    'IE 10.0 (platform preview) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.0; Trident/6.0)',
      'external': null,
      'layout': 'Trident',
      'mode': 10,
      'name': 'IE',
      'os': 'Windows Server 2008 / Vista',
      'version': '10.0'
    },

    'IE 10.0 32-bit on Windows 8 64-bit': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; .NET4.0E; .NET4.0C',
      'layout': 'Trident',
      'mode': 10,
      'name': 'IE',
      'os': 'Windows 8 64-bit',
      'version': '10.0'
    },

    'IE Mobile 4.01 on Windows CE': {
      'ua' : 'Mozilla/4.0 (compatible; MSIE 4.01; Windows CE; PPC; 240x320)',
      'layout': 'Trident',
      'name': 'IE Mobile',
      'os': 'Windows CE',
      'version': '4.01'
    },

    'IE Mobile 7.0 on Samsung OMNIA7 (Windows Phone OS 7.0)': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; SAMSUNG; OMNIA7)',
      'external': null,
      'layout': 'Trident',
      'manufacturer': 'Samsung',
      'name': 'IE Mobile',
      'os': 'Windows Phone OS 7.0',
      'product': 'Samsung OMNIA7',
      'version': '7.0'
    },

    'IE Mobile 7.0 on LG GW910 (Windows Phone OS 7.0)': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; LG; GW910)',
      'external': null,
      'layout': 'Trident',
      'manufacturer': 'LG',
      'name': 'IE Mobile',
     'os': 'Windows Phone OS 7.0',
      'product': 'LG GW910',
      'version': '7.0'
    },

    'IE Mobile 9.0 (IE 8 mode) on LG E900 (Windows Phone OS 7.5)': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; LG; LG-E900)',
      'external': null,
      'layout': 'Trident',
      'manufacturer': 'LG',
      'mode': 8,
      'name': 'IE Mobile',
     'os': 'Windows Phone OS 7.5',
      'product': 'LG E900',
      'version': '9.0'
    },

    'IE Mobile 9.0 (desktop mode) on Windows Phone OS 7.x': {
      'ua': ' Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; XBLWP7; ZuneWP7)',
      'external': null,
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE Mobile',
     'os': 'Windows Phone OS 7.x',
      'version': '9.0'
    },

    'IE Mobile 9.0 (desktop mode; IE 8 mode) on Windows Phone OS 7.x': {
      'ua': ' Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; XBLWP7; ZuneWP7)',
      'external': null,
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE Mobile',
      'os': 'Windows Phone OS 7.x',
      'version': '9.0'
    },

    'Iron 0.2.152.0 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Iron/0.2.152.0 Safari/41562480.525',
      'layout': 'WebKit',
      'name': 'Iron',
      'os': 'Windows Server 2008 / Vista',
      'version': '0.2.152.0'
    },

    'Kindle Browser 3.4 (NetFront) on Amazon Kindle 2.0 (Linux 2.6.22)': {
      'ua': 'Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 600x800)',
      'layout': 'NetFront',
      'manufacturer': 'Amazon',
      'name': 'Kindle Browser',
      'os': 'Linux 2.6.22',
      'product': 'Kindle 2.0',
      'version': '3.4'
    },

    'Kindle Browser 4.0 (like Safari 4.x) on Amazon Kindle 3.0': {
      'ua': 'Mozilla/5.0 (Linux; U; en-US) AppleWebKit/528.5+ (KHTML, like Gecko, Safari/528.5+) Version/4.0 Kindle/3.0 (screen 600x800; rotate)',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Kindle Browser',
      'os': 'Linux',
      'product': 'Kindle 3.0',
      'version': '4.0'
    },

    'K-Meleon 1.5.0#{beta}2 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.14) Gecko/20080406 K-Meleon/1.5.0b2',
      'layout': 'Gecko',
      'name': 'K-Meleon',
      'os': 'Windows XP',
      'prerelease': 'beta',
      'version': '1.5.0#{beta}2'
    },

    'K-Meleon 1.5.4 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.24pre) Gecko/20100228 K-Meleon/1.5.4',
      'layout': 'Gecko',
      'name': 'K-Meleon',
      'os': 'Windows XP',
      'version': '1.5.4'
    },

    'Konqueror 4.4 on Kubuntu': {
      'ua': 'Mozilla/5.0 (compatible; Konqueror/4.4; Linux 2.6.32-22-generic; X11; en_US) KHTML/4.4.3 (like Gecko) Kubuntu',
      'layout': 'KHTML',
      'name': 'Konqueror',
      'os': 'Kubuntu',
      'version': '4.4'
    },

    'Konqueror 4.7.1 on Kubuntu 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-GB) AppleWebKit/533.3 (KHTML, like Gecko) konqueror/4.7.1 Safari/533.3',
      'layout': 'WebKit',
      'name': 'Konqueror',
      'os': 'Kubuntu 64-bit',
      'version': '4.7.1'
    },

    'Lunascape 5.0#{alpha}3 (Trident) on Windows Server 2003 / XP 64-bit': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2; Lunascape 5.0 alpha3)',
      'layout': 'Trident',
      'name': 'Lunascape',
      'os': 'Windows Server 2003 / XP 64-bit',
      'prerelease': 'alpha',
      'version': '5.0#{alpha}3'
    },

    'Lunascape 6.1.7.21880 (Trident) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; Lunascape 6.1.7.21880)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Lunascape',
      'os': 'Windows Server 2008 R2 / 7',
      'version': '6.1.7.21880'
    },

    'Lunascape 6.2.1.22445 (Gecko) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.13) Gecko/20100917 Firefox/3.5.13 Lunascape/6.2.1.22445',
      'layout': 'Gecko',
      'name': 'Lunascape',
      'os': 'Windows Server 2008 / Vista',
      'version': '6.2.1.22445'
    },

    'Lunascape 6.3.1.22729#{beta} (Trident) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0; Lunascape/6.3.1.22729)',
      'appMinorVersion': 'beta',
      'external': null,
      'layout': 'Trident',
      'mode': 9,
      'name': 'Lunascape',
      'os': 'Windows Server 2008 / Vista',
      'prerelease': 'beta',
      'version': '6.3.1.22729#{beta}'
    },

    'Lunascape 6.3.2.22803 (like Safari 4+) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.3 (KHTML, like Gecko) Lunascape/6.3.2.22803 Safari/533.3',
      'layout': 'WebKit',
      'name': 'Lunascape',
      'os': 'Windows XP',
      'version': '6.3.2.22803'
    },

    'Maxthon 2.x (Trident) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Maxthon 2.0)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Maxthon',
      'os': 'Windows XP',
      'version': '2.x'
    },

    'Maxthon 2.x (IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; Maxthon 2.0)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Maxthon',
      'os': 'Windows XP',
      'version': '2.x'
    },

    'Maxthon 3.x (like Safari 4+) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.9 (KHTML, like Gecko) Maxthon/3.0 Safari/533.9',
      'layout': 'WebKit',
      'name': 'Maxthon',
      'os': 'Windows XP',
      'version': '3.x'
    },

    'Maxthon 3.x#{alpha} (Trident) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Maxthon/3.0)',
      'appMinorVersion': 'alpha',
      'external': null,
      'layout': 'Trident',
      'mode': 8,
      'name': 'Maxthon',
      'os': 'Windows XP',
      'prerelease': 'alpha',
      'version': '3.x#{alpha}'
    },

    'Midori (like Safari 3.x) on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; ru-ru) AppleWebKit/525.1+ (KHTML, like Gecko, Safari/525.1+) midori',
      'layout': 'WebKit',
      'name': 'Midori',
      'os': 'Linux 64-bit'
    },

    'Midori 0.1.10 on Linux i686': {
      'ua': 'Midori/0.1.10 (X11; Linux i686; U; fr-fr) WebKit/532.1+',
      'layout': 'WebKit',
      'name': 'Midori',
      'os': 'Linux i686',
      'version': '0.1.10'
    },

    'Midori 0.1.6 on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; en-us; rv:1.8.1) Gecko/20061010 Firefox/2.0 Midori/0.1.6',
      'layout': 'WebKit',
      'name': 'Midori',
      'os': 'Linux',
      'version': '0.1.6'
    },

    'Midori 1.19 (like Safari 3.x) on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; fr-fr) AppleWebKit/525.1+ (KHTML, like Gecko, Safari/525.1+) midori/1.19',
      'layout': 'WebKit',
      'name': 'Midori',
      'os': 'Linux i686',
      'version': '1.19'
    },

    'Narwhal': (function() {
      var object = {
        'exports': {},
        'name': 'Narwhal',
        'require': function() { },
        'system':  {}
      };
      object.global = object.system.global = object;
      return object;
    }()),

    'Node.js 0.3.1 on Cygwin': {
      'exports': {},
      'global': {},
      'name': 'Node.js',
      'os': 'Cygwin',
      'process': { 'version': 'v0.3.1', 'platform': 'cygwin' },
      'version': '0.3.1'
    },

    'Nokia Browser 8.5.0 (like Safari 5+) on Nokia N9': {
      'ua': 'Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/543.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13',
      'layout': 'WebKit',
      'manufacturer': 'Nokia',
      'name': 'Nokia Browser',
      'product': 'Nokia N9',
      'version': '8.5.0'
    },

    'Nokia Browser (like Safari 3.x) on Nokia 5530c (Symbian OS 9.4)': {
      'ua': 'Mozilla/5.0 (SymbianOS/9.4; U; Series60/5.0 Nokia5530c-2/10.0.050; Profile MIDP-2.1 Configuration/CLDC-1.1) AppleWebKit/525 (KHTML, like Gecko) Safari/525',
      'layout': 'WebKit',
      'manufacturer': 'Nokia',
      'name': 'Nokia Browser',
      'os': 'Symbian OS 9.4',
      'product': 'Nokia 5530c'
    },

    'Nook Browser 1.0 on Barnes & Noble Nook': {
      'ua': 'nook browser/1.0',
      'layout': 'WebKit',
      'manufacturer': 'Barnes & Noble',
      'name': 'Nook Browser',
      'product': 'Nook',
      'version': '1.0'
    },

    'Opera Mini 4.1.11355': {
      'ua': 'Opera/9.50 (J2ME/MIDP; Opera Mini/4.1.11355/542; U; en)',
      'layout': 'Presto',
      'name': 'Opera Mini',
      'operamini': { '[[Class]]': 'OperaMini' },
      'version': '4.1.11355'
    },

    'Opera Mini 6.1.15738 on Apple iPhone': {
      'ua': 'Opera/9.80 (iPhone; Opera Mini/6.1.15738/25.669; U; en) Presto/2.5.25 Version/10.54.544',
      'layout': 'Presto',
      'manufacturer': 'Apple',
      'name': 'Opera Mini',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.00'; } },
      'operamini': { '[[Class]]': 'OperaMini' },
      'os': 'iOS',
      'product': 'iPhone',
      'version': '6.1.15738'
    },

    'Opera Mini (desktop mode) on Linux zvav': {
      'ua': 'Opera/9.80 (X11; Linux zvav; U; en) Presto/2.8.119 Version/10.54',
      'layout': 'Presto',
      'name': 'Opera Mini',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.00'; } },
      'operamini': { '[[Class]]': 'OperaMini' },
      'os': 'Linux zvav'
    },

    'Opera Mobile 10.00 on Linux i686': {
      'ua': 'Opera/9.80 (Linux i686; Opera Mobi/1038; U; en) Presto/2.5.24 Version/10.00',
      'layout': 'Presto',
      'name': 'Opera Mobile',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.00'; } },
      'os': 'Linux i686',
      'version': '10.00'
    },

    'Opera Mobile 12.00 (desktop mode) on Linux zbov': {
      'ua': 'Opera/9.80 (X11; Linux zbov; U; ar) Presto/2.10.254 Version/12.00',
      'layout': 'Presto',
      'name': 'Opera Mobile',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '12.00'; } },
      'os': 'Linux zbov',
      'version': '12.00'
    },

    'Opera 10.10 (identifying as Firefox 2.0.0) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 10.10',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.10'; } },
      'os': 'Windows XP',
      'version': '10.10'
    },

    'Opera 10.63 (identifying as IE 6.0) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 10.63',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.63'; } },
      'os': 'Windows XP',
      'version': '10.63'
    },

    'Opera 11.00 on Windows XP': {
      'ua': 'Opera/9.80 (Windows NT 5.1; U; en) Presto/2.6.37 Version/11.00',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '11.00'; } },
      'os': 'Windows XP',
      'version': '11.00'
    },

    'Opera 11.52 (masking as Firefox 4.0) on Mac OS X 10.7.2': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7.2; en; rv:2.0) Gecko/20100101 Firefox/4.0',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '11.52'; } },
      'os': 'Mac OS X 10.7.2',
      'version': '11.52'
    },

    'PhantomJS 1.0.0 (like Safari 4.x) on Cygwin': {
      'ua': 'Mozilla/5.0 (X11; U; Cygwin; C -) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3)  PhantomJS/1.0.0',
      'layout': 'WebKit',
      'name': 'PhantomJS',
      'os': 'Cygwin',
      'phantom': { 'version': { 'major': 1, 'minor': 0, 'patch': 0 } },
      'version': '1.0.0'
    },

    'PlayBook Browser 0.0.1 (like Safari 5.x) on BlackBerry PlayBook (Tablet OS 1.0.0)': {
      'ua': 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/0.0.1 Safari/534.8+',
      'layout': 'WebKit',
      'manufacturer': 'BlackBerry',
      'name': 'PlayBook Browser',
      'os': 'Tablet OS 1.0.0',
      'product': 'PlayBook',
      'version': '0.0.1'
    },

    'Raven 0.5.8635 on Mac OS X 10.7.1': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7.1) AppleWebKit/7534.48.3 (KHTML, like Gecko) Version/5.1 Safari/7534.48.3 Raven for Mac/0.5.8635',
      'layout': 'WebKit',
      'name': 'Raven',
      'os': 'Mac OS X 10.7.1',
      'version': '0.5.8635'
    },

    'Rekonq (like Safari 4+) on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-GB) AppleWebKit/533.3 (KHTML, like Gecko) rekonq Safari/533.3',
      'layout': 'WebKit',
      'name': 'Rekonq',
      'os': 'Linux i686'
    },

    'Rhino': {
      'global': {},
      'environment': {},
      'name': 'Rhino'
    },

    'RingoJS 0.7': (function() {
      var object = {
        'exports': {},
        'name': 'RingoJS',
        'require': function() { return { 'version': [0, 7] }; },
        'system':  {},
        'version': '0.7'
      };
      object.global = object;
      return object;
    }()),

    'RockMelt 0.8.34.820 (like Chrome 6.0.472.63) on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0(Macintosh; U; Intel Mac OS X 10_5_8; en-US)AppleWebKit/534.3(KHTML,like Gecko)RockMelt/0.8.34.820 Chrome/6.0.472.63 Safari/534.3',
      'layout': 'WebKit',
      'likeChrome': true,
      'name': 'RockMelt',
      'os': 'Mac OS X 10.5.8',
      'version': '0.8.34.820'
    },

    'Safari 1.x on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de) AppleWebKit/85.7 (KHTML, like Gecko) Safari/85.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'os': 'Mac OS X',
      'version': '1.x'
    },

    'Safari 2.x on Mac OS': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS; en-en) AppleWebKit/412 (KHTML, like Gecko) Safari/412',
      'layout': 'WebKit',
      'name': 'Safari',
      'os': 'Mac OS',
      'version': '2.x'
    },

    'Safari 3.x on Apple iPod (iOS 2.2.1)': {
      'ua': 'Mozilla/5.0 (iPod; U; CPU iPhone OS 2_2_1 like Mac OS X; en-us) AppleWebKit/525.18.1 (KHTML, like Gecko) Mobile/5H11a',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 2.2.1',
      'product': 'iPod',
      'version': '3.x'
    },

    'Safari 3.0 on Apple iPod': {
      'ua': 'Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3A101a Safari/419.3',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS',
      'product': 'iPod',
      'version': '3.0'
    },

    'Safari 3.1.1 on Apple iPhone (iOS 2.0.1)': {
      'ua': 'Mozilla/5.0 (Mozilla/5.0 (iPhone; U; CPU iPhone OS 2_0_1 like Mac OS X; fr-fr) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/5G77 Safari/525.20',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 2.0.1',
      'product': 'iPhone',
      'version': '3.1.1'
    },

    'Safari 4.x on Apple iPhone (iOS 3.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Mobile/7E18,gzip(gfe),gzip(gfe)',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 3.1',
      'product': 'iPhone',
      'version': '4.x'
    },

    'Safari 4.x on Apple iPhone Simulator (iOS 4.0)': {
      'ua': 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Mobile/8A293',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 4.0',
      'product': 'iPhone Simulator',
      'version': '4.x'
    },

    'Safari 4.0#{alpha}1 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en) AppleWebKit/526.9 (KHTML, like Gecko) Version/4.0dp1 Safari/526.8',
      'layout': 'WebKit',
      'name': 'Safari',
      'os': 'Windows XP',
      'prerelease': 'alpha',
      'version': '4.0#{alpha}1'
    },

    'Safari 4.0 on Apple iPhone (iOS 4.1.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1_1 like Mac OS X; en-en) AppleWebKit/548.18 (KHTML, like Gecko) Version/4.0 Mobile/8F12 Safari/548.16',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 4.1.1',
      'product': 'iPhone',
      'version': '4.0'
    },

    'Safari 4.0.4 on Apple iPad (iOS 3.2)': {
      'ua': 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 3.2',
      'product': 'iPad',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Apple iPhone Simulator (iOS 3.2)': {
      'ua': 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7D11 Safari/531.21.10',
      'layout': 'WebKit',
      'manufacturer': 'Apple',
      'name': 'Safari',
      'os': 'iOS 3.2',
      'product': 'iPhone Simulator',
      'version': '4.0.4'
    },

    'Safari 5.1 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
      'layout': 'WebKit',
      'name': 'Safari',
      'os': 'Windows Server 2008 R2 / 7',
      'version': '5.1'
    },

    'Safari 5.2 on Mac OS X 10.8': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8) AppleWebKit/535.18.5 (KHTML, like Gecko) Version/5.2 Safari/535.18.',
      'layout': 'WebKit',
      'name': 'Safari',
      'os': 'Mac OS X 10.8',
      'version': '5.2'
    },

    'SeaMonkey 1.1.7#{alpha} on Haiku': {
      'ua': 'Mozilla/5.0 (BeOS; U; Haiku BePC; en-US; rv:1.8.1.10pre) Gecko/20080112 SeaMonkey/1.1.7pre',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'os': 'Haiku',
      'prerelease': 'alpha',
      'version': '1.1.7#{alpha}'
    },

    'SeaMonkey 1.1.13 on Fedora': {
      'ua': 'Seamonkey-1.1.13-1(X11; U; GNU Fedora fc 10) Gecko/20081112',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'os': 'Fedora',
      'version': '1.1.13'
    },

    'SeaMonkey 2.0#{beta}1 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.1pre) Gecko/20090717 SeaMonkey/2.0b1',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'os': 'Windows Server 2008 / Vista',
      'prerelease': 'beta',
      'version': '2.0#{beta}1'
    },

    'SeaMonkey 2.0.3 on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.1.8) Gecko/20100205 SeaMonkey/2.0.3',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'os': 'Linux 64-bit',
      'version': '2.0.3'
    },

    'SeaMonkey 2.0.6 on Linux 64-bit': {
      'ua': 'Mozilla/5.0 (X11; U; Linux ia64; de; rv:1.9.1.11) Gecko/20100820 Lightning/1.0b2pre SeaMonkey/2.0.6',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'os': 'Linux 64-bit',
      'version': '2.0.6'
    },

    'Silk 1.0.13.81 on Amazon Kindle Fire (Android 2.3.4)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Silk/1.0.13.81_10003810) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 Silk-Accelerated=false',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android 2.3.4',
      'product': 'Kindle Fire',
      'version': '1.0.13.81'
    },

    'Silk 1.0.13.81 (accelerated; desktop mode) on Amazon Kindle Fire': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; zh-cn; Silk/1.0.13.81_10003810) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android',
      'product': 'Kindle Fire',
      'version': '1.0.13.81'
    },

    'Silk 1.0.0 on Amazon Kindle Fire (Android 2.3.4)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Cloud9/1.0.0) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android 2.3.4',
      'product': 'Kindle Fire',
      'version': '1.0.0'
    },

    'Silk 1.0.0 (desktop mode) on Amazon Kindle Fire': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Cloud9/1.0.0) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android',
      'product': 'Kindle Fire',
      'version': '1.0.0'
    },

    'Silk 1.1.0 (accelerated) on Amazon Kindle Fire (Android 2.3.4)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Silk/1.1.0-72) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 Silk-Accelerated=true',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android 2.3.4',
      'product': 'Kindle Fire',
      'version': '1.1.0'
    },

    'Silk 1.1.0 (accelerated; desktop mode) on Amazon Kindle Fire': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-72) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android',
      'product': 'Kindle Fire',
      'version': '1.1.0'
    },

    'Silk 1.1.0 on Amazon Kindle Fire (Android 2.3.4)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Silk/1.1.0-72) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 Silk-Accelerated=false',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android 2.3.4',
      'product': 'Kindle Fire',
      'version': '1.1.0'
    },

    'Silk 1.1.0 (desktop mode) on Amazon Kindle Fire': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-72) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=false',
      'layout': 'WebKit',
      'manufacturer': 'Amazon',
      'name': 'Silk',
      'os': 'Android',
      'product': 'Kindle Fire',
      'version': '1.1.0'
    },

    'Sleipnir 2.8.4 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; Sleipnir 2.8.4)',
      'layout': 'Trident',
      'name': 'Sleipnir',
      'os': 'Windows XP',
      'version': '2.8.4'
    },

    'Sleipnir 2.9.2#{beta} on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Sleipnir/2.9.2)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Sleipnir',
      'os': 'Windows XP',
      'prerelease': 'beta',
      'version': '2.9.2#{beta}'
    },

    'Sleipnir 2.9.4 (IE 7 mode) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/4.0; Sleipnir/2.9.4)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Sleipnir',
      'os': 'Windows Server 2008 / Vista',
      'version': '2.9.4'
    },

    'SlimBrowser (IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SlimBrowser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'SlimBrowser',
      'os': 'Windows XP'
    },

    'SlimBrowser (IE 5 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/4.0; SlimBrowser)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'SlimBrowser',
      'os': 'Windows Server 2008 R2 / 7'
    },

    'Sunrise 1.7.5 on Mac OS X 10.5.5': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_5; ja-jp) AppleWebKit/525.18 (KHTML, like Gecko) Sunrise/1.7.5 like Safari/5525.20.1',
      'layout': 'WebKit',
      'name': 'Sunrise',
      'os': 'Mac OS X 10.5.5',
      'version': '1.7.5'
    },

    'Sunrise 4.0.1 on FreeBSD 64-bit': {
      'ua': 'Mozilla/6.0 (X11; U; Linux x86_64; en-US; rv:2.9.0.3) Gecko/2009022510 FreeBSD/ Sunrise/4.0.1/like Safari',
      'layout': 'WebKit',
      'name': 'Sunrise',
      'os': 'FreeBSD 64-bit',
      'version': '4.0.1'
    },

    'Swiftfox 2.0.0.6 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.6) Gecko/20070803 Firefox/2.0.0.6 (Swiftfox)',
      'layout': 'Gecko',
      'name': 'Swiftfox',
      'os': 'Linux i686',
      'version': '2.0.0.6'
    },

    'Swiftfox 3.0.10#{alpha} on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.10pre) Gecko/2009041814 Firefox/3.0.10pre (Swiftfox)',
      'layout': 'Gecko',
      'name': 'Swiftfox',
      'os': 'Linux i686',
      'prerelease': 'alpha',
      'version': '3.0.10#{alpha}'
     },

    'webOS Browser 1.0 (like Chrome 1.x) on webOS 1.2.9': {
      'ua': 'Mozilla/5.0 (webOS/Palm webOS 1.2.9; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pixi/1.0',
      'layout': 'WebKit',
      'likeChrome': true,
      'name': 'webOS Browser',
      'os': 'webOS 1.2.9',
      'version': '1.0'
    },

    'webOS Browser 1.0 (like Chrome 3.x) on webOS 1.4.0': {
      'ua': 'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.0',
      'layout': 'WebKit',
      'likeChrome': true,
      'name': 'webOS Browser',
      'os': 'webOS 1.4.0',
      'version': '1.0'
    },

    'TouchPad Browser (like Chrome 6.x) on HP TouchPad 1.0 (webOS 3.0.0)': {
      'ua': 'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-GB) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0',
      'layout': 'WebKit',
      'likeChrome': true,
      'manufacturer': 'HP',
      'os': 'webOS 3.0.0',
      'product': 'TouchPad 1.0',
      'name': 'TouchPad Browser'
    },

    'WebKit Nightly 528.4 (like Safari 4.x) on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; tr) AppleWebKit/528.4+ (KHTML, like Gecko) Version/4.0dp1 Safari/526.11.2',
      'layout': 'WebKit',
      'name': 'WebKit Nightly',
      'os': 'Mac OS X 10.4.11',
      'prerelease': 'alpha',
      'version': '528.4'
    },

    'WebKit Nightly 533.2 (like Safari 4+) on Mac OS X 10.6.2': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_2; ru-ru) AppleWebKit/533.2+ (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'WebKit Nightly',
      'os': 'Mac OS X 10.6.2',
      'prerelease': 'alpha',
      'version': '533.2'
    },

    'WebKit Nightly 535.7 (like Safari 5+) on Mac OS X 10.7.1': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_1) AppleWebKit/535.7+ (KHTML, like Gecko) Version/5.1 Safari/534.48.3',
      'layout': 'WebKit',
      'name': 'WebKit Nightly',
      'os': 'Mac OS X 10.7.1',
      'prerelease': 'alpha',
      'version': '535.7'
    },

    'WebPositive (like Safari 4.x) on Haiku': {
      'ua': 'Mozilla/5.0 (compatible; U; InfiNet 0.1; Haiku) AppleWebKit/527+ (KHTML, like Gecko) WebPositive/527+ Safari/527+',
      'layout': 'WebKit',
      'name': 'WebPositive',
      'os': 'Haiku'
    },

    'Lynx/2.8.8dev.3 libwww-FM/2.14 SSL-MM/1.4.1': {
      'ua': 'Lynx/2.8.8dev.3 libwww-FM/2.14 SSL-MM/1.4.1'
    },

    'Mozilla/5.0 (X11; U; Linux x86_64; fr; rv:1.9.2.13) Gecko/20101203 FalsePositive/3.6.7 (like Firefox/3.6.13)': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; fr; rv:1.9.2.13) Gecko/20101203 FalsePositive/3.6.7 (like Firefox/3.6.13)',
      'layout': 'Gecko',
      'os': 'Linux 64-bit'
    },

    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8) Gecko/20100728 Firefox/3.6.8 CometBird/3.6.8,gzip(gfe),gzip(gfe)': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8) Gecko/20100728 Firefox/3.6.8 CometBird/3.6.8,gzip(gfe),gzip(gfe)',
      'layout': 'Gecko',
      'os': 'Windows XP'
    },

    'Mozilla/5.0 (PLAYSTATION 3; 2.00)': {
      'ua': 'Mozilla/5.0 (PLAYSTATION 3; 2.00)'
    },

    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:7.0) Gecko/20110929 Firefox/7.0-x64 PaleMoon/7.0-x64': {
      'ua': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:7.0) Gecko/20110929 Firefox/7.0-x64 PaleMoon/7.0-x64',
      'layout': 'Gecko',
      'os': 'Windows Server 2008 R2 / 7 64-bit'
    },

    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 Prism/1.0b2': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 Prism/1.0b2',
      'layout': 'Gecko',
      'os': 'Windows XP'
    }
  };

  /*--------------------------------------------------------------------------*/

  // explicitly call `QUnit.module()` instead of `module()`
  // in case we are in a CLI environment
  QUnit.module('platform' + (window.document ? '' : ': ' + platform));

  (function() {
    each(['description', 'layout', 'manufacturer', 'name', 'os', 'prerelease', 'product', 'version'], function(name) {
      test('has the correct `platform.' + name + '` property', function() {
        forOwn(Tests, function(value, key) {
          var platform = getPlatform(value);
          value = name == 'description' ? key : value[name];
          value = value ? interpolate(value, { 'alpha': '\u03b1', 'beta': '\u03b2' }) : null;
          equal(platform && String(platform[name]), String(value), String(platform));
        });
      });
    });

    test('has correct null values', function() {
      forOwn(Tests, function(value) {
        forOwn(getPlatform(value), function(value, key) {
          !value && strictEqual(value, null, 'platform.' + key);
        });
      });
    });

    test('handles no user agent', function() {
      forOwn(getPlatform({}), function(value, key) {
        if (typeof value != 'function') {
          equal(String(value), 'null', 'platform.' + key);
        }
      });
    });

    test('supports loading Platform.js as a module', function() {
      if (window.document && window.require) {
        equal((platform2 || {}).description, platform.description);
      } else {
        ok(true, 'test skipped');
      }
    });
  }());

  /*--------------------------------------------------------------------------*/

  QUnit.module('platform.parse');

  (function() {
    function parse(ua) {
      // avoid false negative when the UA string being tested matches the browser's
      return platform.parse(ua + ';');
    }

    test('parses Adobe Air', function() {
      var actual = parse('Mozilla/5.0 (Windows; U; en-US) AppleWebKit/531.9 (KHTML, like Gecko) AdobeAIR/2.5'),
          expected = 'Adobe AIR 2.5 (like Safari 4.x)';

      equal(actual.description, expected);
    });

    test('parses Chrome', function() {
      var actual = parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.106 Safari/535.2'),
          expected = 'Chrome 15.0.874.106 on Mac OS X 10.7.2';

      equal(actual.description, expected);
    });

    test('parses Firefox', function() {
      var actual = parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:8.0) Gecko/20100101 Firefox/8.0'),
          expected = 'Firefox 8.0 on Mac OS X 10.7';

      equal(actual.description, expected);
    });

    test('parses IE', function() {
      var actual = parse('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0)'),
          expected = 'IE 7.0 on Windows XP';

      equal(actual.description, expected);
    });

    test('parses Opera', function() {
      var actual = parse('Opera/9.80 (Macintosh; Intel Mac OS X 10.7.2; U; Edition Next; en) Presto/2.9.220 Version/12.00'),
          expected = 'Opera 12.00 on Mac OS X 10.7.2';

      equal(actual.description, expected);
    });

    test('parses Opera description identifying as Firefox 2.0.0', function() {
      var actual = parse('Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 10.10'),
          expected = 'Opera 10.10 (identifying as Firefox 2.0.0) on Windows XP';

      equal(actual.description, expected);
    });

    test('parses Opera layout identifying as Firefox 2.0.0', function() {
      var actual = parse('Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 10.10'),
          expected = 'Presto';

      equal(actual.layout, expected);
    });

    test('parses Opera description identifying as IE 8.0', function() {
      var actual = parse('Mozilla/4.0 (compatible; MSIE 8.0; Mac_PowerPC; en) Opera 10.52'),
          expected = 'Opera 10.52 (identifying as IE 8.0)';

      equal(actual.description, expected);
    });

    test('parses Opera description identifying as IE 9.0', function() {
      var actual = parse('Mozilla/5.0 (compatible; MSIE 9.0; Mac_PowerPC; en) Opera 12.00'),
          expected = 'Opera 12.00 (identifying as IE 9.0)';

      equal(actual.description, expected);
    });

    test('parses Opera description masking as Firefox 4.0', function() {
      var actual = parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7.2; en; rv:2.0) Gecko/20100101 Firefox/4.0'),
          expected = 'Opera (masking as Firefox 4.0) on Mac OS X 10.7.2';

      equal(actual.description, expected);
    });

    test('parses Opera description masking as IE 8.0', function() {
      var actual = parse('Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; en)'),
          expected = 'Opera (masking as IE 8.0)';

      equal(actual.description, expected);
    });

    test('parses Opera description masking as IE 9.0', function() {
      var actual = parse('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 5.1; Trident/5.0; en)'),
          expected = 'Opera (masking as IE 9.0)';

      equal(actual.description, expected);
    });

    test('parses Safari', function() {
      var actual = parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22'),
          expected = 'Safari 5.1.1 on Mac OS X 10.7.2';

      equal(actual.description, expected);
    });

    test('parses PhantomJS', function() {
      var actual = parse('Mozilla/5.0 (X11; U; Cygwin; C -) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3)  PhantomJS/1.0.0'),
          expected = 'PhantomJS 1.0.0 (like Safari 4.x) on Cygwin';

      equal(actual.description, expected);
    });
  }());

  /*--------------------------------------------------------------------------*/

  QUnit.module('platform.toString');

  (function() {
    test('returns a string when `platform.description` is `null`', function() {
      var description = platform.description;
      platform.description = null;
      ok(typeof platform.toString() == 'string');
      platform.description = description;
    });
  }());

  /*--------------------------------------------------------------------------*/

  // explicitly call `QUnit.start()` for Narwhal, Rhino, and RingoJS
  if (!window.document) {
    QUnit.start();
  }
}(typeof global == 'object' && global || this));
