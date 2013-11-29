/*global $, jasmine, spyOn, expect*/
var jasmineQuery = {};
(function () {
  var installedMatchers = {};
  jasmineQuery = {
    addMatchers: function (matchers) {
      $.each(matchers, function (name, matcher) {
        jasmineQuery.addMatcher(name, matcher);
      });
    },
    addMatcher: function (name, matcher) {
      installedMatchers[name] = matcher;
      jasmine.Matchers.prototype[name] = function () {
        if (!this.actual.is || !this.actual.on || !this.actual.click) {
          throw 'non jQuery element provided for matcher [' + name + ']';
        }
        return matcher.apply(this, arguments)
      }
    },
    refreshMatchers: function (test) {
      test.addMatchers(installedMatchers);
    }
  };
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
  jasmineQuery.createSandboxedElementStorage = function () {
    var keys = [];
    var values = [];

    function lookupKey($elemList) {
      var key = keys.indexOf($elemList);
      if (key === -1) {
        keys.push($elemList);
        key = keys.length - 1;
      }
      return key;
    }

    function lookupKeyOrDefaultToArray(parent, key) {
      return parent[key] = parent[key] || []
    }

    function lookupContainer($elemList, container) {
      var containers = lookupKeyOrDefaultToArray(values, lookupKey($elemList[0]));
      return lookupKeyOrDefaultToArray(containers, container);
    }

    function lookup($elemList, container) {
      if ($elemList.length > 1) {
        throw 'can\'t get on multiple elements, [' + $elemList.length + '] provided.';
      }
      return lookupContainer($elemList, container);
    }

    function set($elemList, container, value) {
      $elemList.each(function () {
        lookupContainer($(this), container).push(value);
      });
    }

    function reset($elemList) {
      $elemList.each(function () {
        values[lookupKey($(this)[0])] = [];
      });
    }

    return {
      addForElems: set,
      getForElem: lookup,
      resetForElem: reset
    };
  }
}());

(function () {
  var eventHandlerStore;
  var supportedEvents;
  var mockedFns = {};

  function mockFn(name, fake) {
    mockedFns[name] = $.fn[name];
    spyOn($.fn, name).andCallFake(fake);
  }

  function addHandler($elem, conf) {
    eventHandlerStore.addForElems($elem, conf.eventType, conf);
  }

  function lookupHandlers($elem, eventType) {
    var configs = eventHandlerStore.getForElem($elem, eventType);
    var output = [];

    function reverseOrderOfArray(array) {
      var finalOut = [];
      $.each(array, function (key, val) {
        finalOut[array.length - 1 - key] = val;
      });
      return finalOut;
    }

    function lookupParentEvents($child) {
      var $parent = $child.parent();
      var parentConfigs = eventHandlerStore.getForElem($parent, eventType);

      if ($parent.length === 0) {
        return;
      }
      $.each(parentConfigs, function () {
        if (!this.childSelector || $parent.find(this.childSelector).length > 0) {
          output.push(this);
        }
      });
      lookupParentEvents($parent);
    }

    lookupParentEvents($elem);

    $.each(configs, function () {
      if (!this.childSelector) {
        output.push(this);
      }
    });

    return reverseOrderOfArray(output);
  }

  jasmineQuery.mockEvents = function () {
    $.each(supportedEvents, function () {
      var eventType = '' + this;
      mockFn(eventType, function (callback) {
        if (callback) {
          addHandler(this, {eventType: eventType, handler: callback});
        } else {
          if (eventType === 'click') {
            if ($(this).is('input[type=checkbox]') || $(this).is('input[type=radio]')) {
              $(this).prop('checked', !$(this).is(':checked'));
            }
          }
          jasmineQuery.callEventHandler(eventType, this, {});
        }
        return this;
      });
    });

    function interceptJQuery(name, fn) {
      var tmp = $.fn[name];
      mockedFns[name] = fn;
      spyOn($.fn, name).andCallFake(function () {
        fn.apply(this, arguments);
        return tmp.apply(this, arguments);
      });
    }

    function mockAllEvents(self, eventMap) {
      $.each(eventMap, function (eventType, fn) {
        addHandler(self, {eventType: eventType, handler: fn});
      });
    }

    function mockEventSetup(mockName, paramSorter) {
      mockFn(mockName, function (a, b, c, d) {
        var self = this;
        if (typeof a === 'object') {
          mockAllEvents(self, a);
        } else {
          $.each(a.split(' '), function (key, eventType) {
            var endOfEventType = eventType.indexOf('.');
            if (endOfEventType > -1) {
              eventType = eventType.substr(0, endOfEventType);
            }

            var params = {
              eventType: eventType
            };

            paramSorter(params, a, b, c, d);

            addHandler(self, params);
          });
        }
        return this;
      });
    }

    mockEventSetup('on', function (params, a, b, c, d) {
      if (typeof b === 'function' || b === false) {
        params.handler = b || function () {
          return false;
        };
      } else {
        if (typeof c === 'function' || c === false) {
          params.handler = c || function () {
            return false;
          };
          if (typeof b === 'object') {
            params.data = b;
          } else {
            params.childSelector = b;
          }
        } else {
          params.childSelector = b;
          params.data = c;
          params.handler = d;
        }
      }
    });
    mockEventSetup('bind', function (params, a, b, c) {
      if (typeof b === 'function') {
        params.handler = b;
        params.data = null;
      } else {
        params.data = b;
        params.handler = c;
      }
    });
    mockFn('trigger', function (eventType, data) {
      if (data) {
        jasmineQuery.callEventHandler(eventType, this, {}, data);
      } else {
        jasmineQuery.callEventHandler(eventType, this, {});
      }
    });
    interceptJQuery('remove', function () {
      eventHandlerStore.resetForElem($(this));
    });
  };
  jasmineQuery.unmockEvents = function () {
    $.each(mockedFns, function (id, val) {
      $.fn[id] = val;
    });
  };
  jasmineQuery.resetMockEvents = function () {
    eventHandlerStore = jasmineQuery.createSandboxedElementStorage();
    supportedEvents = ['click', 'mouseenter', 'mouseleave', 'submit'];
  };
  jasmineQuery.callEventHandler = function (eventType, $elem, event) {
    var originalArgs = arguments, hasReturnedFalse = false;
    $.each(lookupHandlers($elem, eventType), function () {
      if (hasReturnedFalse) {
        return;
      }
      var i, eventToPass = {
        target: $elem[0],
        timeStamp: new Date().getTime(),
        type: eventType,
        preventDefault: function () {
        },
        data: this.data
      };
      $.extend(eventToPass, event);
      var argArray = [eventToPass];
      for (i = 3; i < originalArgs.length; i++) {
        argArray.push(originalArgs[i]);
      }
      var output = this.handler.apply($elem, argArray);
      if (output === false) {
        hasReturnedFalse = true;
      }
    });
  };
  jasmineQuery.hasHandler = function (eventType, $elem) {
    return lookupHandlers($elem, eventType).length > 0;
  };
  jasmineQuery.resetMockEvents();
  jasmineQuery.addMatchers({
    toPreventDefaultFor: function (event) {
      var defaultPrevented = false;
      jasmineQuery.callEventHandler(event, this.actual, {
        preventDefault: function () {
          defaultPrevented = true;
        }
      });
      return defaultPrevented;
    }
  });

  (function () {
    var store = jasmineQuery.createSandboxedElementStorage();
    jasmineQuery.spyOnWidget = function (widgetName) {
      spyOn($.fn, widgetName).andCallFake(function () {
        store.addForElems($(this), widgetName, Array.prototype.slice.call(arguments));
      });
    };
    function argsMatchOneCall(allCalls, requiredArgs) {
      var oneHasMatched = false;
      $.each(allCalls, function () {
        if (oneHasMatched) {
          return;
        }
        var currentCall = this;
        if (currentCall.length === requiredArgs.length) {
          oneHasMatched = true;
        }
      });
      return oneHasMatched;
    }

    jasmineQuery.addMatcher('toHaveUsedWidget', function (widgetName, args) {
      var callsMade = store.getForElem(this.actual, widgetName);
      if (typeof args === 'undefined') {
        return callsMade.length > 0;
      } else {
        return argsMatchOneCall(callsMade, args);
      }
    });
  }());


}());
