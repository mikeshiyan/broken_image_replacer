/**
 * @file
 * Replaces broken images with dummy image.
 *
 * @author Mike Shiyan
 */

// ==UserScript==
// @name Broken Image Replacer
// ==/UserScript==

(function () {

  'use strict';

  if (typeof jQuery == 'undefined') {
    // Only sites having jQuery are supported currently.
    return;
  }

  var $ = jQuery;

  $(document).ready(function($) {
    // Change image sources without waiting for images attempting to load.
    if (typeof localStorage != 'undefined') {
      var data = JSON.parse(localStorage.getItem('broken_image_replacer')) || {};

      $.each(data, function (source, dimensions) {
        $('img[src="' + source + '"]').attr('src', 'http://dummyimage.com/' + dimensions[0] + 'x' + dimensions[1] + '/cccccc/ffffff.png');
      });
    }
  });

  var cache = {};

  $('img').on('error', function () {
    var $image = $(this);
    var source = $image.attr('src');

    if (source.indexOf('http://dummyimage.com/') == -1) {
      var w = $image.width();
      var h = $image.height();

      $image.attr('src', 'http://dummyimage.com/' + w + 'x' + h + '/cccccc/ffffff.png');
      cache[source] = [w, h];
    }
  });

  $(window).on('load', function() {
    if (typeof localStorage != 'undefined') {
      var data = JSON.parse(localStorage.getItem('broken_image_replacer')) || {};
      $.extend(data, cache);
      localStorage.setItem('broken_image_replacer', JSON.stringify(data));
    }
  });

})();
