/*global jasmine*/
var jasmineQuery = {
    addMatchers: function (matchers) {
        $.each(matchers, function (key, val) {
            jasmine.Matchers.prototype[key] = function () {
                if (!this.actual.is || !this.actual.on || !this.actual.click) {
                    throw 'non jQuery element provided for matcher [' + key + ']';
                }
                return val.apply(this, arguments)
            }
        });
    }
};

jasmineQuery.addMatchers({
    toHaveClass: function(expected) {
        return this.actual.hasClass(expected);
    },
    toBeVisible: function() {
        return this.actual.is(':visible');
    },
    toExist: function() {
        return this.actual.length > 0;
    }
});

