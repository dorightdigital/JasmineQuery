JasmineQuery
===

How to use
---

You'll need to include the main [JasmineQuery js file](src/JasmineQuery.js) in your SpecRunner.html, then you'll get access to all the [matchers](test/jasmine/spec/examples/matchers.js), you need to setup mock events manually (because you might not always want them, I'd suggest adding it to the beforeEach just like in [the event examples](test/jasmine/spec/examples/events.js).

*[See all examples](test/jasmine/spec/examples)*

Why JasmineQuery?
---

JasmineQuery is the tool various teams we work with were missing from their projects, we'd often ask ourselves "surely there's a simpler way".  After a few custom solutions in individual tests which quickly became difficult to read it was apparent that this problem needed solving.  JasmineQuery is hoping to iteratively grow into everything you need to write readable, managable jQuery tests in Jasmine.  See how we're doing so far by [reading the examples](test/jasmine/spec/examples) for yourself - tests should document behaviours, how better to document the behaviour of a testing helper than write some tests that use it?

Dev Approach & pull requests
---

Steward Digital work using some [Core Code Quality Principles](http://bit.ly/1dLRusy) which should all be pretty familiar.  We apply these principles to tools like JasmineQuery as well as full on projects.  If there's a feature you think is missing then you might be the first person to need it, you've got 3 choices:

1. Add it yourself, send a pull request
2. Document how it should work with a broken test and send a pull request
3. Email jasminequery@steward-digital.com to request the new feature

Feedback
---

It's always good to get feedback, let us know how you find it at jasminequery@steward-digital.com

