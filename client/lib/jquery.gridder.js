/*
 *  Gridder - v1.4.2
 *  A jQuery plugin that displays a thumbnail grid expanding preview similar to the effect seen on Google Images.
 *  http://www.oriongunning.com/
 *
 *  Made by Orion Gunning
 *  Under MIT License
 */
;(function($) {

  let settings;
  //Ensures there will be no 'console is undefined' errors in IE
  window.console = window.console || (function() {
    var c = {};
    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
    return c;
  })();

  /* Custom Easing */
  $.fn.extend($.easing, {
    def: "easeInOutExpo", easeInOutExpo: function(e, f, a, h, g) {
      if(f === 0) {
        return a;
      }
      if(f === g) {
        return a + h;
      }
      if((f /= g / 2) < 1) {
        return h / 2 * Math.pow(2, 10 * (f - 1)) + a;
      }
      return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a;
    }
  });

  /* KEYPRESS LEFT & RIGHT ARROW */
  /* This will work only if a current gridder is opened. */
  $(document).keydown(function(e) {
    const keyCode = e.keyCode;
    const $current_gridder = $(".currentGridder");
    if($current_gridder.length) {
      if(keyCode === 37) {
        e.preventDefault();
        //console.log("Pressed Left Arrow");
        const $next = $current_gridder.prev();
        let nextId = $next.data('griddercontent');
        if(nextId) {
          nextId = nextId.replace("#gridder_", "");
          const cr = Router.current();
          cr.params.query.imgId = nextId;
          Router.go('daydGalleryUser', cr.params, {query: "imgId=" + nextId});
        }
      }
      if(keyCode === 39) {
        e.preventDefault();
        //console.log("Pressed Right Arrow");
        const $next = $current_gridder.next().next();
        let nextId = $next.data('griddercontent');
        if(nextId) {
          nextId = nextId.replace("#gridder_", "");
          const cr = Router.current();
          cr.params.query.imgId = nextId;
          Router.go('daydGalleryUser', cr.params, {query: "imgId=" + nextId});
        }
      }
    } else {
      //console.log("No active gridder.");
    }
  });

  $.fn.gridderExpander = function(options) {

    /* GET DEFAULT OPTIONS OR USE THE ONE PASSED IN THE FUNCTION  */
    settings = $.extend({}, $.fn.gridderExpander.defaults, options);

    // START CALLBACK
    settings.onStart($(this));
    /* CLICK EVENT */

    const $body = $('body');
    $body.off("click", ".gridder-list", click_open);
    $body.on("click", ".gridder-list", click_open);

  };

// Default Options
  $.fn.gridderExpander.defaults = {
    scroll: true,
    scrollOffset: 30,
    scrollTo: "panel", // panel or listitem
    animationSpeed: 400,
    animationEasing: "easeInOutExpo",
    showNav: true,
    nextText: "Next",
    prevText: "Previous",
    closeText: "Close",
    onStart: function() {},
    onContent: function() {},
    onClosed: function() {}
  };


  function click_open(e) {
    e.preventDefault();

    openExpander($(this));
  }

// OPEN EXPANDER
  function openExpander($newSelf) {
    // THE SAME IS ALREADY OPEN, LET"S CLOSE IT
    if($newSelf.hasClass("currentGridder"))
      return closeExpander($newSelf);

    let newImgId = $newSelf.data('griddercontent').replace("#gridder_", "");
    const cr = Router.current();
    if(cr.params.query.imgId !== newImgId) {
      cr.params.query.imgId = newImgId;
      return Router.go('daydGalleryUser', cr.params, {query: "imgId=" + newImgId});
    }

    $('.gridder').addClass('gridder-open');

    /* CURRENT ACTIVE GRIDDER */
    const $currentSelf = $(".currentGridder");

    $currentSelf.removeClass("currentGridder");
    $currentSelf.removeClass("expandedGridder");
    $newSelf.addClass("currentGridder");

    /* REMOVES PREVIOUS BLOC */
    $currentSelf.parent().find(".gridder-show").remove();

    /* GET CONTENT VIA AJAX OR #ID*/
    var theContent = "";

    if($newSelf.data("griddercontent").indexOf("#") === 0) {

      // Load #ID Content
      theContent = $($newSelf.data("griddercontent")).html();
      processContent($newSelf, theContent);
    } else {

      // Load AJAX Content
      $.ajax({
        type: "GET",
        url: $currentSelf.data("griddercontent"),
        success: function(data) {
          theContent = data;
          processContent($currentSelf, theContent);
        },
        error: function(request) {
          theContent = request.responseText;
          processContent($currentSelf, theContent);
        }
      });
    }
  }

// PROCESS CONTENT
  function processContent(myself, theContent) {

    /* FORMAT OUTPUT */
    let htmlContent = "<div class=\"gridder-padding\">";

    if(settings.showNav) {
      /* CHECK IF PREV AND NEXT BUTTON HAVE ITEMS */
      const prevItem = $(".selectedItem").prev();
      const nextItem = $(".selectedItem").next().next();

      htmlContent += "<div class=\"gridder-navigation\">";
      htmlContent += "<a href=\"#\" class=\"gridder-close\">" + settings.closeText + "</a>";
      htmlContent += "<a href=\"#\" class=\"gridder-nav prev " + (!prevItem.length ? "disabled" : "") + "\">" + settings.prevText + "</a>";
      htmlContent += "<a href=\"#\" class=\"gridder-nav next " + (!nextItem.length ? "disabled" : "") + "\">" + settings.nextText + "</a>";
      htmlContent += "</div>";
    }

    htmlContent += "<div class=\"gridder-expanded-content\">";
    htmlContent += theContent;
    htmlContent += "</div>";
    htmlContent += "</div>";

    // IF EXPANDER IS ALREADY EXPANDED
    const expanded = $(myself).hasClass('expandedGridder');

    if(expanded) {
      console.log('hide');
      $(myself).removeClass('expandedGridder');
      $(myself).parent().find('.gridder-show').hide().slideDown(settings.animationSpeed, settings.animationEasing, function() {
        /* AFTER EXPAND CALLBACK */
        if($.isFunction(settings.onContent)) {
          settings.onContent($(myself));
        }
      });
    } else {
      /* ADD LOADING BLOC */
      const $htmlContent = $("<div class=\"gridder-show loading\"></div>");
      const myBloc = $htmlContent.insertAfter(myself);

      $(myself).addClass('expandedGridder');
      myBloc.html(htmlContent);
      myBloc.find(".gridder-padding").fadeIn(settings.animationSpeed, settings.animationEasing, function() {
        /* CHANGED CALLBACK */
        if($.isFunction(settings.onContent)) {
          settings.onContent(myBloc);
        }
      });


      /* SCROLL TO CORRECT POSITION AFTER */
      if(settings.scroll) {
        const offset = (settings.scrollTo === "panel" ? myself.offset().top + myself.height() - settings.scrollOffset : myself.offset().top - settings.scrollOffset);
        $("html, body").animate({
          scrollTop: offset
        }, {
          duration: settings.animationSpeed,
          easing: settings.animationEasing
        });
      }

      /* REMOVE LOADING CLASS */
      myBloc.removeClass("loading");
    }
  }


// CLOSE FUNCTION
  function closeExpander($currentSelf) {

    $('.gridder').removeClass('gridder-open');
    // SCROLL TO CORRECT POSITION FIRST
    if(settings.scroll) {
      $("html, body").animate({
        scrollTop: $currentSelf.offset().top - settings.scrollOffset
      }, {
        duration: 200,
        easing: settings.animationEasing
      });
    }

    $currentSelf.removeClass("expandedGridder");

    // REMOVES GRIDDER EXPAND AREA
    $currentSelf.removeClass("selectedItem");

    $currentSelf.parent().find(".gridder-show").slideUp(settings.animationSpeed, settings.animationEasing, function() {
      $currentSelf.parent().find(".gridder-show").remove();
      settings.onClosed($currentSelf);
    });

    /* REMOVE CURRENT ACTIVE GRIDDER */
    $(".currentGridder").removeClass("currentGridder");
  }

})
(jQuery);
