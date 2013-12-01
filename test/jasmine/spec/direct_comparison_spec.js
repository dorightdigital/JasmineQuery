describe('direct comparison', function () {
  var $elem, spy;
  beforeEach(function () {
    $elem = $('<div/>');
    spy = jasmine.createSpy('mainSpy');
  });
  $.each(['with', 'without'], function (key, withOrWithout) {
    describe(withOrWithout + ' JasmineQuery', function () {
      if (withOrWithout === 'with') {
        beforeEach(function () {
          jasmineQuery.mockEvents();
        });
      }
      describe('event bubbling', function () {
        var $elem, $child, childClickHandler, parentClickHandler;
        beforeEach(function () {
          childClickHandler = jasmine.createSpy('childHandler');
          parentClickHandler = jasmine.createSpy('parentHandler');
          $elem = $('<div/>');
          $child = $('<span/>').appendTo($elem).click(childClickHandler);
        });
        it('should bubble to parent handler on child click', function () {
          $elem.click(parentClickHandler);
          $child.click();
          expect(childClickHandler).toHaveBeenCalled();
          expect(parentClickHandler).toHaveBeenCalled();
        });
        it('should still bubble on preventDefault', function () {
          childClickHandler.andCallFake(function (e) {
            e.preventDefault();
          });
          $elem.click(parentClickHandler);
          $child.click();
          expect(childClickHandler).toHaveBeenCalled();
          expect(parentClickHandler).toHaveBeenCalled();
        });
        it('should not bubble on return false', function () {
          $elem.click(parentClickHandler);
          $child.click(function () {
            return false;
          }).click();
          expect(parentClickHandler).not.toHaveBeenCalled();
        });
        it('should not bubble on return false in child selector', function () {
          $elem.click(parentClickHandler).on('click', '*', function () {
            return false;
          });
          $child.click();
          expect(parentClickHandler).not.toHaveBeenCalled();
        });
        it('should call both handlers that apply to child', function () {
          $elem.on('click', '*', parentClickHandler);
          $child.click();
          expect(childClickHandler).toHaveBeenCalled();
          expect(parentClickHandler).toHaveBeenCalled();
        });
        it('should pass custom data when triggered', function () {
          $child.trigger('click', {abc: 'def'});
          expect(childClickHandler).toHaveBeenCalledWith(jasmine.any(Object), {abc: 'def'});
        });
        it('should allow triggering with no data', function () {
          $child.trigger('click');
          expect(childClickHandler).toHaveBeenCalledWith(jasmine.any(Object));
        });
      });
      it('cannot use "on" "child" to refer to itself', function () {
        $elem.appendTo('body');
        $elem.on('click', ':visible', spy);
        $elem.click();
        expect(spy).not.toHaveBeenCalled();
        $elem.remove();
      });
      it('should work with simple events', function () {
        $elem.click(spy).click();
        expect(spy).toHaveBeenCalled();
      });
      describe('special behaviour for checkboxes', function () {
        it('should toggle checkbox when clicked', function () {
          var chb = $('<input type="checkbox"/>');
          expect(chb.is(':checked')).toBeFalsy();
          chb.click();
          expect(chb.is(':checked')).toBeTruthy();
          chb.click();
          expect(chb.is(':checked')).toBeFalsy();
        });
        it('should not toggle checkbox on other events', function () {
          var chb = $('<input type="checkbox"/>');
          chb.mouseenter();
          expect(chb.is(':checked')).toBeFalsy();
        });
      });
      describe('special behaviour for radio buttons', function () {
        it('should toggle both with same name when clicked', function () {
          var buttonA = $('<input type="radio" name="test" value="a"/>');
          var buttonB = $('<input type="radio" name="test" value="b"/>');
          $('<form/>').append(buttonA).append(buttonB);
          expect(buttonA.is(':checked')).toBeFalsy();
          expect(buttonB.is(':checked')).toBeFalsy();
          buttonA.click();
          expect(buttonA.is(':checked')).toBeTruthy();
          expect(buttonB.is(':checked')).toBeFalsy();
          buttonB.click();
          expect(buttonA.is(':checked')).toBeFalsy();
          expect(buttonB.is(':checked')).toBeTruthy();
        });
        it('should toggle just one with different names when clicked', function () {
          var buttonA = $('<input type="radio" name="test" value="a"/>');
          var buttonB = $('<input type="radio" name="testb" value="b"/>');
          $('<form/>').append(buttonA).append(buttonB);
          expect(buttonA.is(':checked')).toBeFalsy();
          expect(buttonB.is(':checked')).toBeFalsy();
          buttonA.click();
          expect(buttonA.is(':checked')).toBeTruthy();
          expect(buttonB.is(':checked')).toBeFalsy();
          buttonB.click();
          expect(buttonA.is(':checked')).toBeTruthy();
          expect(buttonB.is(':checked')).toBeTruthy();
        });
        it('should not toggle checkbox on other events', function () {
          var chb = $('<input type="checkbox"/>');
          chb.mouseenter();
          expect(chb.is(':checked')).toBeFalsy();
        });
      });
      describe('using "on" syntax', function () {
        it('should support first event when space separated', function () {
          $elem.on('click mouseover', spy);
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support second event when space separated', function () {
          $elem.on('click mouseover', spy);
          $elem.mouseover();
          expect(spy).toHaveBeenCalled();
        });
        it('should support namespaced events', function () {
          $elem.on('click.abc', spy);
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support multiple events in one', function () {
          var clickHandler = jasmine.createSpy('click');
          var mouseenterHandler = jasmine.createSpy('mouseenter');
          $elem.on({
            click: clickHandler,
            mouseenter: mouseenterHandler
          }, spy);
          expect(clickHandler).not.toHaveBeenCalled();
          $elem.click();
          expect(clickHandler).toHaveBeenCalled();
          expect(mouseenterHandler).not.toHaveBeenCalled();
          $elem.mouseenter();
          expect(mouseenterHandler).toHaveBeenCalled();
        });
        it('should have return false shorthand', function () {
          var $span = $('<span/>');
          $elem.click(spy);
          $span.on('click', false).append($span);
          $span.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should have return false shorthand for child selector', function () {
          var $span = $('<span/>');
          $elem.click(spy);
          $elem.on('click', '*', false).append($span);
          $span.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should pass data through', function () {
          var data = {abc: 'def'};
          spy.andCallFake(function (e) {
            expect(e.data).toBe(data);
          });
          $elem.on('click', data, spy).click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support off', function () {
          $elem.on('click', spy);
          $elem.off('click', spy);
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should pass data through alongside child selector', function () {
          var data = {abc: 'def'};
          var $child = $('<span/>').appendTo($elem);
          spy.andCallFake(function (e) {
            expect(e.data).toBe(data);
          });
          $elem.on('click', '*', data, spy).click();
          expect(spy).not.toHaveBeenCalled();
          $child.click();
          expect(spy).toHaveBeenCalled();
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
          it('should not contain data by default', function () {
            $elem.on('click',function (event) {
              expect(event.data).toBeUndefined();
            }).click();
          });
        });
      });
      describe('using bind', function () {
        it('should work with basic syntax', function () {
          $elem.bind('click', spy).click();
          expect(spy).toHaveBeenCalled();
        });
        it('should work with associated data', function () {
          var spy = jasmine.createSpy('spy'), data = {abc: 'def'};
          spy.andCallFake(function (e) {
            expect(e.data).toBe(data);
          });
          $('<div/>').bind('click', data, spy).click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support first event when space separated', function () {
          $elem.bind('click mouseover', spy);
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support second event when space separated', function () {
          $elem.bind('click mouseover', spy);
          $elem.mouseover();
          expect(spy).toHaveBeenCalled();
        });
        it('should support simple unbinding', function () {
          $elem.bind('click', spy);
          $elem.unbind('click', spy);
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should only unbind actual function provided', function () {
          $elem.bind('click', spy);
          $elem.unbind('click', function(){});
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should only unbind same event type', function () {
          $elem.bind('click', spy);
          $elem.unbind('something', spy);
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should unbind all events of one type', function () {
          $elem.bind('click submit', spy);
          $elem.unbind('click');
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
          $elem.submit();
          expect(spy).toHaveBeenCalled();
        });
        it('should unbind all events of all types', function () {
          $elem.bind('click', spy);
          $elem.unbind();
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should turn "off" all events of all types', function () {
          $elem.on('click', spy);
          $elem.off();
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should support namespaced binding', function () {
          $elem.bind('click.mynamespace', spy);
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should support multiple events in one', function () {
          var clickHandler = jasmine.createSpy('click');
          var mouseenterHandler = jasmine.createSpy('mouseenter');
          $elem.bind({
            click: clickHandler,
            mouseenter: mouseenterHandler
          }, spy);
          expect(clickHandler).not.toHaveBeenCalled();
          $elem.click();
          expect(clickHandler).toHaveBeenCalled();
          expect(mouseenterHandler).not.toHaveBeenCalled();
          $elem.mouseenter();
          expect(mouseenterHandler).toHaveBeenCalled();
        });
        it('should not contain data by default', function () {
          $elem.bind('click',function (event) {
            expect(event.data).toBe(null);
          }).click();
        });
      });
      describe('removing elements', function () {
        beforeEach(function () {
          $elem.click(spy);
        });
        it('should recognise when event handlers are lost through removing dom elements', function () {
          $elem.appendTo($('body'));
          $elem.remove();
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
        it('should allow click events before removing from the dom', function () {
          $elem.appendTo($('body'));
          $elem.click();
          $elem.remove();
          expect(spy).toHaveBeenCalled();
        });
        it('should allow click events without being part of the dom', function () {
          $elem.click();
          expect(spy).toHaveBeenCalled();
        });
        it('should allow click events without being part of the dom', function () {
          $('<div/>').append($elem).remove();
          $elem.click();
          expect(spy).not.toHaveBeenCalled();
        });
      });
      // todo: one, delegate, undelegate, hover
    });
  });
});
