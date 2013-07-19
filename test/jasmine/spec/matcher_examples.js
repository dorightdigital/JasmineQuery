describe("JasmineQuery matcher examples", function() {
    var $elem;
    beforeEach(function () {
        $elem = $('<div/>').appendTo('body');
    });
    afterEach(function () {
        $elem.remove();
    });
    it('should match classes', function () {
       expect($elem).not.toHaveClass('abc');
       $elem.addClass('abc');
       expect($elem).toHaveClass('abc');
    });
    it('should match visibility', function () {
       expect($elem.show()).toBeVisible();
       expect($elem.hide()).not.toBeVisible();
    });
    it('should match existance', function () {
        expect($elem).toExist();
        expect($elem.children()).not.toExist();
    });
    it('should complain if non-jQuery element provided', function () {
        expect(function () {
            expect('abc').toHaveClass('abc');
        }).toThrow('non jQuery element provided for matcher [toHaveClass]')
    });
    it('should complain if non-jQuery element provided with correct matcher name', function () {
        expect(function () {
            expect('abc').toBeVisible();
        }).toThrow('non jQuery element provided for matcher [toBeVisible]')
    });
});