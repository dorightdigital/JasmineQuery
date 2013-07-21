/*global jasmine*/
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
    toExist: function () {
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

  function addHandler(elem, eventType, fn) {
    var i;
    for (i = 0; i < elem.length; i++) {
      var eventList = lookupEventsForElem(elem.eq(i)[0]);
      if (typeof eventList[eventType] === 'undefined') {
        eventList[eventType] = [];
      }
      eventList[eventType].push(fn);
    }
  }

  function lookupHandlers(elem, eventType) {
    return lookupEventsForElem(elem[0])[eventType] || [];
  }

  jasmineQuery.mockEvents = function () {
    $.each(supportedEvents, function () {
      var eventType = '' + this;
      spyOn($.fn, eventType).andCallFake(function (callback) {
        if (callback) {
          addHandler(this, eventType, callback);
        } else {
          jasmineQuery.callEventHandler(eventType, this, {});
        }
        return this;
      });
    });
    spyOn($.fn, 'on').andCallFake(function (a, b, c) {
      var $elem, fn, eventType = a;
      if (typeof b === 'function') {
        $elem = this;
        fn = b;
      } else {
        $elem = this.find(b)
        fn = c
      }

      if (supportedEvents.indexOf(eventType) > -1) {
        addHandler($elem, eventType, fn);
      }
      return this;
    });
  };
  jasmineQuery.resetMockEvents = function () {
    eventHandlers = [];
    keyMap = [];
    supportedEvents = ['click', 'mouseenter', 'mouseleave', 'submit'];
  }
  jasmineQuery.callEventHandler = function (eventType, $elem, event) {
    $.each(lookupHandlers($elem, eventType), function () {
      $.extend(event, {
        target: $elem[0],
        timeStamp: new Date().getTime(),
        type: eventType
      });
      this.call($elem, event);
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
