<?php

  // cleanup requested filepath
  $file = isset($_GET['f']) ? $_GET['f'] : 'platform';
  $file = preg_replace('#(\.*[\/])+#', '', $file);
  $file .= preg_match('/\.[a-z]+$/', $file) ? '' : '.js';

  // output filename
  $output = isset($_GET['o'])
    ? $_GET['o'] : isset($_SERVER['argv'][1])
    ? $_SERVER['argv'][1] : basename($file);

  /*--------------------------------------------------------------------------*/

  require('../vendor/docdown/docdown.php');

  // generate Markdown
  $markdown = docdown(array(
    'path' => '../' . $file,
    'url'  => 'https://github.com/bestiejs/platform.js/blob/master/platform.js'
  ));

  // save to a .md file
  file_put_contents($output . '.md', $markdown);

  // print
  header('Content-Type: text/plain;charset=utf-8');
  echo $markdown . PHP_EOL;

?>