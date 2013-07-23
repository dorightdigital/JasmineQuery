describe('jQuery', function () {
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
      childClickHandler.andReturn(false);
      $elem.click(parentClickHandler);
      $child.click();
      expect(childClickHandler).toHaveBeenCalled();
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
    it('should call both handlers that apply to child', function () {
      $elem.on('click', '*', parentClickHandler);
      $child.click();
      expect(childClickHandler).toHaveBeenCalled();
      expect(parentClickHandler).toHaveBeenCalled();
    });
    it('should call both handlers that apply to child', function () {
      $elem.on('click', '*', parentClickHandler);
      $child.trigger('click', {abc:'def'});
      expect(childClickHandler).toHaveBeenCalledWith(jasmine.any(Object), {abc:'def'});
    });
  });
  it('cannot use "on" "child" to refer to itself', function () {
    var $elem = $('<div/>').appendTo('body');
    var spy = jasmine.createSpy('fn');
    $elem.on('click', ':visible', spy);
    $elem.click();
    expect(spy).not.toHaveBeenCalled();
    $elem.remove();
  });
});
