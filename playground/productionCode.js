$.fn.openInNewWindow = function () {
	$(this).click(function (event) {
		window.open($(this).attr('href'));
		event.preventDefault();
	});
};
