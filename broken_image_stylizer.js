/**
 * @file
 * Stylizes broken images with unobtrusive placeholder.
 *
 * @author Mike Shiyan
 */

// ==UserScript==
// @name Broken Image Stylizer
// ==/UserScript==

(function () {

  'use strict';

  function stylize (image) {
    var width  = image.width;
    var height = image.height;
    var text   = width + ' × ' + height;

    // Calculate the font size. The final value cannot be less than 5px or more
    // than a 3-quarters of image height.
    var fontSize = Math.max(Math.min(width / text.length * 1.5, height * 0.75), 5);

    image.alt = text;
    // Trick the browser to show the just added 'alt' attribute.
    image.src = null;
    image.removeAttribute('src');

    // Apply CSS.
    image.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAE0lEQVR42mNgAIIzZ878hxBAAAA8bwbHJ1VugQAAAABJRU5ErkJggg==")';
    image.style.fontFamily = 'monospace';
    image.style.fontSize = fontSize + 'px';
    image.style.lineHeight = (height - 4) + 'px';
    image.style.textAlign = 'center';

    image.classList.add('broken-image');
  }

  var cache = {};

  var images = document.getElementsByTagName('img');
  for (var i = 0, total = images.length; i < total; i++) {
    images[i].onerror = function () {
      // Check that image is not processed yet.
      if (!this.classList.contains('broken-image')) {
        cache[this.src] = 1;
        stylize(this);
      }

      this.onerror = null;
    };
  }

  if (typeof jQuery != 'undefined') {
    // Currently only sites having jQuery are supported for certain operations.
    var $ = jQuery;

    if (typeof localStorage != 'undefined') {
      $(document).ready(function ($) {
        // Change image sources without waiting for images attempting to load.
        var data = JSON.parse(localStorage.getItem('broken_images')) || {};

        $('img[src]').each(function () {
          if (data[$(this).attr('src')]) {
            stylize(this);
          }
        });
      });

      var updateStorage = function () {
        var data = JSON.parse(localStorage.getItem('broken_images')) || {};
        $.extend(data, cache);
        localStorage.setItem('broken_images', JSON.stringify(data));
      };

      if (typeof $(window).on == 'function') {
        $(window).on('load', updateStorage);
      }
      else {
        $(window).load(updateStorage);
      }
    }

    $(window).resize(function () {
      $('img.broken-image').each(function () {
        stylize(this);
      });
    });
  }

})();
