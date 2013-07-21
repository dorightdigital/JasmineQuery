describe('Event Mocks', function () {
  var $elem, emptyFunc;
  beforeEach(function () {
    $elem = $('<div/>');
    jasmineQuery.mockEvents();
    emptyFunc = function () {
    };
  });
  afterEach(function () {
    jasmineQuery.resetMockEvents();
  });
  describe('normal events', function () {
    $.each(['click', 'mouseenter', 'mouseleave', 'submit'], function () {
      var eventType = '' + this;
      describe(eventType + ' handlers', function () {
        it('should capture basic ' + eventType + ' event handler', function () {
          $elem[eventType](emptyFunc);
          expect($elem).toHaveEventHandlerFor(eventType);
        });
        it('should not realise when no handler', function () {
          expect($elem).not.toHaveEventHandlerFor(eventType);
        });
        it('should respond to "on" syntax', function () {
          $elem.on(eventType, emptyFunc);
          expect($elem).toHaveEventHandlerFor(eventType);
        });
        it('should work with child event syntax', function () {
          var $div = $('<div/>');
          var handler = jasmine.createSpy('handler');
          $elem.append($div);
          $elem.on(eventType, 'div', handler);
          $elem.find('div')[eventType]();
          expect(handler).toHaveBeenCalled();
        });
        it('should not cross-over between elements', function () {
          $('<div/>')[eventType](emptyFunc);
          expect($elem).not.toHaveEventHandlerFor(eventType);
        });
        it('should detect preventing default behaviour', function () {
          $elem[eventType](function (e) {
            e.preventDefault()
          });
          expect($elem).toPreventDefaultEventHandlerFor(eventType);
        });
        it('should detect when not preventing default behaviour', function () {
          $elem[eventType](function (e) {
          });
          expect($elem).not.toPreventDefaultEventHandlerFor(eventType);
        });
        it('should detect preventing default if any function prevents it', function () {
          $elem[eventType](function (e) {
          });
          $elem[eventType](function (e) {
            e.preventDefault();
          });
          $elem[eventType](function (e) {
          });
          expect($elem).toPreventDefaultEventHandlerFor(eventType);
        });
        it('should call through to handler function', function () {
          var spy = jasmine.createSpy('handler');
          $elem[eventType](spy);
          $elem[eventType]();
          expect(spy).toHaveBeenCalled();
        });
        it('should allow chaining', function () {
          expect($elem.click(emptyFunc)).toBe($elem);
        });
        it('should pass through target as this', function () {
          $elem.attr('data-something', 'thing')[eventType](function () {
            expect($(this).attr('data-something')).toBe('thing');
          })[eventType]();
        });
        it('should pass through event type', function () {
          $elem[eventType](function (event) {
            expect(event.type).toBe(eventType);
          })[eventType]();
        });
        it('should work with multiple elements', function () {
          var $elems = $('<div><p/><p/></div>').find('p');
          var spy = jasmine.createSpy('handler');
          $elems[eventType](spy);
          $elems.eq(0)[eventType]();
          expect(spy).toHaveBeenCalled();
          spy.reset();
          $elems.eq(1)[eventType]();
          expect(spy).toHaveBeenCalled();
        });
      });
    })
  });
  it('should not cross-over between event types', function () {
    $elem.on('submit', emptyFunc);
    expect($elem).not.toHaveEventHandlerFor('click');
  });
  it('should allow chaining', function () {
    expect($elem.on('click', emptyFunc)).toBe($elem);
  });
  it('should not cross-over callback functions between elements', function () {
    var $div = $('<div/>');
    var elemClick = jasmine.createSpy('elem');
    var divClick = jasmine.createSpy('div');
    $elem.click(elemClick);
    $div.click(divClick);
    $elem.click();
    expect(elemClick).toHaveBeenCalled();
    expect(divClick).not.toHaveBeenCalled();
  });
  it('should not cross-over callback functions between elements', function () {
    var $div = $('<div/>');
    var clickHandler1 = jasmine.createSpy('handler1');
    var clickHandler2 = jasmine.createSpy('handler2');
    $elem.click(clickHandler1);
    $div.click(clickHandler2);
    $div.click();
    expect(clickHandler1).not.toHaveBeenCalled();
    expect(clickHandler2).toHaveBeenCalled();
  });
  it('should call multiple handlers on one event/element combination', function () {
    var clickHandler1 = jasmine.createSpy('handler1');
    var clickHandler2 = jasmine.createSpy('handler2');
    $elem.click(clickHandler1);
    $elem.click(clickHandler2);
    $elem.click();
    expect(clickHandler1).toHaveBeenCalled();
    expect(clickHandler2).toHaveBeenCalled();
  });
  it('should not cross-over callback functions between event types', function () {
    var submitHandler = jasmine.createSpy('submit');
    var clickHandler = jasmine.createSpy('click');
    $elem.on('submit', submitHandler);
    $elem.on('click', clickHandler);
    $elem.click();
    expect(submitHandler).not.toHaveBeenCalled();
    expect(clickHandler).toHaveBeenCalled();
  });
  describe('event object', function () {
    it('should contain target', function () {
      var nativeElem = $elem[0];
      $elem.on('click',function (event) {
        expect(event.target).toBe(nativeElem)
      }).click();
    });
    it('should contain a timestamp', function () {
      var fakeTime = 100;
      spyOn(Date.prototype, 'getTime').andReturn(fakeTime);
      $elem.on('click',function (event) {
        expect(event.timeStamp).toBe(fakeTime);
      }).click();
    });
  })
  describe('edge cases and assumptions', function () {
  });
});
