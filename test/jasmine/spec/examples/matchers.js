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
    expect($elem).elementToExist();
    expect($elem.children()).not.elementToExist();
  });
  it('should match text', function () {
    var inputHtml = 'a<b>c</b>';
    $elem.html(inputHtml);
    expect($elem).textToEqual('ac');
    expect($elem).not.textToEqual(inputHtml);
  });
  it('should partially match text', function () {
    var inputHtml = 'a<b>c</b>';
    $elem.html(inputHtml);
    expect($elem).toContainText('a');
    expect($elem).not.toContainText('b');
  });
  it('should match html', function () {
    var inputHtml = 'a<b>c</b>';
    $elem.html(inputHtml);
    expect($elem).not.htmlToEqual('ac');
    expect($elem).htmlToEqual(inputHtml);
  });
  it('should match containing element', function () {
    var $container = $('<div/>');
    expect($container).not.toContain($elem);
    $container.append($elem);
    expect($container).toContain($elem);
  });
  it('should match exact element', function () {
    var $container = $('<div/>');
    expect($container).not.toContain('div');
    $container.append($elem);
    expect($container).toContain('div');
  });
  it('should complain when asked to match anything but one element', function () {
    // if this isn't what you want then visit https://github.com/steward-digital/JasmineQuery and let us know.
    $elem.append('<div/>').append('<div/>');
    expect(function () {
      expect($elem.find('div')).toBeElement($('<div/>'));
    }).toThrow('please provide a single jQuery element for .toBeElement');
    expect(function () {
      expect($elem.find('.non-existant')).toBeElement($('<div/>'));
    }).toThrow('please provide a single jQuery element for .toBeElement');
  });
  it('should match core element', function () {
    var $container = $('<div/>');
    expect($container).not.toContain('div');
    $container.append($elem);
    expect($container.find('div')).not.toBeElement($('<div/>'));
    expect($container.find('div')).toBeElement($elem);
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
    it('should cleanup custom matchers between tests', function () {
      expect(function () {
        expect($elem).not.toBeSomethingSpecific();
      }).toThrow();
    });
    it('should only run your custom matcher with valid jQuery elements so that' +
      ' you don\'t have to worry about checking it yourself', function () {
      var spyMatcher = jasmine.createSpy('spy');
      jasmineQuery.addMatcher('toBeSomethingElse', spyMatcher);
      expect(function () {
        expect({someRandomThing: 'abc'}).toBeSomethingElse();
      }).toThrow('non jQuery element provided for matcher [toBeSomethingElse]');
      expect(spyMatcher).not.toHaveBeenCalled();
    });
  });
  describe('conflict resolution', function () {
    it('should be able to reinsert matchers for current test', function () {
      var spy = jasmine.createSpy('matcher spy');
      jasmine.Matchers.prototype.toHaveClass = spy;
      jasmineQuery.refreshMatchers(this);
      expect($('<a class="a"/>')).toHaveClass('a');
      expect($('<a/>').children()).not.toHaveClass('a');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
