# Platform.js <sup>v1.3.3</sup>

<!-- div class="toc-container" -->

<!-- div -->

## `platform`
* <a href="#platform">`platform`</a>
* <a href="#platformdescription">`platform.description`</a>
* <a href="#platformlayout">`platform.layout`</a>
* <a href="#platformmanufacturer">`platform.manufacturer`</a>
* <a href="#platformname">`platform.name`</a>
* <a href="#platformos">`platform.os`</a>
* <a href="#platformparseuanavigatoruseragent">`platform.parse`</a>
* <a href="#platformprerelease">`platform.prerelease`</a>
* <a href="#platformproduct">`platform.product`</a>
* <a href="#platformtostring">`platform.toString`</a>
* <a href="#platformua">`platform.ua`</a>
* <a href="#platformversion">`platform.version`</a>

<!-- /div -->

<!-- div -->

## `platform.os`
* <a href="#platformosarchitecture">`platform.os.architecture`</a>
* <a href="#platformosfamily">`platform.os.family`</a>
* <a href="#platformostostring">`platform.os.toString`</a>
* <a href="#platformosversion">`platform.os.version`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `platform`

<!-- div -->

<h3 id="platform"><code>platform</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L996 "View in source") [&#x24C9;][1]

The platform object.

---

<!-- /div -->

<!-- div -->

<h3 id="platformdescription"><code>platform.description</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1004 "View in source") [&#x24C9;][1]

The platform description.

---

<!-- /div -->

<!-- div -->

<h3 id="platformlayout"><code>platform.layout</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1012 "View in source") [&#x24C9;][1]

The name of the browser's layout engine.

---

<!-- /div -->

<!-- div -->

<h3 id="platformmanufacturer"><code>platform.manufacturer</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1020 "View in source") [&#x24C9;][1]

The name of the product's manufacturer.

---

<!-- /div -->

<!-- div -->

<h3 id="platformname"><code>platform.name</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1028 "View in source") [&#x24C9;][1]

The name of the browser/environment.

---

<!-- /div -->

<!-- div -->

<h3 id="platformos"><code>platform.os</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1068 "View in source") [&#x24C9;][1]

The name of the operating system.

---

<!-- /div -->

<!-- div -->

<h3 id="platformparseuanavigatoruseragent"><code>platform.parse([ua=navigator.userAgent])</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L253 "View in source") [&#x24C9;][1]

Creates a new platform object.

#### Arguments
1. `[ua=navigator.userAgent]` *(Object|string)*: The user agent string or<br>
<br> context object.

#### Returns
*(Object)*: A platform object.

---

<!-- /div -->

<!-- div -->

<h3 id="platformprerelease"><code>platform.prerelease</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1036 "View in source") [&#x24C9;][1]

The alpha/beta release indicator.

---

<!-- /div -->

<!-- div -->

<h3 id="platformproduct"><code>platform.product</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1044 "View in source") [&#x24C9;][1]

The name of the product hosting the browser.

---

<!-- /div -->

<!-- div -->

<h3 id="platformtostring"><code>platform.toString()</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L601 "View in source") [&#x24C9;][1]

Returns `platform.description` when the platform object is coerced to a string.

#### Returns
*(string)*: Returns `platform.description` if available, else an empty string.

---

<!-- /div -->

<!-- div -->

<h3 id="platformua"><code>platform.ua</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1052 "View in source") [&#x24C9;][1]

The browser's user agent string.

---

<!-- /div -->

<!-- div -->

<h3 id="platformversion"><code>platform.version</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1060 "View in source") [&#x24C9;][1]

The browser/environment version.

---

<!-- /div -->

<!-- /div -->

<!-- div -->

## `platform.os`

<!-- div -->

<h3 id="platformosarchitecture"><code>platform.os.architecture</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1076 "View in source") [&#x24C9;][1]

The CPU architecture the OS is built for.

---

<!-- /div -->

<!-- div -->

<h3 id="platformosfamily"><code>platform.os.family</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1089 "View in source") [&#x24C9;][1]

The family of the OS.<br>
<br>
<br>
<br>
Common values include:<br>
<br>
"Windows", "Windows Server `2008` R2 / `7`", "Windows Server `2008` / Vista",<br>
<br>
"Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",<br>
<br>
"Android", "iOS" and "Windows Phone"

---

<!-- /div -->

<!-- div -->

<h3 id="platformostostring"><code>platform.os.toString()</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1105 "View in source") [&#x24C9;][1]

Returns the OS string.

#### Returns
*(string)*: The OS string.

---

<!-- /div -->

<!-- div -->

<h3 id="platformosversion"><code>platform.os.version</code></h3>
[&#x24C8;](https://github.com/bestiejs/platform.js/blob/1.3.3/platform.js#L1097 "View in source") [&#x24C9;][1]

The version of the OS.

---

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #platform "Jump back to the TOC."
