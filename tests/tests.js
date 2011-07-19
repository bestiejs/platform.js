(function(window) {

  /**
   * A bare-bones `Array#forEach`/`for-in` own property solution.
   * Callbacks may terminate the loop by explicitly returning `false`.
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {Array|Object} Returns the object iterated over.
   */
  function each(object, callback) {
    var i = -1,
        result = [object, object = Object(object)][0],
        length = object.length;

    // in Opera < 10.5 `hasKey(object, 'length')` returns false for NodeLists
    if ('length' in object && length > -1 && length < 4294967296) {
      while (++i < length) {
        // in Safari 2 `i in object` is always false for NodeLists
        if ((i in object || 'item' in object) && callback(object[i], i, object) === false) {
          break;
        }
      }
    } else {
      for (i in object) {
        if (hasKey(object, i) && callback(object[i], i, object) === false) {
          break;
        }
      }
    }
    return result;
  }

  /**
   * Checks if an object has the specified key as a direct property.
   * @private
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */
  function hasKey(object, key) {
    var result,
        o = {},
        hasOwnProperty = o.hasOwnProperty,
        parent = (object.constructor || Object).prototype;

    // for modern browsers
    object = Object(object);
    if (isClassOf(hasOwnProperty, 'Function')) {
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
    return result;
  }

  /**
   * Modify a string by replacing named tokens with matching object property values.
   * @private
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */
  function interpolate(string, object) {
    string = string == null ? '' : string;
    each(object || {}, function(value, key) {
      string = string.replace(RegExp('#\\{' + key + '\\}', 'g'), String(value));
    });
    return string;
  }

  /**
   * Checks if an object is of the specified class.
   * @private
   * @param {Object} object The object.
   * @param {String} name The name of the class.
   * @returns {Boolean} Returns `true` if of the class, else `false`.
   */
  function isClassOf(object, name) {
    return object != null && {}.toString.call(object).slice(8, -1) == name;
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
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
   * A generic bare-bones `Array#reduce` solution.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} accumulator Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */
  function reduce(array, callback, accumulator) {
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Returns a platform object of a simulated environment.
   * @private
   * @param {Object} options The options object to simulate environment objects.
   * @returns {Object} The modified string.
   */
  var getPlatform = (function() {
    var compiled,
        xhr;

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
        compiled = Function('isClassOf,reduce,options',
          ('return ' +
          /\(function(?:.|\n|\r)+?};\s*}/.exec(xhr.responseText)[0] +
          ' return getPlatform()}(this))')
            .replace(/\bfreeGlobal\s*=[^\n]+?(,\n)/, 'freeGlobal=options.global$1')
            .replace(/\boldWin\s*=[^\n]+?(,\n)/, 'oldWin=options$1')
            .replace(/\bthisBinding\s*=[^\n]+?(,\n)/, 'me=options$1')
            .replace(/\buserAgent\s*=[^\n]+?(,\n)/, 'userAgent=me.ua$1')
            .replace(/\bgetClassOf\(data\s*=\s*window\.runtime\)[^)]+/g, 'data=me.runtime')
            .replace(/\b(?:thisBinding|window)\b/g, 'me')
            .replace(/([^.])\bsystem\b/g, '$1me.system')
            .replace(/\bgetClassOf\(opera\)/g, 'opera&&opera["[[Class]]"]')
            .replace(/\b(?:Environment|RuntimeObject)\b/g, 'Object')
            .replace(/\bnav\.appMinorVersion/g, 'me.appMinorVersion')
            .replace(/\bnav\.cpuClass/g, 'me.cpuClass')
            .replace(/\bnav\.platform/g, 'me.platform')
            .replace(/\bexports\b/g, 'me.exports')
            .replace(/\bexternal/g, 'me.external')
            .replace(/\bprocess\b/g, 'me.process')
            .replace(/\b(?:me\.)?phantom/g, 'me.phantom')
            .replace(/\bdoc\.documentMode/g, 'me.mode'));
        return false;
      }
    });

    return function(options) {
      return compiled(isClassOf, reduce, options);
    };
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * An object of UA variations.
   * @type Object
   */
  var Tests = {
    'Adobe AIR 2.5 (like Safari 4.x) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; en-US) AppleWebKit/531.9 (KHTML, like Gecko) AdobeAIR/2.5',
      'layout': 'WebKit',
      'name': 'Adobe AIR',
      'runtime': { 'flash': { 'system': { 'Capabilities': { 'os': 'Windows XP' }}}},
      'version': '2.5'
    },

    'Arora 0.4 (like Safari 3.x) on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; cs-CZ) AppleWebKit/523.15 (KHTML, like Gecko, Safari/419.3) Arora/0.4 (Change: 333 41e3bc6)',
      'layout': 'WebKit',
      'name': 'Arora',
      'version': '0.4'
    },

    'Arora 0.6 (like Safari 4.x) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6 (Change: )',
      'layout': 'WebKit',
      'name': 'Arora',
      'version': '0.6'
    },

    'Arora 0.8.0 (like Safari 4.x) on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; de-DE) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.8.0',
      'layout': 'WebKit',
      'name': 'Arora',
      'version': '0.8.0'
    },

    'Avant Browser on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Avant Browser)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Avant Browser'
    },

    'Avant Browser (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; Avant Browser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Avant Browser'
    },

    'Android Browser (like Chrome 2.x) on Android 2.1': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; Sprint APA9292KT Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko)',
      'layout': 'WebKit',
      'name': 'Android Browser'
    },

    'Android Browser 3.0.4 (like Chrome 1.x) on Xoom (Android 3.0)': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 3.0; xx-xx; Xoom Build/HRI39) AppleWebKit/525.10+ (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'version': '3.0.4'
    },

    'Android Browser 3.1.2 (like Chrome 1.x) on Android 1.6': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 1.6; en-us; HTC_TATTOO_A3288 Build/DRC79) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'version': '3.1.2'
    },

    'Android Browser 4.0 (like Chrome 5.x) on Android 2.2': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.2; zh-cn;) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'version': '4.0'
    },

    'Android Browser 4.0 (like Chrome 5.x) on Android 2.2.1': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; Nexus One Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'version': '4.0'
    },

    'Android Browser 4.1#{alpha} (like Chrome 5.x) on Android 2.2.1': {
      'ua': 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; Nexus One Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.1a Mobile Safari/533.1',
      'layout': 'WebKit',
      'name': 'Android Browser',
      'version': '4.1#{alpha}'
    },

    'BlackBerry Browser on BlackBerry 7250 (Device Software 4.0.0)': {
      'ua': 'BlackBerry7250/4.0.0 Profile/MIDP-2.0 Configuration/CLDC-1.1',
      'name': 'BlackBerry Browser'
    },

    'BlackBerry Browser on BlackBerry 8900 (Device Software 4.5.1.231)': {
      'ua': 'BlackBerry8900/4.5.1.231 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/100',
      'name': 'BlackBerry Browser'
    },

    'BlackBerry Browser (like Safari 4+) on BlackBerry 9800 (Device Software 6.0.0.91)': {
      'ua': 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.1  (KHTML, like Gecko) Version/6.0.0.91 Mobile Safari/534.1 ,gzip(gfe),gzip(gfe)',
      'layout': 'WebKit',
      'name': 'BlackBerry Browser'
    },

    'Camino 0.7 on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.0.1) Gecko/20030306 Camino/0.7',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '0.7'
    },

    'Camino 1.0#{beta}2+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.0.1) Gecko/20060119 Camino/1.0b2+',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '1.0#{beta}2+'
    },

    'Camino 1.0+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1) Gecko/20061013 Camino/1.0+ (Firefox compatible)',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '1.0+'
    },

    'Camino 1.1#{alpha}1+ on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en; rv:1.8.1.1pre) Gecko/20061126 Camino/1.1a1+',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '1.1#{alpha}1+'
    },

    'Camino 1.6#{alpha} on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en; rv:1.8.1.4pre) Gecko/20070511 Camino/1.6pre',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '1.6#{alpha}'
    },

    'Camino 2.0#{beta}3 on Mac OS X 10.5': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en; rv:1.9.0.10pre) Gecko/2009041800 Camino/2.0b3pre (like Firefox/3.0.10pre)',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '2.0#{beta}3'
    },

    'Camino 2.0.3 on Mac OS X 10.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; nl; rv:1.9.0.19) Gecko/2010051911 Camino/2.0.3 (MultiLang) (like Firefox/3.0.19)',
      'layout': 'Gecko',
      'name': 'Camino',
      'version': '2.0.3'
    },

    'Chrome 0.2.149.27 on Windows 2000': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13',
      'layout': 'WebKit',
      'name': 'Chrome',
      'version': '0.2.149.27'
    },

    'Chrome 5.0.375.99 on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.99 Safari/533.4',
      'layout': 'WebKit',
      'name': 'Chrome',
      'version': '5.0.375.99'
    },

    'Chrome 8.1.0.0 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/540.0 (KHTML, like Gecko) Ubuntu/10.10 Chrome/8.1.0.0 Safari/540.0',
      'layout': 'WebKit',
      'name': 'Chrome',
      'version': '8.1.0.0'
    },

    'Chrome 10.0.648.133 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16',
      'layout': 'WebKit',
      'name': 'Chrome',
      'version': '10.0.648.133'
    },

    'Epiphany 0.9.2 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.4) Gecko/20030908 Epiphany/0.9.2',
      'layout': 'Gecko',
      'name': 'Epiphany',
      'version': '0.9.2'
    },

    'Epiphany 2.22 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en; rv:1.9.0.8) Gecko/20080528 Fedora/2.24.3-4.fc10 Epiphany/2.22 Firefox/3.0',
      'layout': 'Gecko',
      'name': 'Epiphany',
      'version': '2.22'
    },

    'Epiphany 2.30.6 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7',
      'layout': 'WebKit',
      'name': 'Epiphany',
      'version': '2.30.6'
    },

    'Firefox 3.0#{alpha}1 on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.9a1) Gecko/20061204 Firefox/3.0a1',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '3.0#{alpha}1'
    },

    'Firefox 3.0.1#{alpha} on Linux armv7l': {
      'ua': 'Mozilla/5.0 (X11; U; Linux armv7l; en-US; rv:1.9.0.1) Gecko/2009010915 Minefield/3.0.1',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '3.0.1#{alpha}'
    },

    'Firefox 3.6.11 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.11) Gecko/20101012 Firefox/3.6.11 (.NET CLR 3.5.30729)',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '3.6.11'
    },

    'Firefox 3.7#{alpha}5 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a5pre) Gecko/20100418 Minefield/3.7a5pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '3.7#{alpha}5'
    },

    'Firefox 4.0#{beta}8 on Windows Server 2008 / Vista x64': {
      'ua': 'Mozilla/5.0 (Windows NT 6.0; Win64; IA64; rv:2.0b8pre) Gecko/20101213 Firefox/4.0b8pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'platform': 'Win64',
      'version': '4.0#{beta}8'
    },

    'Firefox 4.0#{beta}8 x86 on Windows Server 2008 R2 / 7 x64': {
      'ua': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:2.0b8pre) Gecko/20101114 Firefox/4.0b8pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'platform': 'Win32',
      'version': '4.0#{beta}8'
    },

    'Firefox 4.0#{beta}9 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; Linux x86_64; rv:2.0b9pre) Gecko/20110105 Firefox/4.0b9pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '4.0#{beta}9'
    },

    'Firefox 4.0#{beta}11 on Mac OS X 10.6': {
      'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0b11pre) Gecko/20110126 Firefox/4.0b11pre',
      'layout': 'Gecko',
      'name': 'Firefox',
      'version': '4.0#{beta}11'
    },

    'Fennec 2.0#{beta}1 on Android': {
      'ua': 'Mozilla/5.0 (Android; Linux armv7l; rv:2.0b6pre) Gecko/20100907 Firefox/4.0b6pre Fennec/2.0b1pre',
      'layout': 'Gecko',
      'name': 'Fennec',
      'version': '2.0#{beta}1'
    },

    'Fennec 2.0.1 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; Linux i686 on x86_64; rv:2.0.1) Gecko/20100101 Firefox/4.0.1 Fennec/2.0.1',
      'layout': 'Gecko',
      'name': 'Fennec',
      'version': '2.0.1'
    },

    'Flock 2.0#{alpha}1 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9pre) Gecko/2008051917 Firefox/3.0pre Flock/2.0a1pre',
      'layout': 'Gecko',
      'name': 'Flock',
      'version': '2.0#{alpha}1'
    },

    'Flock 2.0#{beta}3 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; es-AR; rv:1.9.0.2) Gecko/2008091920 Firefox/3.0.2 Flock/2.0b3',
      'layout': 'Gecko',
      'name': 'Flock',
      'version': '2.0#{beta}3'
    },

    'Flock 2.0.3 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.0.5) Gecko/2008121620 Firefox/3.0.5 Flock/2.0.3',
      'layout': 'Gecko',
      'name': 'Flock',
      'version': '2.0.3'
    },

    'Flock 2.6.0 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.19) Gecko/2010061201 Firefox/3.0.19 Flock/2.6.0',
      'layout': 'Gecko',
      'name': 'Flock',
      'version': '2.6.0'
    },

    'Galeon 1.2.5 on Linux i686': {
      'ua': 'Mozilla/5.0 Galeon/1.2.5 (X11; Linux i686; U;) Gecko/20020809',
      'layout': 'Gecko',
      'name': 'Galeon',
      'version': '1.2.5'
    },

    'Galeon 2.0.7 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko/20090327 Galeon/2.0.7',
      'layout': 'Gecko',
      'name': 'Galeon',
      'version': '2.0.7'
    },

    'GreenBrowser (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; GreenBrowser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'GreenBrowser'
    },

    'GreenBrowser (running in IE 5 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; GreenBrowser)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'GreenBrowser'
    },

    'iCab 2.8.1 on Mac OS': {
      'ua': 'Mozilla/4.5 (compatible; iCab 2.8.1; Macintosh; I; PPC)',
      'layout': 'iCab',
      'name': 'iCab',
      'version': '2.8.1'
    },

    'iCab 3.0.2 on Mac OS': {
      'ua': 'iCab/3.0.2 (Macintosh; U; PPC Mac OS)',
      'layout': 'iCab',
      'name': 'iCab',
      'version': '3.0.2'
    },

    'iCab 4.5 on Mac OS X Leopard 10.5.8': {
      'ua': 'iCab/4.5 (Macintosh; U; Mac OS X Leopard 10.5.8)',
      'layout': 'WebKit',
      'name': 'iCab',
      'version': '4.5'
    },

    'iCab 4.7 on Mac OS X': {
      'ua': 'iCab/4.7 (Macintosh; U; Intel Mac OS X)',
      'layout': 'WebKit',
      'name': 'iCab',
      'version': '4.7'
    },

    'IE 4.0 on Windows 95': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 4.0; Windows 95)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '4.0'
    },

    'IE 5.5#{beta}1 on Mac OS': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 5.5b1; Mac_PowerPC)',
      'layout': 'Tasman',
      'name': 'IE',
      'version': '5.5#{beta}1'
    },

    'IE 5.5 on Windows 98': {
      'ua': 'Mozilla/4.0 (compatible;MSIE 5.5; Windows 98)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '5.5'
    },

    'IE 5.05 on Windows NT': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 5.05; Windows NT 4.0)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '5.05'
    },

    'IE 6.0#{beta} on Windows ME': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0b; Windows 98; Win 9x 4.90)',
      'layout': 'Trident',
      'name': 'IE',
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
      'version': '6.0'
    },

    'IE 7.0#{beta} on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 5.2)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '7.0#{beta}'
    },

    'IE 7.0 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 5.1; en-US)',
      'layout': 'Trident',
      'name': 'IE',
      'version': '7.0'
    },

    'IE 8.0#{beta}2 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
      'appMinorVersion': 'beta 2',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'version': '8.0#{beta}2'
    },

    'IE 8.0 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; chromeframe/10.0.648.133; chromeframe)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'version': '8.0'
    },

    'IE 8.0 (running in IE 5 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'IE',
      'version': '8.0'
    },

    'IE 8.0 (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; chromeframe)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'IE',
      'version': '8.0'
    },

    'IE 8.0 x86 on Windows Server 2008 / Vista x64': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0)',
      'cpuClass': 'x86',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'platform': 'Win32',
      'version': '8.0'
    },

    'IE 8.0 on Windows Server 2008 R2 / 7 x64': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Win64; x64; Trident/4.0)',
      'cpuClass': 'x64',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'platform': 'Win64',
      'version': '8.0'
    },

    'IE 9.0#{beta} (platform preview) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'external': null,
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (platform preview; running in IE 5 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'external': null,
      'layout': 'Trident',
      'mode': 5,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} x86 (platform preview; running in IE 7 mode) on Windows Server 2008 R2 / 7 x64': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
      'appMinorVersion': 'beta',
      'external': null,
      'layout': 'Trident',
      'mode': 7,
      'name': 'IE',
      'platform': 'Win32',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (platform preview; running in IE 8 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'cpuClass': 'x86',
      'external': null,
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (running in IE 5 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 5,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (running in IE 7 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 7,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0#{beta} (running in IE 8 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 8,
      'name': 'IE',
      'version': '9.0#{beta}'
    },

    'IE 9.0 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE',
      'version': '9.0'
    },

    'IE 10.0 (platform preview) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.0; Trident/6.0)',
      'external': null,
      'layout': 'Trident',
      'mode': 10,
      'name': 'IE',
      'version': '10.0'
    },

    'IE 10.0 (running in IE 9 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
      'layout': 'Trident',
      'mode': 9,
      'name': 'IE',
      'version': '10.0'
    },

    'IE Mobile 7.0 on Samsung (Windows Phone OS 7.0)': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; SAMSUNG; OMNIA7)',
      'external': null,
      'layout': 'Trident',
      'name': 'IE Mobile',
      'version': '7.0'
    },

    'IE Mobile 7.0 on LG (Windows Phone OS 7.0)': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; LG; GW910)',
      'external': null,
      'layout': 'Trident',
      'name': 'IE Mobile',
      'version': '7.0'
    },

    'Iron 0.2.152.0 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Iron/0.2.152.0 Safari/41562480.525',
      'layout': 'WebKit',
      'name': 'Iron',
      'version': '0.2.152.0'
    },

    'Iron 7.0.520.1 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Iron/7.0.520.1 Chrome/7.0.520.1 Safari/534.7',
      'layout': 'WebKit',
      'name': 'Iron',
      'version': '7.0.520.1'
    },

    'Kindle Browser 3.3 (NetFront) on Kindle 1.0 (Linux 2.6.10)': {
      'ua': 'Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)',
      'layout': 'NetFront',
      'name': 'Kindle Browser',
      'version': '3.3'
    },

    'Kindle Browser 3.4 (NetFront) on Kindle 2.0 (Linux 2.6.22)': {
      'ua': 'Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 600x800)',
      'layout': 'NetFront',
      'name': 'Kindle Browser',
      'version': '3.4'
    },

    'Kindle Browser 4.0 (like Safari 4.x) on Kindle 3.0 (Linux)': {
      'ua': 'Mozilla/5.0 (Linux; U; en-US) AppleWebKit/528.5+ (KHTML, like Gecko, Safari/528.5+) Version/4.0 Kindle/3.0 (screen 600x800; rotate)',
      'layout': 'WebKit',
      'name': 'Kindle Browser',
      'version': '4.0'
    },

    'K-Meleon 1.5.0#{beta}2 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.14) Gecko/20080406 K-Meleon/1.5.0b2',
      'layout': 'Gecko',
      'name': 'K-Meleon',
      'version': '1.5.0#{beta}2'
    },

    'K-Meleon 1.5.4 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.24pre) Gecko/20100228 K-Meleon/1.5.4',
      'layout': 'Gecko',
      'name': 'K-Meleon',
      'version': '1.5.4'
    },

    'Konqueror 4.4 on Linux 2.6.32': {
      'ua': 'Mozilla/5.0 (compatible; Konqueror/4.4; Linux 2.6.32-22-generic; X11; en_US) KHTML/4.4.3 (like Gecko) Kubuntu',
      'layout': 'KHTML',
      'name': 'Konqueror',
      'version': '4.4'
    },

    'Lunascape 5.0#{alpha}3 (Trident) on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2; Lunascape 5.0 alpha3)',
      'layout': 'Trident',
      'name': 'Lunascape',
      'version': '5.0#{alpha}3'
    },

    'Lunascape 6.1.7.21880 (Trident) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; Lunascape 6.1.7.21880)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Lunascape',
      'version': '6.1.7.21880'
    },

    'Lunascape 6.2.1.22445 (Gecko) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.13) Gecko/20100917 Firefox/3.5.13 Lunascape/6.2.1.22445',
      'layout': 'Gecko',
      'name': 'Lunascape',
      'version': '6.2.1.22445'
    },

    'Lunascape 6.3.1.22729#{beta} (Trident) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0; Lunascape/6.3.1.22729)',
      'appMinorVersion': 'beta',
      'external': null,
      'layout': 'Trident',
      'mode': 9,
      'name': 'Lunascape',
      'version': '6.3.1.22729#{beta}'
    },

    'Lunascape 6.3.2.22803 (like Safari 4+) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.3 (KHTML, like Gecko) Lunascape/6.3.2.22803 Safari/533.3',
      'layout': 'WebKit',
      'name': 'Lunascape',
      'version': '6.3.2.22803'
    },

    'Maxthon 2.x (Trident) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Maxthon 2.0)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Maxthon',
      'version': '2.x'
    },

    'Maxthon 2.x (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; Maxthon 2.0)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Maxthon',
      'version': '2.x'
    },

    'Maxthon 3.x (like Safari 4+) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.9 (KHTML, like Gecko) Maxthon/3.0 Safari/533.9',
      'layout': 'WebKit',
      'name': 'Maxthon',
      'version': '3.x'
    },

    'Maxthon 3.x (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; Maxthon/3.0)',
      'external': null,
      'layout': 'Trident',
      'mode': 7,
      'name': 'Maxthon',
      'version': '3.x'
    },

    'Maxthon 3.x#{alpha} (Trident) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Maxthon/3.0)',
      'appMinorVersion': 'alpha',
      'external': null,
      'layout': 'Trident',
      'mode': 8,
      'name': 'Maxthon',
      'version': '3.x#{alpha}'
    },

    'Midori (like Safari 3.x) on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; ru-ru) AppleWebKit/525.1+ (KHTML, like Gecko, Safari/525.1+) midori',
      'layout': 'WebKit',
      'name': 'Midori'
    },

    'Midori 0.1.10 on Linux i686': {
      'ua': 'Midori/0.1.10 (X11; Linux i686; U; fr-fr) WebKit/532.1+',
      'layout': 'WebKit',
      'name': 'Midori',
      'version': '0.1.10'
    },

    'Midori 0.1.6 on Linux': {
      'ua': 'Mozilla/5.0 (X11; U; Linux; en-us; rv:1.8.1) Gecko/20061010 Firefox/2.0 Midori/0.1.6',
      'layout': 'WebKit',
      'name': 'Midori',
      'version': '0.1.6'
    },

    'Midori 1.19 (like Safari 3.x) on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; fr-fr) AppleWebKit/525.1+ (KHTML, like Gecko, Safari/525.1+) midori/1.19',
      'layout': 'WebKit',
      'name': 'Midori',
      'version': '1.19'
    },

    'Narwhal on Cygwin': (function() {
      var object = {
        'exports': {},
        'name': 'Narwhal',
        'system':  { 'os': 'cygwin' }
      };
      object.global = object.system.global = object;
      return object;
    }()),

    'Node.js 0.3.1 on Cygwin': {
      'exports': {},
      'global': {},
      'name': 'Node.js',
      'process': { 'version': 'v0.3.1', 'platform': 'cygwin' },
      'version': '0.3.1'
    },

    'Nokia Browser (like Safari 3.x) on Nokia 5530c (SymbianOS)': {
      'ua': 'Mozilla/5.0 (SymbianOS/9.4; U; Series60/5.0 Nokia5530c-2/10.0.050; Profile MIDP-2.1 Configuration/CLDC-1.1) AppleWebKit/525 (KHTML, like Gecko) Safari/525',
      'layout': 'WebKit',
      'name': 'Nokia Browser'
    },

    'Nook Browser 1.0': {
      'ua': 'nook browser/1.0',
      'layout': 'WebKit',
      'name': 'Nook Browser',
      'version': '1.0'
    },

    'Opera Mini 4.1.11355': {
      'ua': 'Opera/9.50 (J2ME/MIDP; Opera Mini/4.1.11355/542; U; en)',
      'layout': 'Presto',
      'name': 'Opera Mini',
      'operamini': { '[[Class]]': 'OperaMini' },
      'version': '4.1.11355'
    },

    'Opera Mini 6.1.15738 on iPhone': {
      'ua': 'Opera/9.80 (iPhone; Opera Mini/6.1.15738/25.669; U; en) Presto/2.5.25 Version/10.54.544',
      'layout': 'Presto',
      'name': 'Opera Mini',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.00'; } },
      'operamini': { '[[Class]]': 'OperaMini' },
      'version': '6.1.15738'
    },

    'Opera Mobile 10.00 on Linux i686': {
      'ua': 'Opera/9.80 (Linux i686; Opera Mobi/1038; U; en) Presto/2.5.24 Version/10.00',
      'layout': 'Presto',
      'name': 'Opera Mobile',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.00'; } },
      'version': '10.00'
    },

    'Opera 10.10 (identifying as Firefox 2.0.0) on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 10.10',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.10'; } },
      'version': '10.10'
    },

    'Opera 10.63 (identifying as IE 6.0) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 10.63',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '10.63'; } },
      'version': '10.63'
    },

    'Opera 11.00 on Windows XP': {
      'ua': 'Opera/9.80 (Windows NT 5.1; U; en) Presto/2.6.37 Version/11.00',
      'layout': 'Presto',
      'name': 'Opera',
      'opera': { '[[Class]]': 'Opera', 'version': function() { return '11.00'; } },
      'version': '11.00'
    },

    'PhantomJS 1.0.0 (like Safari 4.x) on Cygwin': {
      'ua': 'Mozilla/5.0 (X11; U; Cygwin; C -) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3)  PhantomJS/1.0.0',
      'layout': 'WebKit',
      'name': 'PhantomJS',
      'phantom': { 'version': { 'major': 1, 'minor': 0, 'patch': 0 } },
      'version': '1.0.0'
    },

    'PlayBook Browser 0.0.1 (like Safari 4+)': {
      'ua': 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/0.0.1 Safari/534.8+',
      'layout': 'WebKit',
      'name': 'PlayBook Browser',
      'version': '0.0.1'
    },

    'Rekonq (like Safari 4+) on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-GB) AppleWebKit/533.3 (KHTML, like Gecko) rekonq Safari/533.3',
      'layout': 'WebKit',
      'name': 'Rekonq'
    },

    'Rekonq (like Safari 4+) on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; cs-CZ) AppleWebKit/533.3 (KHTML, like Gecko) rekonq Safari/533.3',
      'layout': 'WebKit',
      'name': 'Rekonq'
    },

    'Rhino': {
      'global': {},
      'environment': {},
      'name': 'Rhino'
    },

    'RingoJS': (function() {
      var object = {
        'exports': {},
        'system':  {},
        'name': 'RingoJS'
      };
      object.global = object;
      return object;
    }()),

    'RockMelt 0.8.34.820 (like Chrome 6.0.472.63) on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0(Macintosh; U; Intel Mac OS X 10_5_8; en-US)AppleWebKit/534.3(KHTML,like Gecko)RockMelt/0.8.34.820 Chrome/6.0.472.63 Safari/534.3',
      'layout': 'WebKit',
      'name': 'RockMelt',
      'version': '0.8.34.820'
    },

    'Safari 1.x on Mac OS X': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de) AppleWebKit/85.7 (KHTML, like Gecko) Safari/85.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '1.x'
    },

    'Safari 2.x on Mac OS': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS; en-en) AppleWebKit/412 (KHTML, like Gecko) Safari/412',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '2.x'
    },

    'Safari 3.x on iPod (iOS 2.2.1)': {
      'ua': 'Mozilla/5.0 (iPod; U; CPU iPhone OS 2_2_1 like Mac OS X; en-us) AppleWebKit/525.18.1 (KHTML, like Gecko) Mobile/5H11a',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.x'
    },

    'Safari 3.0 on iPod (iOS)': {
      'ua': 'Mozila/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3A101a Safari/419.3',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.0'
    },

    'Safari 3.1.1 on iPhone (iOS 2.0.1)': {
      'ua': 'Mozilla/5.0 (Mozilla/5.0 (iPhone; U; CPU iPhone OS 2_0_1 like Mac OS X; fr-fr) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/5G77 Safari/525.20',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.1.1'
    },

    'Safari 3.1.1 on Mac OS X 10.5.7': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; de-de) AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1.1 Safari/525.20',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.1.1'
    },

    'Safari 3.1.1 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1.1 Safari/525.17',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.1.1'
    },

    'Safari 3.1.2 on Mac OS X 10.5.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_6; en-us) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.2 Safari/525.20.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.1.2'
    },

    'Safari 3.1.2 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; pl-PL) AppleWebKit/525.19 (KHTML, like Gecko) Version/3.1.2 Safari/525.21',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.1.2'
    },

    'Safari 3.2 on Mac OS X 10.5.5': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_5; en-us) AppleWebKit/525.26.2 (KHTML, like Gecko) Version/3.2 Safari/525.26.12',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2'
    },

    'Safari 3.2 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; hu-HU) AppleWebKit/525.26.2 (KHTML, like Gecko) Version/3.2 Safari/525.26.13',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2'
    },

    'Safari 3.2.1 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; pl-pl) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.1'
    },

    'Safari 3.2.1 on Mac OS X 10.5.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; it-it) AppleWebKit/528.8+ (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.1'
    },

    'Safari 3.2.1 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; sv-SE) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.1'
    },

    'Safari 3.2.2 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; ru-RU) AppleWebKit/525.28 (KHTML, like Gecko) Version/3.2.2 Safari/525.28.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.2'
    },

    'Safari 3.2.2 on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/525.28 (KHTML, like Gecko) Version/3.2.2 Safari/525.28.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.2'
    },

    'Safari 3.2.2 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; de-DE) AppleWebKit/525.28 (KHTML, like Gecko) Version/3.2.2 Safari/525.28.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.2'
    },

    'Safari 3.2.3 on Mac OS X 10.5.7': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; de-de) AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3 Safari/525.28.3',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.3'
    },

    'Safari 3.2.3 on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; ja-jp) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/3.2.3 Safari/525.28.3',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.3'
    },

    'Safari 3.2.3 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; cs-CZ) AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3 Safari/525.29',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '3.2.3'
    },

    'Safari 4.x on iPhone (iOS 3.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Mobile/7E18,gzip(gfe),gzip(gfe)',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.x'
    },

    'Safari 4.x on iPhone Simulator (iOS 4.0)': {
      'ua': 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Mobile/8A293',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.x'
    },

    'Safari 4.x on iPhone (iOS 4.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Mobile/8B117',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.x'
    },

    'Safari 4.0#{alpha}1 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; tr) AppleWebKit/528.4+ (KHTML, like Gecko) Version/4.0dp1 Safari/526.11.2',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0#{alpha}1'
    },

    'Safari 4.0#{alpha}1 on Mac OS X 10.5.4': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_4; en-us) AppleWebKit/528.4+ (KHTML, like Gecko) Version/4.0dp1 Safari/526.11.2',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0#{alpha}1'
    },

    'Safari 4.0#{alpha}1 on Mac OS X 10.5.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; en-gb) AppleWebKit/528.10+ (KHTML, like Gecko) Version/4.0dp1 Safari/526.11.2',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0#{alpha}1'
    },

    'Safari 4.0#{alpha}1 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en) AppleWebKit/526.9 (KHTML, like Gecko) Version/4.0dp1 Safari/526.8',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0#{alpha}1'
    },

    'Safari 4.0 on iPhone (iOS 3.0)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; ko-kr) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on iPod (iOS 3.0)': {
      'ua': 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X; ja-jp) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on iPhone (iOS 3.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7C97d Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on iPhone (iOS 3.1.3)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16 Cydia/1.0.3201-71',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on iPhone (iOS 4.1.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1_1 like Mac OS X; en-en) AppleWebKit/548.18 (KHTML, like Gecko) Version/4.0 Mobile/8F12 Safari/548.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_4_11; en) AppleWebKit/530.1+ (KHTML, like Gecko) Version/4.0 Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Mac OS X 10.5.4': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_4; nl-nl) AppleWebKit/528.4+ (KHTML, like Gecko) Version/4.0 Safari/528.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Mac OS X 10.5.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_6; tr-TR) AppleWebKit/528.16 (KHTML, like Gecko) Version/4.0 Safari/528.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Mac OS X 10.6': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6; en-us) AppleWebKit/530.6+ (KHTML, like Gecko) Version/4.0 Safari/530.6',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW) AppleWebKit/528.16 (KHTML, like Gecko) Version/4.0 Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; ru-RU) AppleWebKit/528.16 (KHTML, like Gecko) Version/4.0 Safari/528.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0'
    },

    'Safari 4.0.1 on Mac OS X 10.5.7': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/4.0.1 Safari/530.18',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.1'
    },

    'Safari 4.0.2 on Mac OS X 10.5.7': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_7; en-us) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.2'
    },

    'Safari 4.0.2 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.2'
    },

    'Safari 4.0.2 on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.2; de-DE) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.2'
    },

    'Safari 4.0.2 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; zh-TW) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.2'
    },

    'Safari 4.0.2 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/532+ (KHTML, like Gecko) Version/4.0.2 Safari/530.19.1',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.2'
    },

    'Safari 4.0.3 on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; en-us) AppleWebKit/532.0+ (KHTML, like Gecko) Version/4.0.3 Safari/531.9.2009',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.3'
    },

    'Safari 4.0.3 on Mac OS X 10.6.1': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_1; nl-nl) AppleWebKit/532.3+ (KHTML, like Gecko) Version/4.0.3 Safari/531.9',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.3'
    },

    'Safari 4.0.3 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-us) AppleWebKit/531.9 (KHTML, like Gecko) Version/4.0.3 Safari/531.9',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.3'
    },

    'Safari 4.0.4 on iPad (iOS 3.2)': {
      'ua': 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on iPhone (iOS 3.2)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on iPhone Simulator (iOS 3.2)': {
      'ua': 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7D11 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; hu-hu) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Mac OS X 10.6.2': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_2; ru-ru) AppleWebKit/533.2+ (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Mac OS X 10.6.3': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us) AppleWebKit/531.21.11 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE) AppleWebKit/532+ (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.4 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ko-KR) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.4'
    },

    'Safari 4.0.5 on iPhone (iOS 4.1)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B5097d Safari/6531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; da-dk) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; en-us) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Mac OS X 10.6.2': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_2; ja-jp) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Mac OS X 10.6.3': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; ja-jp) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; cs-CZ) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.0.5 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; es-ES) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.0.5'
    },

    'Safari 4.1 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; nl-nl) AppleWebKit/533.16 (KHTML, like Gecko) Version/4.1 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.1'
    },

    'Safari 4.1 on Mac OS X 10.7': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_7; en-us) AppleWebKit/533.4 (KHTML, like Gecko) Version/4.1 Safari/533.4',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '4.1'
    },

    'Safari 5.0 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-ca) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/531.2+',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0 on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; ja-jp) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0 on Mac OS X 10.4.11': {
      'ua': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; fr) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0 on Mac OS X 10.6.3': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; zh-cn) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; ja-JP) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ja-JP) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0'
    },

    'Safari 5.0.1 on Windows Server 2003 / XP x64': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.1'
    },

    'Safari 5.0.2 on iPad (iOS 4.3)': {
      'ua': '(iPad; U; CPU OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190 Safari/6533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'Safari 5.0.2 on iPhone (iOS 4.3)': {
      'ua': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190 Safari/6533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'Safari 5.0.2 on Mac OS X 10.5.8': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; zh-cn) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'Safari 5.0.2 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; ru-RU) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'Safari 5.0.2 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; tr-TR) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'Safari 5.0.2 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; zh-HK) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
      'layout': 'WebKit',
      'name': 'Safari',
      'version': '5.0.2'
    },

    'SeaMonkey 1.1.7#{alpha}': {
      'ua': 'Mozilla/5.0 (BeOS; U; Haiku BePC; en-US; rv:1.8.1.10pre) Gecko/20080112 SeaMonkey/1.1.7pre',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'version': '1.1.7#{alpha}'
    },

    'SeaMonkey 1.1.13': {
      'ua': 'Seamonkey-1.1.13-1(X11; U; GNU Fedora fc 10) Gecko/20081112',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'version': '1.1.13'
    },

    'SeaMonkey 2.0#{beta}1 on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.1pre) Gecko/20090717 SeaMonkey/2.0b1',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'version': '2.0#{beta}1'
    },

    'SeaMonkey 2.0.3 on Linux x86_64': {
      'ua': 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.1.8) Gecko/20100205 SeaMonkey/2.0.3',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'version': '2.0.3'
    },

    'SeaMonkey 2.0.8 on Windows XP': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.13) Gecko/20100914 Mnenhy/0.8.3 SeaMonkey/2.0.8',
      'layout': 'Gecko',
      'name': 'SeaMonkey',
      'version': '2.0.8'
    },

    'Sleipnir 2.8.4 on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; Sleipnir 2.8.4)',
      'layout': 'Trident',
      'name': 'Sleipnir',
      'version': '2.8.4'
    },

    'Sleipnir 2.9.2#{beta} on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Sleipnir/2.9.2)',
      'appMinorVersion': 'beta',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Sleipnir',
      'version': '2.9.2#{beta}'
    },

    'Sleipnir 2.9.4 (running in IE 7 mode) on Windows Server 2008 / Vista': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/4.0; Sleipnir/2.9.4)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'Sleipnir',
      'version': '2.9.4'
    },

    'Sleipnir 2.9.6 on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; Sleipnir/2.9.6)',
      'layout': 'Trident',
      'mode': 8,
      'name': 'Sleipnir',
      'version': '2.9.6'
    },

    'SlimBrowser (running in IE 7 mode) on Windows XP': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SlimBrowser)',
      'layout': 'Trident',
      'mode': 7,
      'name': 'SlimBrowser'
    },

    'SlimBrowser (running in IE 5 mode) on Windows Server 2008 R2 / 7': {
      'ua': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/4.0; SlimBrowser)',
      'layout': 'Trident',
      'mode': 5,
      'name': 'SlimBrowser'
    },

    'Sunrise 1.7.5 on Mac OS X 10.5.5': {
      'ua': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_5; ja-jp) AppleWebKit/525.18 (KHTML, like Gecko) Sunrise/1.7.5 like Safari/5525.20.1',
      'layout': 'WebKit',
      'name': 'Sunrise',
      'version': '1.7.5'
    },

    'Sunrise 4.0.1 on Linux x86_64': {
      'ua': 'Mozilla/6.0 (X11; U; Linux x86_64; en-US; rv:2.9.0.3) Gecko/2009022510 FreeBSD/ Sunrise/4.0.1/like Safari',
      'layout': 'WebKit',
      'name': 'Sunrise',
      'version': '4.0.1'
    },

    'Swiftfox 2.0.0.6 on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.6) Gecko/20070803 Firefox/2.0.0.6 (Swiftfox)',
      'layout': 'Gecko',
      'name': 'Swiftfox',
      'version': '2.0.0.6'
    },

    'Swiftfox 3.0.10#{alpha} on Linux i686': {
      'ua': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.10pre) Gecko/2009041814 Firefox/3.0.10pre (Swiftfox)',
      'layout': 'Gecko',
      'name': 'Swiftfox',
      'version': '3.0.10#{alpha}'
     },

    'webOS Browser 1.0 (like Safari 3.x) on webOS 1.2.9': {
      'ua': 'Mozilla/5.0 (webOS/Palm webOS 1.2.9; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pixi/1.0',
      'layout': 'WebKit',
      'name': 'webOS Browser',
      'version': '1.0'
    },

    'webOS Browser 1.0 (like Safari 4.x) on webOS 1.4.0': {
      'ua': 'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.0',
      'layout': 'WebKit',
      'name': 'webOS Browser',
      'version': '1.0'
    },

    'TouchPad Browser (like Safari 4+) on TouchPad 1.0 (webOS 3.0.0)': {
      'ua': 'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-GB) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0',
      'layout': 'WebKit',
      'name': 'TouchPad Browser'
    },

    'Lynx/2.8.8dev.3 libwww-FM/2.14 SSL-MM/1.4.1': {
      'ua': 'Lynx/2.8.8dev.3 libwww-FM/2.14 SSL-MM/1.4.1'
    },

    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8) Gecko/20100728 Firefox/3.6.8 CometBird/3.6.8,gzip(gfe),gzip(gfe)': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8) Gecko/20100728 Firefox/3.6.8 CometBird/3.6.8,gzip(gfe),gzip(gfe)',
      'layout': 'Gecko'
    },

    'Mozilla/5.0 (PLAYSTATION 3; 2.00)': {
      'ua': 'Mozilla/5.0 (PLAYSTATION 3; 2.00)'
    },

    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 Prism/1.0b2': {
      'ua': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 Prism/1.0b2',
      'layout': 'Gecko'
    }
  };

  /*--------------------------------------------------------------------------*/

  module('platform');

  test('platform.description', function() {
    each(Tests, function(value, key) {
      key = interpolate(key, { 'alpha': '\u03b1', 'beta': '\u03b2' });
      equals(String(getPlatform(value)), key, key);
    });
  });

  test('platform.layout', function() {
    each(Tests, function(value) {
      var platform = getPlatform(value);
      equals(platform.layout, value.layout, String(platform));
    });
  });

  test('platform.name', function() {
    each(Tests, function(value) {
      var platform = getPlatform(value);
      equals(platform.name, value.name, String(platform));
    });
  });

  test('platform.version', function() {
    each(Tests, function(value) {
      var platform = getPlatform(value),
          version = value.version;
      equals(platform.version, version ? interpolate(version, { 'alpha': '\u03b1', 'beta': '\u03b2' }) : null, String(platform));
    });
  });

  test('platform.noConflict', function() {
    var p = [platform, platform.noConflict()];
    equals(p[0], p[1], 'returns platform object');
    strictEqual(1, platform, 'restores overwritten value');
    platform = p[0];
  });

  test('check null values', function() {
    each(Tests, function(value) {
      each(getPlatform(value), function(value, key) {
        !value && strictEqual(value, null, 'platform.' + key);
      });
    });
  });

  if (isHostType(window, 'require')) {
    test('require("platform")', function() {
      equals((platform2 || {}).description, platform.description, 'require("platform")');
    });
  }
}(this));