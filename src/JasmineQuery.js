/*global $, jasmine, spyOn, expect*/
var jasmineQuery = {};
(function () {
  var installedMatchers = {};

  function getTestScope() {
    return jasmine.currentEnv_ && jasmine.currentEnv_.currentSpec
  }

  jasmineQuery = {
    addMatchers: function (matchers) {
      $.each(matchers, function (name, matcher) {
        jasmineQuery.addMatcher(name, matcher);
      });
    },
    addMatcher: function (name, matcher) {
      var testScope = getTestScope();
      var preparedMatcher = function () {
        if (!this.actual.is || !this.actual.on || !this.actual.click) {
          throw 'non jQuery element provided for matcher [' + name + ']';
        }
        var val = matcher.apply(this, arguments);
        return val;
      };
      if (testScope) {
        var list = {};
        list[name] = preparedMatcher
        testScope.addMatchers(list);
      } else {
        installedMatchers[name] = matcher;
        jasmine.Matchers.prototype[name] = preparedMatcher
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
      return parent[key] = parent[key] || [];
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

    function resetSingleElem(elem) {
      values[lookupKey(elem)] = [];
    }

    function remove($elemList, containerName, value) {
      $elemList.each(function () {
        if (containerName === undefined) {
          values[lookupKey($(this)[0])] = [];
          return;
        }
        var container = lookupContainer($(this), containerName);
        if (value === undefined) {
          container.splice(0, container.length);
          return;
        }
        $.each(container, function (key, val) {
          if (val.handler === value) {
            container.splice(key, 1);
          }
        });
      });
    }

    return {
      addForElems: set,
      getForElem: lookup,
      removeFromElem: remove,
      resetForElem: resetSingleElem
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

    return output.reverse();
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
    function offAndUnbind(eventType, fn) {
      var tmp;
      if (eventType) {
        eventHandlerStore.removeFromElem(this, eventType, fn);
      } else {
        tmp = eventHandlerStore.removeFromElem(this);
      }
    }

    mockFn('unbind', offAndUnbind);
    mockFn('off', offAndUnbind);
    mockFn('trigger', function (eventType, data) {
      var params = [eventType, this, {}];
      if (data) {
        params.push(data);
      }
      jasmineQuery.callEventHandler.apply(null, params);
    });
    interceptJQuery('remove', function () {
      $(this).each(function () {
        eventHandlerStore.resetForElem(this);
        $(this).find('*').each(function () {
          eventHandlerStore.resetForElem(this);
        });
      });
    });
  };
  jasmineQuery.unmockEvents = function () {
    $.each(mockedFns, function (id, val) {
      $.fn[id] = val;
    });
  };
  jasmineQuery.resetMockEvents = function () {
    eventHandlerStore = jasmineQuery.createSandboxedElementStorage();
    supportedEvents = ['click'];
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
    return !hasReturnedFalse;
  };
  jasmineQuery.hasHandler = function (eventType, $elem) {
    return lookupHandlers($elem, eventType).length > 0;
  };
  jasmineQuery.resetMockEvents();
  jasmineQuery.addMatchers({
    toPreventDefaultFor: function (event) {
      var defaultPrevented = false;
      var returnValAllowsDefault = jasmineQuery.callEventHandler(event, this.actual, {
        preventDefault: function () {
          defaultPrevented = true;
        }
      });
      return defaultPrevented || !returnValAllowsDefault;
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
