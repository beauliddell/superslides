
/*
  Superslides 0.3.0
  Fullscreen slideshow plugin for jQuery
  by Nic Aitch @nicinabox
  http://nicinabox.github.com/superslides/
*/

(function() {
  var $;

  $ = jQuery;

  $.fn.superslides = function(options) {
    var $children, $container, $control, $nav, $this, adjust_image_position, adjust_slides_size, animate, animating, current, first_load, height, is_mobile, load_image, next, play, play_interval, prev, size, start, stop, width;
    options = $.extend({
      delay: 5000,
      play: false,
      slide_speed: 'normal',
      slide_easing: 'linear',
      nav_class: 'slides-navigation',
      container_class: 'slides-container'
    }, options);
    $("." + options.container_class, this).wrap('<div class="slides-control" />');
    $this = this;
    $control = $('.slides-control', $this);
    $container = $("." + options.container_class);
    $children = $container.children();
    $nav = $("." + options.nav_class);
    size = $children.length;
    width = window.innerWidth || document.documentElement.clientWidth;
    height = window.innerHeight || document.documentElement.clientHeight;
    current = 0;
    prev = 0;
    next = 0;
    first_load = true;
    play_interval = 0;
    animating = false;
    is_mobile = navigator.userAgent.match(/ipad|iphone/i);
    start = function() {
      animate((first_load ? 0 : "next"));
      return play();
    };
    stop = function() {
      return clearInterval(play_interval);
    };
    play = function() {
      if (options.play) {
        if (play_interval) stop();
        return play_interval = setInterval(function() {
          return animate((first_load ? 0 : "next"));
        }, options.delay);
      }
    };
    load_image = function($img, callback) {
      var image;
      image = new Image();
      return $img.load(function() {
        if (typeof callback === 'function') callback(this);
        return this;
      });
    };
    adjust_image_position = function($img) {
      if (!($img.data('original-height') && $img.data('original-width'))) {
        load_image($img, function(image) {
          $img.data('original-height', image.height).removeAttr('height');
          $img.data('original-width', image.width).removeAttr('width');
          return adjust_image_position($img);
        });
      }
      if (height < $img.data('original-height')) {
        $img.css({
          top: -($img.data('original-height') - height) / 2
        });
      }
      if (width < $img.data('original-width')) {
        $img.css({
          left: -($img.data('original-width') - width) / 2
        });
      } else {
        $img.css({
          left: 0
        });
      }
      if ($img.data('original-height') && $img.data('original-width')) {
        return $this.trigger('slides.image_adjusted');
      }
    };
    adjust_slides_size = function($el) {
      $el.each(function(i) {
        $(this).width(width).height(height).css({
          left: width
        });
        return adjust_image_position($('img', this));
      });
      return $this.trigger('slides.sized');
    };
    animate = function(direction) {
      var position;
      if (!animating) {
        prev = current;
        animating = true;
        switch (direction) {
          case 'next':
            position = width * 2;
            direction = -position;
            next = current + 1;
            if (size === next) next = 0;
            break;
          case 'prev':
            position = 0;
            direction = 0;
            next = current - 1;
            if (next === -1) next = size - 1;
            break;
          default:
            prev = -1;
            next = direction;
        }
        current = next;
        $children.removeClass('current');
        $children.eq(current).css({
          left: position,
          display: 'block'
        });
        return $control.animate({
          useTranslate3d: (is_mobile ? true : false),
          left: direction
        }, options.slide_speed, options.slide_easing, function() {
          $control.css({
            left: -width
          });
          $children.eq(next).css({
            left: width,
            zIndex: 2
          });
          $children.eq(prev).css({
            left: width,
            display: 'none',
            zIndex: 0
          });
          $children.eq(current).addClass('current');
          if (first_load) {
            $container.fadeIn('fast');
            $this.trigger('slides.initialized');
            first_load = false;
          }
          animating = false;
          return $this.trigger('slides.animated');
        });
      }
    };
    return this.each(function() {
      $control.css({
        position: 'relative',
        width: width * 3,
        height: height,
        left: -width
      });
      $container.hide();
      $children.css({
        display: 'none',
        position: 'absolute',
        overflow: 'hidden',
        top: 0,
        left: width,
        zIndex: 0
      });
      adjust_slides_size($children);
      $(window).resize(function(e) {
        width = window.innerWidth || document.documentElement.clientWidth;
        height = window.innerHeight || document.documentElement.clientHeight;
        adjust_slides_size($children);
        return $control.width(width * 3).css({
          left: -width,
          height: height
        });
      });
      $('a', $nav).click(function(e) {
        e.preventDefault();
        stop();
        if ($(this).hasClass('next')) {
          return animate('next');
        } else {
          return animate('prev');
        }
      });
      $this.on('slides.start', function(e) {
        return start();
      });
      $this.on('slides.stop', function(e) {
        return stop();
      });
      $this.on('slides.play', function(e) {
        return play();
      });
      $this.on('slides.next', function(e) {
        stop();
        return animate('next');
      });
      $this.on('slides.prev', function(e) {
        stop();
        return animate('prev');
      });
      return $this.trigger('slides.start');
    });
  };

}).call(this);