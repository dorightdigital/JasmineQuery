describe("JasmineQuery matcher examples", function () {
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
    describe('custom matchers', function () {
        it('should be really easy to create a custom matcher', function () {
            jasmineQuery.addMatcher('toBeSomethingSpecific', function () {
                return this.actual.hasClass('.somethingSpecific');
            });
            expect($elem).not.toBeSomethingSpecific();
        });
        it('should only run your custom matcher with valid jQuery elements so that' +
            ' you don\'t have to worry about checking it yourself', function () {
            var spyMatcher = jasmine.createSpy('spy');
            jasmineQuery.addMatcher('toBeSomethingElse', spyMatcher);
            expect(function () {
                expect({someRandomThing: 'abc'}).toBeSomethingElse();
            }).toThrow('non jQuery element provided for matcher [toBeSomethingElse]');
            expect(spyMatcher).not.toHaveBeenCalled();
        })
    })
});