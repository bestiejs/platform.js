/*!
 * Platform.js <http://mths.be/platform>
 * Copyright 2010-2011 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function(window) {

  /** Backup possible window/global object */
  var oldWin = window,

  /** Possible global object */
  thisBinding = this,

  /** Detect free variable `exports` */
  freeExports = typeof exports == 'object' && exports,

  /** Detect free variable `global` */
  freeGlobal = typeof global == 'object' && global && (global == global.global ? (window = global) : global),

  /** Used to resolve a value's internal [[Class]] */
  toString = {}.toString,

  /** Detect Java environment */
  java = /Java/.test(getClassOf(window.java)) && window.java,

  /** A character to represent alpha */
  alpha = java ? 'a' : '\u03b1',

  /** A character to represent beta */
  beta = java ? 'b' : '\u03b2',

  /** Browser document object */
  doc = window.document || {},

  /** Used to preserve a pristine reference */
  hasOwnProperty = {}.hasOwnProperty,

  /** Browser navigator object */
  nav = window.navigator || {},

  /** Previous platform object */
  old = window.platform,

  /** Browser user agent string */
  userAgent = nav.userAgent || 'unknown platform',

  /**
   * Detect Opera browser
   * http://www.howtocreate.co.uk/operaStuff/operaObject.html
   * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
   */
  opera = window.operamini || window.opera,

  /** Opera regexp */
  reOpera = /Opera/,

  /** Opera [[Class]] */
  operaClass = reOpera.test(operaClass = getClassOf(opera)) ? operaClass : (opera = null);

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   * @private
   * @param {String} string The string.
   * @returns {String} The capitalized string.
   */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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
        skipCheck = 'item' in object,
        length = object.length;

    // in Opera < 10.5 `hasKey(object, 'length')` returns false for NodeLists
    if (length == length >>> 0) {
      while (++i < length) {
        // in Safari 2 `i in object` is always false for NodeLists
        if ((skipCheck || i in object) &&
            callback(object[i], i, object) === false) {
          break;
        }
      }
    } else {
      for (i in object) {
        if (hasKey(object, i) &&
            callback(object[i], i, object) === false) {
          break;
        }
      }
    }
    return result;
  }

  /**
   * Trim and conditionally capitalize string values.
   * @private
   * @param {String} string The string to format.
   * @returns {String} The formatted string.
   */
  function format(string) {
    string = string.replace(/^\s+|\s+$/g, '');
    return /^(?:webOS|i(?:OS|P))/.test(string) ? string : capitalize(string);
  }

  /**
   * Gets the internal [[Class]] of a value.
   * @private
   * @param {Mixed} value The value.
   * @returns {String} The [[Class]].
   */
  function getClassOf(value) {
    return value == null ? capitalize(String(value)) : toString.call(value).slice(8, -1);
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
        parent = (object.constructor || Object).prototype;

    // for modern browsers
    object = Object(object);
    if (typeof hasOwnProperty == 'function') {
      result = hasOwnProperty.call(object, key);
    }
    // for Safari 2
    else if ({}.__proto__ == Object.prototype) {
      object.__proto__ = [object.__proto__, object.__proto__ = null, result = key in object][0];
    }
    // for others (not as accurate)
    else {
      result = key in object && !(key in parent && object[key] === parent[key]);
    }
    return result;
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
    var noaccum = arguments.length < 3;
    each(array, function(value, index) {
      accumulator = noaccum ? (noaccum = 0, value) : callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   * @private
   * @param {String} ua The user agent string.
   * @returns {Object} A platform object.
   */
  function getPlatform(ua) {

    ua || (ua = userAgent);

    /** Temporary variable used over the script's lifetime */
    var data = {},

    /** Platform description array */
    description = [],

    /** The browser/environment version */
    version = opera && typeof opera.version == 'function' && opera.version(),

    /* Detectable layout engines (order is important) */
    layout = getLayout([
      'AppleWebKit',
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'Trident',
      'KHTML',
      'Gecko'
    ]),

    /* Detectable products (order is important) */
    product = getProduct([
      'BlackBerry',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      'Nook',
      'PlayBook',
      'TouchPad',
      'Transformer',
      'Xoom'
    ]),

    /* Detectable manufacturers */
    manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'HP': { 'TouchPad': 1 },
      'LG': { },
      'Motorola': { 'Xoom': 1 },
      'Nokia': { },
      'Samsung': { }
    }),

    /* Detectable browser names (order is important) */
    name = getName([
      'Arora',
      'Avant Browser',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iron',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Minefield',
      'Nook Browser',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'Opera Mini',
      'Opera',
      'Chrome',
      'Firefox',
      'MSIE',
      'Safari'
    ]),

    /* Detectable OSes (order is important) */
    os = getOS([
      'Android',
      'Cygwin',
      'SymbianOS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout from an array of guesses.
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {String|Null} The detected layout.
     */
    function getLayout(guesses){
      return reduce(guesses, function(result, guess, index) {
        return result || RegExp('\\b' + guess + '\\b', 'i').exec(ua) &&
          (guess == 'AppleWebKit' ? 'WebKit' : guess);
      }, null);
    }

    /**
     * Picks the manufacturer from an array of guesses.
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {String|Null} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        if (!result && (result =
            (value[/^[a-z]+/i.exec(product)] ||
            RegExp('\\b' + key + '(?:\\b|\\w*\\d)', 'i').exec(ua)) && key)) {
          product || (product = getProduct([result]));
        }
        return result;
      }, null);
    }

    /**
     * Picks the browser name from an array of guesses.
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {String|Null} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + guess + '\\b', 'i').exec(ua) &&
          (guess == 'MSIE' ? 'IE' : guess);
      }, null);
    }

    /**
     * Picks the OS name from an array of guesses.
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {String|Null} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        if (!result && (result = RegExp('\\b' + guess + '[^();-]*', 'i').exec(ua))) {
          // platform tokens defined at
          // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
          data = {
            '6.1': 'Server 2008 R2 / 7',
            '6.0': 'Server 2008 / Vista',
            '5.2': 'Server 2003 / XP x64',
            '5.1': 'XP',
            '5.0': '2000',
            '4.0': 'NT',
            '4.9': 'ME'
          };
          // detect Windows version from platform tokens
          if (/^Win/i.test(result) && (data = data[0/*opera fix*/, /[456]\.\d/.exec(result)])) {
            result = 'Windows ' + data;
          }
          // normalize iOS
          else if (/^i/.test(product)) {
            name || (name = 'Safari');
            result = 'iOS' + ((data = /\bOS ([\d_]+)/i.exec(ua)) ? ' ' + data[1] : '');
          }
          // cleanup
          result = String(result)
            .replace(RegExp(guess, 'i'), guess)
            .replace(/hpw/, 'web')
            .replace(/Macintosh/i, 'Mac OS')
            .replace(/_PowerPC/i, ' OS')
            .replace(/(OS X) Mach$/i, '$1')
            .replace(/(Symbian)(OS)/, '$1 $2')
            .replace(/\/(\d)/, ' $1')
            .replace(/_/g, '.')
            .replace(/x86\.64/gi, 'x86_64')
            .split(' on ')[0];
        }
        return result;
      }, null);
    }

    /**
     * Picks the product name from an array of guesses.
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {String|Null} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        if (!result && (result =
            RegExp('\\b' + guess + '\\s*\\d+[.\\w]*', 'i').exec(ua) ||
            RegExp('\\b' + guess + '(?:;\\s*[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua))) {
          // correct character case and split by forward slash
          if ((result = String(result).replace(RegExp(guess, 'i'), guess).split('/'))[1]) {
            // set browser version if product already has a version
            if (/[\d.]+/.test(result[0])) {
              version || (version = result[1]);
            } else {
              result[0] += ' ' + result[1];
            }
          }
          result = format(/;/.test(result)
            ? result[0].replace(/;\s+/, ' ')
            : result[0].replace(RegExp('(' + guess + ')(\\w)', 'i'), '$1 $2'));
        }
        return result;
      }, null);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Restores a previously overwritten platform object.
     * @memberOf platform
     * @type Function
     * @returns {Object} The current platform object.
     */
    function noConflict() {
      window['platform'] = old;
      return this;
    }

    /**
     * Return platform description when the platform object is coerced to a string.
     * @name toString
     * @memberOf platform
     * @type Function
     * @returns {String} The platform description.
     */
    function toStringPlatform() {
      return this.description;
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array to support the addition of contextual information
    layout && (layout = [layout]);

    // detect simulator
    if (/Simulator/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect non Firefox/Safari like browsers
    if (ua && (data = !name || /Firefox|Safari/.exec(name))) {
      if (name && !product && /[/,]/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        name = null;
      }
      if ((data = product || manufacturer || os) && !/^(?:iP|Linux|Mac|Win)/.test(data)) {
        name = /[a-z]+/i.exec(/Android/.test(os) && os || data) + ' Browser';
      }
    }
    // detect Android browsers
    if (manufacturer && name == 'Chrome') {
      name = 'Android Browser';
    }
    // detect non-Opera versions
    if (!version) {
      version = reduce([/Mini|Raven/.test(name) ? name : 'version', name, 'AdobeAIR', 'Firefox', 'NetFront'], function(result, guess) {
        return result || (RegExp(guess + '(?:-[\\d.]+/|(?: for [-\\w]+)?[ /-])([\\d.]+[^ ();/-]*)', 'i').exec(ua) || 0)[1] || null;
      }, null);
    }
    // detect stubborn layout engines
    if (data = !layout && (opera && 'Presto' ||
        /\bMSIE\b/i.test(ua) &&(/^Mac/.test(os) ? 'Tasman' : 'Trident')) ||
        /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit') {
      layout = [data];
    } else if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    }
    // detect server-side environments
    // Rhino has a global function while others have a global object
    if (isHostType(thisBinding, 'global')) {
      if (java && !os) {
        os = java.lang.System.getProperty('os.name') + ' ' + java.lang.System.getProperty('os.version');
      }
      if (typeof exports == 'object' && exports) {
        // if `thisBinding` is the [ModuleScope]
        if (thisBinding == oldWin && typeof system == 'object' && (data = [system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            data[0].global == freeGlobal && (name = 'Narwhal');
          }
        } else if (typeof process == 'object' && (data = process)) {
          name = 'Node.js';
          version = /[\d.]+/.exec(data.version)[0];
          os = data.platform;
        }
      } else if (getClassOf(window.environment) == 'Environment') {
        name = 'Rhino';
      }
    }
    // detect Adobe AIR
    else if (getClassOf(data = window.runtime) == 'ScriptBridgingProxyObject') {
      name = 'Adobe AIR';
      os = data.flash.system.Capabilities.os;
    }
    // detect PhantomJS
    else if (getClassOf(data = window.phantom) == 'RuntimeObject') {
      name = 'PhantomJS';
      version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
    }
    // detect IE compatibility mode
    else if (typeof doc.documentMode == 'number' && (data = /Trident\/(\d+)/i.exec(ua))) {
      version = [version, doc.documentMode];
      version[1] = (data = +data[1] + 4) != version[1] ? (layout[1] = '', description.push('running in IE ' + version[1] + ' mode'), data) : version[1];
      version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
    }
    // detect release phases
    if (version && (data =
        /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
        /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + nav.appMinorVersion))) {
      version = version.replace(RegExp(data + '\\+?$'), '') + (/b/i.test(data) ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // obscure Maxthon's unreliable version info
    if (name == 'Maxthon') {
      version = version && version.replace(/\.[.\d]+/, '.x');
    }
    // rename older Firefox nightlies
    else if (name == 'Minefield') {
      name = 'Firefox';
      version = !version || (RegExp(alpha + '|' + beta).test(version) ? version : version + alpha);
    }
    // add mobile postfix
    else if (name && (!product || name == 'IE') && !/Browser/.test(name) && /Mobi/i.test(ua)) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && typeof external == 'object' && !external) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if (/BlackBerry/.test(product) && (data =
        (RegExp(product.replace(/\s/g, '') + '/([\\d.]+)', 'i').exec(ua) || 0)[1] || version)) {
      os = 'Device Software ' + data;
      version = null;
    }
    // detect an Opera identity crisis
    // http://www.opera.com/support/kb/view/843/
    else if (opera && (data = [opera, opera = 0, getPlatform(ua.replace(reOpera, ''))], opera = data[0], data = data[2]).name && !reOpera.test(data.name)) {
      description.push((reOpera.test(name) ? 'identify' : 'mask') + 'ing as ' + data.name + ((data = data.version) ? ' ' + data : ''));
      name = reOpera.test(name) ? name : format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
      layout = ['Presto'];
    }
    // detect unspecified Chrome/Safari versions and WebKit Nightly
    if ((data = (/AppleWebKit\/(\d+(?:\.\d+)?\+?)/i.exec(ua) || 0)[1])) {
      // detect WebKit Nightly
      if (data.slice(-1) == '+' && (data = data.slice(0, -1), name == 'Safari')) {
        name = 'WebKit Nightly';
        version = data;
      }
      // detect JavaScriptCore vs V8
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (/\n/.test(toString.toString())) {
        layout[1] = 'like Safari';
        data = data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : '5';
      } else {
        layout[1] = 'like Chrome';
        data = data < 530 ? 1 : data < 532 ? 2 : data < 532.5 ? 3 : data < 533 ? 4 : data < 534.3 ? 5 : data < 534.7 ? 6 : data < 534.1 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.3 ? 11 : data < 535.1 ? 12 : data < 535.2 ? '13+' : data < 535.5 ? 15 : '16'
      }
      data = (/Chrome\/([\d.]+)/i.exec(ua) || 0)[1] || data;
      layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+');
      version = name == 'Safari' && (!version || parseInt(version) > 45) ? data : version;
    }
    // add layout engine
    if (layout && !/Avant|Nook/.test(name) && (/Browser|Lunascape|Maxthon/.test(name) ||
        layout[1] && /Adobe|Arora|Midori|Phantom|Rekonq|RockMelt|Sleipnir|WebKit/.test(name))) {
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && String(product).indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((String(description[description.length -1]).indexOf('on ') < 0 ? 'on ' : '') + product);
    }
    // add browser/OS architecture
    if (/\b(?:WOW|x|IA)64\b/i.test(ua)) {
      os = os && os + (/64/.test(os) ? '' : ' x64');
      if (name && (/WOW64/i.test(ua) || /\w(?:86|32)$/.test(nav.cpuClass || nav.platform))) {
        description.unshift('x86');
      }
    }

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     * @name platform
     * @type Object
     */
    return {

      /**
       * The browser/environment version.
       * @memberOf platform
       * @type String|Null
       */
      'version': name && version && (description.unshift(version), version),

      /**
       * The name of the browser/environment.
       * @memberOf platform
       * @type String|Null
       */
      'name': name && (description.unshift(name), name),

      /**
       * The name of the operating system.
       * @memberOf platform
       * @type String|Null
       */
      'os': name && (os = os && format(os)) && (description.push(product ? '(' + os + ')' : 'on ' + os), os),

      /**
       * The platform description.
       * @memberOf platform
       * @type String
       */
      'description': description.length ? description.join(' ') : ua,

      /**
       * The name of the browser layout engine.
       * @memberOf platform
       * @type String|Null
       */
      'layout': layout && layout[0],

      /**
       * The name of the product's manufacturer.
       * @memberOf platform
       * @type String|Null
       */
      'manufacturer': manufacturer,

      /**
       * The name of the product hosting the browser.
       * @memberOf platform
       * @type String|Null
       */
      'product': product,

      // avoid platform object conflicts in browsers
      'noConflict': noConflict,

      // returns the platform description
      'toString': toStringPlatform
    };
  }

  /*--------------------------------------------------------------------------*/

  // expose platform
  // in Narwhal, Node.js, or Ringo
  if (freeExports) {
    each(getPlatform(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // via curl.js or RequireJS
  else if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define(function() { return getPlatform(); });
  }
  // in a browser or Rhino
  else {
    // use square bracket notation so Closure Compiler won't munge `platform`
    // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
    window['platform'] = getPlatform();
  }
}(this));