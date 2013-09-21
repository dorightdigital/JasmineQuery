describe('Sandboxed Element Storage', function () {
  var $elem, obj, store;
  beforeEach(function () {
    store = jasmineQuery.createSandboxedElementStorage();
    $elem = $('<div/>');
    obj = {};
  });
  afterEach(function () {
    $elem.remove();
  });
  it('should store and retrieve objects', function () {
    store.addForElems($elem, 'container', obj);
    expect(store.getForElem($elem, 'container')[0]).toBe(obj);
  });
  it('should default to empty array for simplicity', function () {
    expect(store.getForElem($elem, 'some-nonexistant-container')).toEqual([]);
  });
  it('should retrieve undefined when unavailable', function () {
    expect(store.getForElem($elem, 'container').length).toBe(0);
  });
  it('should not persist between different elements', function () {
    var store = jasmineQuery.createSandboxedElementStorage();
    store.addForElems($('<div/>'), 'abc', {});
    expect(store.getForElem($('<div/>'), 'abc').length).toBe(0);
  });
  it('should not persist between different containers', function () {
    var store = jasmineQuery.createSandboxedElementStorage();
    store.addForElems($elem, 'abc', {});
    expect(store.getForElem($elem, 'def').length).toBe(0);
  });
  it('should persist multiple properties simultaniously', function () {
    var store = jasmineQuery.createSandboxedElementStorage();
    var $elem2 = $('<div/>');
    var obj2 = {};
    store.addForElems($elem, 'abc', obj);
    store.addForElems($elem2, 'abc', obj2);
    expect(store.getForElem($elem, 'abc')[0]).toBe(obj);
    expect(store.getForElem($elem2, 'abc')[0]).toBe(obj2);
  });
  it('should persist between different jQuery instances', function () {
    $elem.attr('id', 'abcdefghijklmnopqrstuvwxyz').appendTo('body');
    store.addForElems($('#abcdefghijklmnopqrstuvwxyz'), 'abc', 'def');
    expect(store.getForElem($elem, 'abc')[0]).toBe('def');
  });
  it('should not persist between different stores', function () {
    jasmineQuery.createSandboxedElementStorage().addForElems($elem, 'abc', 'def');
    expect(store.getForElem($elem, 'abc')[0]).toBeUndefined();
  });
  it('should allow multiple values in one container', function () {
    store.addForElems($elem, 'abc', 'def');
    store.addForElems($elem, 'abc', 'ghi');
    expect(store.getForElem($elem, 'abc')[0]).toBe('def');
    expect(store.getForElem($elem, 'abc')[1]).toBe('ghi');
  });
  describe('Multiple Elements', function () {
    var $elem2, $bothElems;
    beforeEach(function () {
      $elem2 = $('<div/>');
      $bothElems = $('<div/>').append($elem).append($elem2).children();
    });
    it('should allow setting on multiple elems', function () {
      store.addForElems($bothElems, 'abc', 'def');
      expect(store.getForElem($elem, 'abc')[0]).toBe('def');
      expect(store.getForElem($elem2, 'abc')[0]).toBe('def');
    });
    it('should not allow getting on multiple elems', function () {
      expect(function () {
        store.getForElem($bothElems);
      }).toThrow('can\'t get on multiple elements, [2] provided.');
    });
  });
});
