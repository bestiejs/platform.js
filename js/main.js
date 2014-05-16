(function() {
	var platformKeys = ['name', 'version', 'layout', 'prerelease', 'os', 'manufacturer', 'product', 'description', 'ua'];
	var customUA = (/[?&]customUA=([^&]+)(?:&|$)/i.exec(location.href) || 0)[1];

	if (customUA) {
		customUA = decodeURIComponent(customUA).replace(/\+/g, ' ');
		custom.value = customUA;
	}

	var platformObj = customUA ? platform.parse(customUA) : platform;
	platformObj.os = platformObj.os.toString();

	json.innerHTML = JSON.stringify(platformObj, platformKeys, 4);
}.call(this));
