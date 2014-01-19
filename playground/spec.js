describe('Open In New Window', function () {
	beforeEach(function () {
		jasmineQuery.mockEvents();
		spyOn(window, 'open');
		this.$link = $('<a href="http://google.com/"/>');
		this.$link.openInNewWindow();
	});
	it('should prevent default', function () {
		expect(this.$link).toPreventDefaultFor('click');
	});
	it('should open new window when clicked', function () {
		this.$link.click();
		expect(window.open).toHaveBeenCalledWith('http://google.com/');
	});
});
