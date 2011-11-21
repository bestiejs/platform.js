# Platform.js API documentation

<!-- div -->


<!-- div -->

## `platform`
* [`platform`](#platform)
* [`platform.description`](#platform.description)
* [`platform.layout`](#platform.layout)
* [`platform.manufacturer`](#platform.manufacturer)
* [`platform.name`](#platform.name)
* [`platform.os`](#platform.os)
* [`platform.prerelease`](#platform.prerelease)
* [`platform.product`](#platform.product)
* [`platform.ua`](#platform.ua)
* [`platform.version`](#platform.version)
* [`platform.noConflict`](#platform.noConflict)
* [`platform.parse`](#platform.parse)
* [`platform.toString`](#platform.toString)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `platform`

<!-- div -->

### <a id="platform" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L784" title="View in source">`platform`</a>
*(Object)*: The platform object.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.description" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L814" title="View in source">`platform.description`</a>
*(String, Null)*: The platform description.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.layout" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L821" title="View in source">`platform.layout`</a>
*(String, Null)*: The name of the browser layout engine.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.manufacturer" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L828" title="View in source">`platform.manufacturer`</a>
*(String, Null)*: The name of the product's manufacturer.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.name" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L798" title="View in source">`platform.name`</a>
*(String, Null)*: The name of the browser/environment.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.os" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L805" title="View in source">`platform.os`</a>
*(String, Null)*: The name of the operating system.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.prerelease" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L835" title="View in source">`platform.prerelease`</a>
*(String, Null)*: The alpha/beta release indicator.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.product" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L842" title="View in source">`platform.product`</a>
*(String, Null)*: The name of the product hosting the browser.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.ua" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L849" title="View in source">`platform.ua`</a>
*(String, Null)*: The browser's user agent string.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.version" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L791" title="View in source">`platform.version`</a>
*(String, Null)*: The browser/environment version.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="platform.noConflict" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L492" title="View in source">`platform.noConflict()`</a>
Restores a previously overwritten platform object.
[&#9650;][1]

#### Returns
*(Object)*: The current platform object.

<!-- /div -->


<!-- div -->

### <a id="platform.parse" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L219" title="View in source">`platform.parse([ua = navigator.userAgent])`</a>
Creates a new platform object.
[&#9650;][1]

#### Arguments
1. `[ua = navigator.userAgent]` *(String)*: The user agent string.

#### Returns
*(Object)*: A platform object.

<!-- /div -->


<!-- div -->

### <a id="platform.toString" href="https://github.com/bestiejs/platform.js/blob/master/platform.js#L504" title="View in source">`platform.toString()`</a>
Return platform description when the platform object is coerced to a string.
[&#9650;][1]

#### Returns
*(String)*: The platform description.

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #readme "Jump back to the TOC."