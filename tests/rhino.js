(function(global, path) {

  path || (path = '../platform.js');
  load(path + '/platform.js');
  print('platform: expected at least "Rhino"; got "' + platform + '";');

}(this, arguments[0]));