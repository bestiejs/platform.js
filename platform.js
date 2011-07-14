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
  freeGlobal = isHostType(thisBinding, 'global') && (freeExports ? (window = global) : global),

  /** Detect Java environment */
  java = /Java/.test(getClassOf(window.java)) && window.java,

  /** A character to represent alpha */
  alpha = java ? 'a' : '\u03b1',

  /** A character to represent beta */
  beta = java ? 'b' : '\u03b2',

  /** Browser document object */
  doc = window.document || {},

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
   * Copies own/inherited properties of a source object to the destination object.
   * @private
   * @param {Object} destination The destination object.
   * @param {Object} [source={}] The source object.
   * @returns {Object} The destination object.
   */
  function extend(destination, source) {
    source || (source = {});
    for (var key in source) {
      destination[key] = source[key];
    }
    return destination;
  }

  /**
   * Trims and conditionally capitalizes string values.
   * @private
   * @param {String} string The string to format.
   * @returns {String} The formatted string.
   */
  function format(string) {
    string = string.replace(/^\s+|\s+$/g, '');
    return /^(?:webOS|i(?:OS|P))/.test(string) ? string : capitalize(string);
  }

  /**
   * Gets the internal [[Class]] value of an object.
   * @private
   * @param {Object} object The object.
   * @returns {String} The [[Class]] value.
   */
  function getClassOf(object) {
    return object == null ? capitalize(String(object)) : {}.toString.call(object).slice(8, -1);
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
   * An `Array#reduce` like solution.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [accumulator=undefined] Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */
  function reduce(array, callback, accumulator) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (index in array) {
        accumulator = callback(accumulator, array[index], index, array);
      }
    }
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

    /** Temporary variable used over the script's lifetime */
    var data = { '6.1': 'Server 2008 R2 / 7', '6.0': 'Server 2008 / Vista', '5.2': 'Server 2003 / XP x64', '5.1': 'XP', '5.0': '2000', '4.0': 'NT', '4.9': 'ME' },

    /** Platform description array  */
    description = [],

    /** String of detectable layout engines */
    layout = 'AppleWebKit,iCab,Presto,NetFront,Tasman,Trident,KHTML,Gecko',

    /** String of detectable browser names */
    name = 'Arora,Avant Browser,Camino,Epiphany,Fennec,Flock,Galeon,GreenBrowser,iCab,Iron,K-Meleon,Konqueror,Lunascape,Maxthon,Midori,Minefield,Nook Browser,Rekonq,RockMelt,SeaMonkey,Sleipnir,SlimBrowser,Sunrise,Swiftfox,Opera Mini,Opera,Chrome,Firefox,MSIE,Safari',

    /** String of detectable operating systems */
    os = 'Android,Cygwin,SymbianOS,(?:hpw|web)OS[ /]\\d,Linux,Mac OS(?: X)?,Macintosh,Mac,Windows 98;,Windows ',

    /** String of detectable products */
    product = 'BlackBerry\\s?\\d+,iP[ao]d,iPhone,Kindle,LG,Nokia,Nook,PlayBook,Samsung,TouchPad,Xoom',

    /** Stores browser/environment version */
    version = opera && typeof opera.version == 'function' && opera.version();

    /*------------------------------------------------------------------------*/

    /**
     * Restores a previously overwritten platform object.
     * @member platform
     * @type Function
     * @returns {Object} The current platform object.
     */
    function noConflict() {
      window['platform'] = old;
      return this;
    }

    /**
     * Return platform description when the platform object is coerced to a string.
     * @member platform
     * @type Function
     * @returns {String} The platform description.
     */
    function toString() {
      return this.description;
    }

    /*------------------------------------------------------------------------*/

    ua || (ua = userAgent);

    layout = reduce(layout.split(','), function(layout, guess, index) {
      return layout || RegExp('\\b' + guess + '\\b', 'i').exec(ua) && [guess == 'AppleWebKit' ? 'WebKit' : guess];
    });

    name = reduce(name.split(','), function(name, guess) {
      return name || RegExp('\\b' + guess + '\\b', 'i').exec(ua) && (guess == 'MSIE' ? 'IE' : guess);
    });

    product = reduce(product.split(','), function(product, guess) {
      if (!product && (product = RegExp('\\b' + guess + '[^ ();-]*', 'i').exec(ua))) {
        // correct character case and split by forward slash
        if ((product = String(product).replace(RegExp(guess = /\w+/.exec(guess), 'i'), guess).split('/'))[1]) {
          if (/[\d.]+/.test(product[0])) {
            version || (version = product[1]);
          } else {
            product[0] += ' ' + product[1];
          }
        }
        product = format(product[0].replace(/([a-z])(\d)/i, '$1 $2'));
      }
      return product;
    });

    os = reduce(os.split(','), function(os, guess) {
      if (!os && (os = RegExp('\\b' + guess + '[^();/-]*', 'i').exec(ua))) {
        // platform tokens defined at
        // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
        if (/^Win/i.test(os) && (data = data[0/*opera fix*/, /[456]\.\d/.exec(os)])) {
          os = 'Windows ' + data;
        }
        // normalize iOS
        else if (/^i/.test(product)) {
          name || (name = 'Safari');
          os = 'iOS' + ((data = /\bOS ([\d_]+)/i.exec(ua)) ? ' ' + data[1] : '');
        }
        // cleanup
        os = String(os).replace(RegExp(guess = /\w+/.exec(guess), 'i'), guess)
          .replace(/Macintosh/i, 'Mac OS').replace(/_PowerPC/i, ' OS').replace(/(OS X) Mach$/i, '$1')
          .replace(/\/(\d)/, ' $1').replace(/_/g, '.').replace(/x86\.64/gi, 'x86_64')
          .replace(/hpw/, 'web').split(' on ')[0];
      }
      return os;
    });

    // detect simulator
    if (/Simulator/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect non Firefox/Safari like browsers
    if (ua && (data = !name || /Firefox|Safari/.exec(name))) {
      if (name && !product && /[/,]/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        name = null;
      }
      if ((data = product || os) && !/^(?:iP|Linux|Mac|Win)/.test(data)) {
        name = /[a-z]+/i.exec(/Android/.test(os) && os || data) + ' Browser';
      }
    }
    // detect non Opera desktop versions
    if (!version) {
      version = reduce([/Mini/.test(opera && name) ? name : 'version', name, 'AdobeAIR', 'Firefox', 'NetFront'], function(version, guess) {
        return version || (RegExp(guess + '(?:-[\\d.]+/|[ /-])([\\d.]+[^ ();/-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }
    // detect stubborn layout engines
    if (data = !layout && (opera && 'Presto' || /\bMSIE\b/i.test(ua) && (/^Mac/.test(os) ? 'Tasman' : 'Trident')) || /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit') {
      layout = [data];
    } else if (layout == 'iCab') {
      layout = parseFloat(version) > 3 ? ['WebKit'] : layout;
    }
    // detect server-side js
    if (freeGlobal) {
      if (typeof exports == 'object' && exports) {
        if (thisBinding == oldWin && typeof system == 'object' && (data = system)) {
          name = data.global == freeGlobal ? 'Narwhal' : 'RingoJS';
          os = data.os || null;
        }
        else if (typeof process == 'object' && (data = process)) {
          name = 'Node.js';
          version = /[\d.]+/.exec(data.version)[0];
          os = data.platform;
        }
      } else if (getClassOf(thisBinding.environment) == 'Environment') {
        name = 'Rhino';
      }
      if (java && !os) {
        os = String(java.lang.System.getProperty('os.name'));
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
    if (version && (data = /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) || /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + nav.appMinorVersion))) {
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
    else if (/BlackBerry/.test(version != null && product)) {
      os = 'Device Software ' + version;
      version = null;
    }
    // detect an Opera identity crisis
    // http://www.opera.com/support/kb/view/843/
    if (opera && (data = [opera, opera = 0, getPlatform(ua.replace(reOpera, ''))], opera = data[0], data = data[2]).name && !reOpera.test(data.name)) {
      description.push((reOpera.test(name) ? 'identify' : 'mask') + 'ing as ' + data.name + ((data = data.version) ? ' ' + data : ''));
      name = reOpera.test(name) ? name : format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
      layout = ['Presto'];
    }
    // detect unspecified Chrome/Safari versions
    else if (data = (/AppleWebKit\/(\d+(?:\.\d+)?)/i.exec(ua) || 0)[1]) {
      if (/Android|RockMelt/.test(os + name)) {
        layout[1] = 'like Chrome';
        data = data < 530 ? 1 : data < 532 ? 2 : data < 532.5 ? 3 : data < 533 ? 4 : data < 534.3 ? 5 : data < 534.7 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : '10';
      } else {
        layout[1] = 'like Safari';
        data = data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : '4';
      }
      data = (/Chrome\/([\d.]+)/i.exec(ua) || 0)[1] || data;
      layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /\./.test(data) ? '' : '+');
      version = name == 'Safari' && (!version || parseInt(version) > 45) ? data : version;
    }
    // add layout engine
    if (layout && !/Avant|Nook/.test(name) && (/Browser|Lunascape|Maxthon/.test(name) || layout[1] && /Adobe|Arora|Midori|Phantom|Rekonq|RockMelt|Sleipnir/.test(name))) {
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append product
    if (product && String(name).indexOf(product) < 0) {
      description.push('on ' + product);
    }
    // add browser/os architecture
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
       * @member platform
       * @type {String|Null}
       */
      'version': name && version && (description.unshift(version), version),

      /**
       * The name of the browser/environment.
       * @member platform
       * @type {String|Null}
       */
      'name': name && (description.unshift(name), name),

      /**
       * The name of the operating system.
       * @member platform
       * @type {String|Null}
       */
      'os': name && (os = os && format(os)) && (description.push(product ? '(' + os + ')' : 'on ' + os), os),

      /**
       * The platform description.
       * @member platform
       * @type {String}
       */
      'description': description.length ? description.join(' ') : ua,

      /**
       * The name of the browser layout engine.
       * @member platform
       * @type {String|Null}
       */
      'layout': layout && layout[0],

      /**
       * The name of the product hosting the browser.
       * @member platform
       * @type {String|Null}
       */
      'product': product,

      // avoid platform object conflicts in browsers
      'noConflict': noConflict,

      // returns the platform description
      'toString': toString
    };
  }

  /*--------------------------------------------------------------------------*/

  // expose platform
  // in Narwhal, Node.js or Ringo
  if (freeExports) {
    extend(freeExports, getPlatform());
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