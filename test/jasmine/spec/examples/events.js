describe('Event examples', function () {
    beforeEach(function () {
        jasmineQuery.mockEvents();
    });
    describe('testing events', function () {
        it('should be easy to tell if an element has an event handler', function () {
            var $elem = $('<div/>');
            expect($elem).not.toHaveEventHandlerFor('click');
            $elem.click(function () {});
            expect($elem).toHaveEventHandlerFor('click');
        });
        it('should be easy to fake a jQuery event', function () {
            var $elem = $('<div/>');
            var spy = jasmine.createSpy('spy');
            $elem.click(spy);
            $elem.click();
            expect(spy).toHaveBeenCalled();
        });
        it('should also work with "on" syntax', function () {
            var $parent = $('<div/>')
            var $elem = $('<div class="child"/>').appendTo($parent);
            var spy = jasmine.createSpy('spy');
            $parent.on('click', '.child', spy);
            $elem.click();
            expect(spy).toHaveBeenCalled();
        });
        it('should not matter which instance of the element you interact with', function () {
            var $elem = $('<div id="myElement"/>');
            var spy = jasmine.createSpy('spy');
            $('#myElement').on('click', spy);
            $('#myElement').click();
            expect(spy).toHaveBeenCalled();
        });
        it('should not have side effects from interacting with standard dom elements', function () {
            var $form = $('<form action="http://www.google.com/"><input value="Why am I here?" name="q"/></form>');
            $form.submit(); // normally now you'd be on google asking 'Why am I here?'
                            // instead the test is continuing to execute... surely that's more useful.
                            // If you don't believe me then try commenting out jasmineQuery.mockEvents() in beforeEach.
            var spyHandler = jasmine.createSpy('an in-app handler');
            $form.submit(spyHandler); // But when we add a behaviour to our application
            $form.submit(); // and re-submit
            expect(spyHandler).toHaveBeenCalled(); // our handler was executed.
        });
        it('should be clear when the default behaviour is prevented', function () {
            var $hyperlink = $('<a href="http://bing.com/"/>');
            $hyperlink.click(function (event) {
                if ($(this).attr('href').indexOf('bing.com') > -1) {
                    // show some sarcastic message about bing being a stupid search engine
                    event.preventDefault();
                }
            });
            expect($hyperlink).toPreventDefaultEventHandlerFor('click');
            $hyperlink.attr('href', 'http://google.com');
            expect($hyperlink).not.toPreventDefaultEventHandlerFor('click');
        });
    });
});