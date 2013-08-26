# Platform.js <sup>v1.0.0</sup>

<!-- div -->


<!-- div -->

## <a id="platform"></a>`platform`
* [`platform`](#platform)
* [`platform.description`](#platformdescription)
* [`platform.layout`](#platformlayout)
* [`platform.manufacturer`](#platformmanufacturer)
* [`platform.name`](#platformname)
* [`platform.prerelease`](#platformprerelease)
* [`platform.product`](#platformproduct)
* [`platform.ua`](#platformua)
* [`platform.version`](#platformversion)
* [`platform.parse`](#platformparseuanavigatoruseragent)
* [`platform.toString`](#platformtostring)

<!-- /div -->


<!-- div -->

## `platform.os`
* [`platform.os`](#platformos)
* [`platform.os.architecture`](#platformosarchitecture)
* [`platform.os.family`](#platformosfamily)
* [`platform.os.version`](#platformosversion)
* [`platform.os.toString`](#platformostostring)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `platform`

<!-- div -->

### <a id="platform"></a>`platform`
<a href="#platform">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L867 "View in source") [&#x24C9;][1]

*(Object)*: The platform object.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformdescription"></a>`platform.description`
<a href="#platformdescription">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L936 "View in source") [&#x24C9;][1]

*(string, null)*: The platform description.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformlayout"></a>`platform.layout`
<a href="#platformlayout">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L944 "View in source") [&#x24C9;][1]

*(string, null)*: The name of the browser layout engine.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformmanufacturer"></a>`platform.manufacturer`
<a href="#platformmanufacturer">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L952 "View in source") [&#x24C9;][1]

*(string, null)*: The name of the product's manufacturer.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformname"></a>`platform.name`
<a href="#platformname">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L883 "View in source") [&#x24C9;][1]

*(string, null)*: The name of the browser/environment.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformprerelease"></a>`platform.prerelease`
<a href="#platformprerelease">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L960 "View in source") [&#x24C9;][1]

*(string, null)*: The alpha/beta release indicator.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformproduct"></a>`platform.product`
<a href="#platformproduct">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L968 "View in source") [&#x24C9;][1]

*(string, null)*: The name of the product hosting the browser.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformua"></a>`platform.ua`
<a href="#platformua">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L976 "View in source") [&#x24C9;][1]

*(string, null)*: The browser's user agent string.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformversion"></a>`platform.version`
<a href="#platformversion">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L875 "View in source") [&#x24C9;][1]

*(string, null)*: The browser/environment version.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformparseuanavigatoruseragent"></a>`platform.parse([ua = navigator.userAgent])`
<a href="#platformparseuanavigatoruseragent">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L235 "View in source") [&#x24C9;][1]

Creates a new platform object.

#### Arguments
1. `[ua = navigator.userAgent]` *(string)*: The user agent string.

#### Returns
*(Object)*: A platform object.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformtostring"></a>`platform.toString()`
<a href="#platformtostring">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L526 "View in source") [&#x24C9;][1]

Returns `platform.description` when the platform object is coerced to a string.

#### Returns
*(string)*: Returns `platform.description` if available, else an empty string.

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `platform.os`

<!-- div -->

### <a id="platformos"></a>`platform.os`
<a href="#platformos">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L891 "View in source") [&#x24C9;][1]

*(Object)*: The name of the operating system.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformosarchitecture"></a>`platform.os.architecture`
<a href="#platformosarchitecture">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L903 "View in source") [&#x24C9;][1]

*(number, null)*: The CPU architecture the OS is built for.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformosfamily"></a>`platform.os.family`
<a href="#platformosfamily">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L911 "View in source") [&#x24C9;][1]

*(string, null)*: The family of the OS.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformosversion"></a>`platform.os.version`
<a href="#platformosversion">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L919 "View in source") [&#x24C9;][1]

*(string, null)*: The version of the OS.

* * *

<!-- /div -->


<!-- div -->

### <a id="platformostostring"></a>`platform.os.toString()`
<a href="#platformostostring">#</a> [&#x24C8;](https://github.com/bestiejs/platform.js/blob/master/platform.js#L927 "View in source") [&#x24C9;][1]

Returns the OS string.

#### Returns
*(string)*: The OS string.

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #platform "Jump back to the TOC."