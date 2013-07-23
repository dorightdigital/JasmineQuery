/*global $, jasmine, spyOn, expect*/
var jasmineQuery = {
  addMatchers: function (matchers) {
    $.each(matchers, function (name, matcher) {
      jasmineQuery.addMatcher(name, matcher);
    });
  },
  addMatcher: function (name, matcher) {
    jasmine.Matchers.prototype[name] = function () {
      if (!this.actual.is || !this.actual.on || !this.actual.click) {
        throw 'non jQuery element provided for matcher [' + name + ']';
      }
      return matcher.apply(this, arguments)
    }
  }
};

(function () {
  var matchers = {
    toHaveClass: function (expected) {
      return this.actual.hasClass(expected);
    },
    toBeVisible: function () {
      return this.actual.is(':visible');
    },
    elementToExist: function () {
      return this.actual.length > 0;
    },
    textToEqual: function (expected) {
      return this.actual.text() === expected;
    },
    toContainText: function (expected) {
      return this.actual.text().indexOf(expected) > -1;
    },
    htmlToEqual: function (expected) {
      return this.actual.html() === expected;
    },
    toContain: function (expected) {
      return this.actual.find(expected).length > 0;
    },
    toBeElement: function (expected) {
      if (this.actual.length === 1) {
        return this.actual[0] === expected[0];
      } else {
        throw 'please provide a single jQuery element for .toBeElement';
      }
    },
    toHaveEventHandlerFor: function (event) {
      return jasmineQuery.hasHandler(event, this.actual);
    }
  };
  jasmineQuery.addMatchers(matchers);
}());

(function () {
  var eventHandlers;
  var keyMap;
  var supportedEvents;
  var mockedFns = {};

  function lookupEventsForElem(elem) {
    var elemKey = keyMap.indexOf(elem);
    if (elemKey === -1) {
      keyMap.push(elem);
      elemKey = keyMap.length - 1;
    }
    if (typeof eventHandlers[elemKey] === 'undefined') {
      eventHandlers[elemKey] = {};
    }
    return eventHandlers[elemKey];
  }

  function addHandler($elem, conf) {
    var i;
    for (i = 0; i < $elem.length; i++) {
      var eventList = lookupEventsForElem($elem.eq(i)[0]);
      if (typeof eventList[conf.eventType] === 'undefined') {
        eventList[conf.eventType] = [];
      }
      eventList[conf.eventType].push(conf);
    }
  }

  function lookupHandlers($elem, eventType) {
    var configs = lookupEventsForElem($elem[0])[eventType] || [];
    var output = [];

    function lookupParentEvents($child) {
      var $parent = $child.parent();
      var parentConfigs = lookupEventsForElem($parent[0])[eventType] || [];

      if ($parent.length === 0) {
        return;
      }
      $.each(parentConfigs, function () {
        if (this.childSelector && $parent.find(this.childSelector).length > 0) {
          output.push(this.handler);
        }
      });
      lookupParentEvents($parent);
    }

    $.each(configs, function () {
      if (!this.childSelector) {
        output.push(this.handler);
      }
    });

    lookupParentEvents($elem);
    return output;
  }

  jasmineQuery.mockEvents = function () {
    $.each(supportedEvents, function () {
      var eventType = '' + this;
      mockedFns[eventType] = $.fn[eventType];
      spyOn($.fn, eventType).andCallFake(function (callback) {
        if (callback) {
          addHandler(this, {eventType: eventType, handler: callback});
        } else {
          if (eventType === 'click' && $(this).is('input[type=checkbox]')) {
            $(this).prop('checked', !$(this).is(':checked'));
          }
          jasmineQuery.callEventHandler(eventType, this, {});
        }
        return this;
      });
    });
    mockedFns.on = $.fn.on;
    spyOn($.fn, 'on').andCallFake(function (a, b, c) {
      var params = {
        eventType: a
      };
      if (typeof b === 'function') {
        params.handler = b;
      } else {
        params.childSelector = b;
        params.handler = c;
      }

      addHandler(this, params);
      return this;
    });
  };
  jasmineQuery.unmockEvents = function () {
    $.each(mockedFns, function (id, val) {
      $.fn[id] = val;
    });
  };
  jasmineQuery.resetMockEvents = function () {
    eventHandlers = [];
    keyMap = [];
    supportedEvents = ['click', 'mouseenter', 'mouseleave', 'submit'];
  };
  jasmineQuery.callEventHandler = function (eventType, $elem, event) {
    var originalArgs = arguments;
    $.each(lookupHandlers($elem, eventType), function () {
      var i, eventToPass = {
        target: $elem[0],
        timeStamp: new Date().getTime(),
        type: eventType,
        preventDefault: function () {
        }
      };
      $.extend(eventToPass, event);
      var argArray = [eventToPass];
      for(i = 3; i < originalArgs.length; i++) {
        argArray.push(originalArgs[i]);
      }
      this.apply($elem, argArray);
    });
  };
  jasmineQuery.hasHandler = function (eventType, $elem) {
    return lookupHandlers($elem, eventType).length > 0;
  };
  jasmineQuery.resetMockEvents();
  jasmineQuery.addMatchers({
    toPreventDefaultEventHandlerFor: function (event) {
      var defaultPrevented = false;
      jasmineQuery.callEventHandler(event, this.actual, {
        preventDefault: function () {
          defaultPrevented = true;
        }
      });
      return defaultPrevented;
    }
  });
}());
