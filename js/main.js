(function() {
  var ua = /[?&]ua=([^&]+)(?:&|$)/.exec(location.search);

  if (ua) {
    ua = decodeURIComponent(ua[1]).replace(/\+/g, ' ');
    document.getElementById('custom').value = ua;
  }

  platform = ua ? platform.parse(ua) : platform;
  platform.os = String(platform.os);

  document.getElementById('json').innerHTML = JSON.stringify(
    platform,
    ['name', 'version', 'layout', 'prerelease', 'os', 'manufacturer', 'product', 'description', 'ua'],
    4
  );
}());
