/**
 * @file
 * Stylizes broken images with unobtrusive placeholder.
 *
 * This file can be used as a Tampermonkey userscript or it can be included in
 * the source of any website.
 */

// ==UserScript==
// @name         Broken Image Stylizer
// @version      0.0.4
// @license      MIT
// @description  Stylizes broken images with unobtrusive placeholder.
// @author       Mike Shiyan
// @namespace    Mike Shiyan
// @source       https://github.com/mikeshiyan/broken_image_stylizer
// @supportURL   https://github.com/mikeshiyan/broken_image_stylizer/issues
// ==/UserScript==

(function () {

  'use strict';

  /**
   * Stylizes the image.
   *
   * @param image
   *   Image element.
   */
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

    // Apply styles.
    image.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAE0lEQVR42mNgAIIzZ878hxBAAAA8bwbHJ1VugQAAAABJRU5ErkJggg==")';
    image.style.fontFamily = 'monospace';
    image.style.fontSize = fontSize + 'px';
    image.style.lineHeight = (height - 4) + 'px';
    image.style.textAlign = 'center';

    image.classList.add('broken-image');
  }

  /**
   * Iterates over images in document.
   *
   * @param handler
   *   A callback to run on each image. Accepts 2 arguments: image element and
   *   index number of element in array.
   * @param filter
   *   (optional) A callback to filter images array. Accepts 1 argument: an
   *   image element. Must return TRUE indicating the image should be in
   *   resulting array, or FALSE to skip it.
   */
  function iterateImages (handler, filter) {
    var images = document.getElementsByTagName('img');

    if (typeof filter != 'undefined') {
      images = Array.prototype.filter.call(images, filter);
    }

    Array.prototype.forEach.call(images, handler);
  }

  /**
   * Gets the list of broken images from the storage.
   *
   * @return
   *   Object which keys are image source URLs.
   */
  function storageGet () {
    var data;

    if (typeof localStorage != 'undefined') {
      data = JSON.parse(localStorage.getItem('broken_images'));
    }

    if (!data) {
      data = {};
    }

    return data;
  }

  /**
   * Stores a list of broken images.
   *
   * @param data
   *   Object to store.
   */
  function storageSet (data) {
    if (typeof localStorage != 'undefined') {
      localStorage.setItem('broken_images', JSON.stringify(data));
    }
  }

  var cache = {};

  /**
   * Executes the code after HTML of the page is fully loaded.
   */
  var onDocumentReady = function () {
    // Set onError handler for all images.
    iterateImages(function (image) {
      image.onerror = function () {
        // Check that image is not processed yet.
        if (!this.classList.contains('broken-image')) {
          cache[this.src] = 1;
          stylize(this);
        }

        this.onerror = null;
      };
    });

    // Change image sources without waiting for images attempting to load.
    var data = storageGet();
    iterateImages(stylize, function (image) {
      // Check that image element has the source and that this source is
      // already known as broken. Use getAttribute() method to get initial
      // property value because the direct object property (image.src) always
      // contains string - the full path to source or an empty "".
      return image.getAttribute('src') !== null && !!data[image.src];
    });
  };

  if (document.readyState != 'loading') {
    onDocumentReady();
  }
  else {
    document.addEventListener('DOMContentLoaded', onDocumentReady);
  }

  window.addEventListener('load', function () {
    var data = storageGet();
    Object.assign(data, cache);
    storageSet(data);
  });

  window.addEventListener('resize', function () {
    iterateImages(stylize, function (image) {
      return image.classList.contains('broken-image');
    });
  });

})();
