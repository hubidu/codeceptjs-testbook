Testbook
=========

Visually manage your codeceptjs tests.

## Backlog

## BETA 1

- DONE Implement comment/say
- DONE Marked failed step
- DONE Nicer error formatting
- DONE FIX Error screenshot is broken
- DONE Improve test styling
- DONE Extract nav as a component
- DONE Run continuously
- DONE Create an email reporter
- DONE Run a suite
- DONE Create a multi-reporter
- DONE Run device tests in parallel
- DONE Set DEVICE environment variable for each run
- DONE Use a different phantomjs instance for parallel runs
- DONE Switch between diffferent device runs
- DONE Step syntax highlight: Display strings and selectors in different colors
- DONE Bundle testbook server and testbook frontend
- DONE Mark last step as passed when test is passed
- DONE Fix problems with parallel device runs
- DONE Spinner does not spinning after test run finished
- DONE Extract step as component
- DONE Run tests for all devices
- DONE Add environment to events
- DONE Dont mark executing step as passed
- DONE Start/Stop phantomjs before testrun
- DONE Cannot read property reduce of undefined in suite-service / updateStats
- DONE Format suite time correctly
- DONE Restore webpack dev mode
- DONE Handle errors in before/after hook gracefully
- DONE BUG HTML source not captured
- DONE BUG: Why are steps not shown in UN test suite?
- DONE Make environments configurable
- DONE Create a testbook config file
- DONE Make phantom ports dynamic
- DONE Use and display markdown in feature and scenario titles

- DONE BUG Screenshots not showing
- DONE Mark suite as passed/failed
- DONE Try browser.on('error') events
- DONE BUG STOP Testrun does not work properly
- DONE 'Failed to find test' console error when running yahoo test
- DONE UI Allow to expand more than one test
- DONE Are phantomjs instances terminated?
- DONE UI Keep selected tests when switching between devices
- DONE Fire an end_run event when all parallel runs have finished
- Sort features lexicographically
- Yahoo test does not complete in UI
- Run continous mode with tag(s)
- Record test success/failure statistics server side
- BUG UI Show only configured devices
- UI Get environments/devices from server
- Show per device test passed/fail status (e. g. as green/red mobile, tablet desktop icon)
- Write a decent readme
- Record an awesome screencast
- Display BeforeSuite/AfterSuite events
- Show tags on tests
- Start phantom only if webdriverio is configured for phantom
- Keep statistics per device
- Fix email reporter to support multiple devices
- Mark tags which have failed tests
- SHOULD BE FIXED Sometimes seeing a mobile screenshot in steps
- BUG Failed to resolve filter truncate
- Restore continuous run mode
- Stop continous testing mode
- Switch environment
- Send an email notification when tests fail
- Add suite and test duration
- Show error message when testrun fails
- Switch environment
- Enter coninuous testing mode from frontend
- Send notification on failure
- Run testbook app and server in a docker container


## BETA 2

- BUG (codeceptjs) No file property in before/after hook events
- FIX Codeceptjs grep does not work if test title contains () (same for / and I think quotes)
- BUG Correctly distinguish hook events from step events
- Implement support for within
- BIG IDEA: test tracking pixel and affiliate stuff
- Automatic cleanup of screenshots would be nice
- Store test runs in a database
- Record test runs on the server
- Search suites, tests and steps
- Group steps by page object methods

## BACKLOG
- Fire debug events (would require equipping output.log/debug with events )
- IDEA Implement a 'linter' for codeceptjs tests and recommend best practices (e. g. dont use timeouts in wait functions, use waitForText with context, use see instead of grab/assert)
- For better readability of steps: Make method templates which specify parameters. E. g. I.see => I see {text} in {element}
- When a test fails show possibly related changes in source code (e. g. using a correlation service which uses the tags to find changes in related projects)
- Implement conditional tags (NotProduction, NotIntegration)
- Show tags in scenarios
- Filter tests/suites by tags
- In 'I am on page' command format the parameter as link
- Show test stats (passed/failed) on tags
- Send the base url with every suite/test event (in order to create a url in I am on page step)
- Filter suites/tests by search text (simple)
- Show test/suite source code
- BUG No events fired when error in Before Hook
- BUG Cannot grep for test if scenario contains ''
- Watch test files and run (only changed) tests automatically
- Rerun failed tests automatically
- Show all features and scenarios in book form
- Run a test in different environments
- Link to scenario source code
- Debug a test
- Test Editor
- Fulltext search in features and scenarios
- Visual regression testing using phantomcss
- Helpers to test tracking
- Show longterm test statistics (and detect flakey tests)
