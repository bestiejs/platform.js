# Platform.js <span>v1.3.2</span>

<!-- div class="toc-container" -->

<!-- div -->

## `platform`
* <a href="#platform">`platform`</a>
* <a href="#platform-description">`platform.description`</a>
* <a href="#platform-layout">`platform.layout`</a>
* <a href="#platform-manufacturer">`platform.manufacturer`</a>
* <a href="#platform-name">`platform.name`</a>
* <a href="#platform-parse">`platform.parse`</a>
* <a href="#platform-prerelease">`platform.prerelease`</a>
* <a href="#platform-product">`platform.product`</a>
* <a href="#platform-toString">`platform.toString`</a>
* <a href="#platform-ua">`platform.ua`</a>
* <a href="#platform-version">`platform.version`</a>

<!-- /div -->

<!-- div -->

## `platform.os`
* <a href="#platform-os">`platform.os`</a>
* <a href="#platform-os-architecture">`platform.os.architecture`</a>
* <a href="#platform-os-family">`platform.os.family`</a>
* <a href="#platform-os-toString">`platform.os.toString`</a>
* <a href="#platform-os-version">`platform.os.version`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `platform`

<!-- div -->

### <a id="platform"></a>`platform`
<a href="#platform">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L997 "View in source") [&#x24C9;][1]

(Object): The platform object.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-description"></a>`platform.description`
<a href="#platform-description">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1005 "View in source") [&#x24C9;][1]

(string, null): The platform description.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-layout"></a>`platform.layout`
<a href="#platform-layout">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1013 "View in source") [&#x24C9;][1]

(string, null): The name of the browser's layout engine.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-manufacturer"></a>`platform.manufacturer`
<a href="#platform-manufacturer">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1021 "View in source") [&#x24C9;][1]

(string, null): The name of the product's manufacturer.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-name"></a>`platform.name`
<a href="#platform-name">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1029 "View in source") [&#x24C9;][1]

(string, null): The name of the browser/environment.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-parse"></a>`platform.parse([ua=navigator.userAgent])`
<a href="#platform-parse">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L253 "View in source") [&#x24C9;][1]

Creates a new platform object.

#### Arguments
1. `[ua=navigator.userAgent]` *(Object|string)*: The user agent string or context object.

#### Returns
*(Object)*:  A platform object.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-prerelease"></a>`platform.prerelease`
<a href="#platform-prerelease">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1037 "View in source") [&#x24C9;][1]

(string, null): The alpha/beta release indicator.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-product"></a>`platform.product`
<a href="#platform-product">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1045 "View in source") [&#x24C9;][1]

(string, null): The name of the product hosting the browser.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-toString"></a>`platform.toString()`
<a href="#platform-toString">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L601 "View in source") [&#x24C9;][1]

Returns `platform.description` when the platform object is coerced to a string.

#### Returns
*(string)*:  Returns `platform.description` if available, else an empty string.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-ua"></a>`platform.ua`
<a href="#platform-ua">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1053 "View in source") [&#x24C9;][1]

(string, null): The browser's user agent string.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-version"></a>`platform.version`
<a href="#platform-version">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1061 "View in source") [&#x24C9;][1]

(string, null): The browser/environment version.

* * *

<!-- /div -->

<!-- /div -->

<!-- div -->

## `platform.os`

<!-- div -->

### <a id="platform-os"></a>`platform.os`
<a href="#platform-os">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1069 "View in source") [&#x24C9;][1]

(Object): The name of the operating system.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-os-architecture"></a>`platform.os.architecture`
<a href="#platform-os-architecture">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1077 "View in source") [&#x24C9;][1]

(number, null): The CPU architecture the OS is built for.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-os-family"></a>`platform.os.family`
<a href="#platform-os-family">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1090 "View in source") [&#x24C9;][1]

(string, null): The family of the OS.<br>
<br>
<br>
<br>
Common values include:<br>
<br>
"Windows", "Windows 7 / Server 2008 R2", "Windows Vista / Server 2008",<br>
<br>
"Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",<br>
<br>
"Android", "iOS" and "Windows Phone"

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-os-toString"></a>`platform.os.toString()`
<a href="#platform-os-toString">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1106 "View in source") [&#x24C9;][1]

Returns the OS string.

#### Returns
*(string)*:  The OS string.

* * *

<!-- /div -->

<!-- div -->

### <a id="platform-os-version"></a>`platform.os.version`
<a href="#platform-os-version">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.2/platform.js#L1098 "View in source") [&#x24C9;][1]

(string, null): The version of the OS.

* * *

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #platform "Jump back to the TOC."
