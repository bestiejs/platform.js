# Platform.js <sup>v1.0.0-pre</sup>

<!-- div -->


<!-- div -->

## `platform`
* [`platform`](#platform)
* [`platform.description`](#platformdescription)
* [`platform.layout`](#platformlayout)
* [`platform.manufacturer`](#platformmanufacturer)
* [`platform.name`](#platformname)
* [`platform.os`](#platformos)
* [`platform.prerelease`](#platformprerelease)
* [`platform.product`](#platformproduct)
* [`platform.ua`](#platformua)
* [`platform.version`](#platformversion)
* [`platform.parse`](#platformparseuanavigatoruseragent)
* [`platform.toString`](#platformtostring)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `platform`

<!-- div -->


<!-- div -->

### `platform`
<a id="platform" href="#platform">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L811 "View in source") [&#x24C9;][1]

*(Object)*: The platform object.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.description`
<a id="platformdescription" href="#platformdescription">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L845 "View in source") [&#x24C9;][1]

*(String, Null)*: The platform description.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.layout`
<a id="platformlayout" href="#platformlayout">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L853 "View in source") [&#x24C9;][1]

*(String, Null)*: The name of the browser layout engine.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.manufacturer`
<a id="platformmanufacturer" href="#platformmanufacturer">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L861 "View in source") [&#x24C9;][1]

*(String, Null)*: The name of the product's manufacturer.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.name`
<a id="platformname" href="#platformname">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L827 "View in source") [&#x24C9;][1]

*(String, Null)*: The name of the browser/environment.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.os`
<a id="platformos" href="#platformos">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L835 "View in source") [&#x24C9;][1]

*(String, Null)*: The name of the operating system.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.prerelease`
<a id="platformprerelease" href="#platformprerelease">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L869 "View in source") [&#x24C9;][1]

*(String, Null)*: The alpha/beta release indicator.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.product`
<a id="platformproduct" href="#platformproduct">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L877 "View in source") [&#x24C9;][1]

*(String, Null)*: The name of the product hosting the browser.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.ua`
<a id="platformua" href="#platformua">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L885 "View in source") [&#x24C9;][1]

*(String, Null)*: The browser's user agent string.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.version`
<a id="platformversion" href="#platformversion">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L819 "View in source") [&#x24C9;][1]

*(String, Null)*: The browser/environment version.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.parse([ua = navigator.userAgent])`
<a id="platformparseuanavigatoruseragent" href="#platformparseuanavigatoruseragent">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L232 "View in source") [&#x24C9;][1]

Creates a new platform object.

#### Arguments
1. `[ua = navigator.userAgent]` *(String)*: The user agent string.

#### Returns
*(Object)*: A platform object.

* * *

<!-- /div -->


<!-- div -->


<!-- div -->

### `platform.toString()`
<a id="platformtostring" href="#platformtostring">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L522 "View in source") [&#x24C9;][1]

Return platform description when the platform object is coerced to a string.

#### Returns
*(String)*: The platform description.

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #readme "Jump back to the TOC."