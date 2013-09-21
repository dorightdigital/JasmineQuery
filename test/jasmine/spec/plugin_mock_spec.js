describe('plugin mock', function () {
  var assume = expect;
  var $dom;
  var widgetName;
  beforeEach(function () {
    $dom = $('<div/>');
    assume($dom).not.toHaveUsedWidget(widgetName);
  });
  $.each(['show', 'hide'], function () {
    var widgetName = ''+this;
    it('should recognise when the spy has been called', function () {
      jasmineQuery.spyOnWidget(widgetName);
      $dom[widgetName]();
      expect($dom).toHaveUsedWidget(widgetName);
    });
    it('should recognise when the spy was called on another element', function () {
      jasmineQuery.spyOnWidget(widgetName);
      $('<div/>')[widgetName]();
      expect($dom).not.toHaveUsedWidget(widgetName);
    });
    it('should recognise when the spy was called multiple times', function () {
      var $dom2 = $('<div/>');
      jasmineQuery.spyOnWidget(widgetName);
      $dom[widgetName]();
      $dom2[widgetName]();
      expect($dom).toHaveUsedWidget(widgetName);
      expect($dom2).toHaveUsedWidget(widgetName);
    });
    it('should match based on arguments', function () {
      jasmineQuery.spyOnWidget(widgetName);
      $dom[widgetName]();
      expect($dom).not.toHaveUsedWidget(widgetName, [300]);
      $dom[widgetName](300);
      expect($dom).toHaveUsedWidget(widgetName, [300]);
    });
    it('should match based on multiple arguments', function () {
      jasmineQuery.spyOnWidget(widgetName);
      $dom[widgetName](300, 400);
      expect($dom).not.toHaveUsedWidget(widgetName, [300]);
      expect($dom).toHaveUsedWidget(widgetName, [300, 400]);
    });
  });

});
