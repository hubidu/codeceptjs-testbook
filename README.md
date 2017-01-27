Testbook
=========

Visually manage your codeceptjs tests.

## Backlog

x Add a vue.js websocket (RXJS?) implementation
x Add a 'run all tests button'
x Record suites/tests/steps and associate them
x Provide test suite name in start event
x Provide humanized step name and args
x Add actor name to step
x Extract tags from titles
x Add a time stamp to suite, test and steps
x Save screenshot after each test
x Make screenshot sticky to the page
x Reverse step list
x Use vue ui library
x Show screenshot of failed tests
x Show steps of failed test highlighting failed command
x Use font-awesome icons
x Stop a test run
x Make header sticky
x Run a single test
x Report test environment in run event
x Report device in run event
x Retrieve current url for each step and return it in events
x Report before/after suite events using test.started/test.after events

## BETA 1

- FIX Find reason for before hook failures
- FIX Codeceptjs grep does not work if test title contains () (same for / and I think quotes)
- Record test runs on the server
- Store test runs in a database
- Start/Stop phantomjs before testrun
- Run tests for all devices
- Run tests continuously
- Send an email notification when tests fail
- Run testbook app and server in a docker container

## BACKLOG
- When a test fails show possibly related changes in source code (e. g. using a correlation service which uses the tags to find changes in related projects)
- Add line number to steps
- Implement conditional tags (NotProduction, NotIntegration)
- Show tags in scenarios
- Filter tests/suites by tags
- In 'I am on page' command format the parameter as link
- Link to test source file
- Show actual/expected result nicely formatted
- Run test in environment
- Show test stats (passed/failed) on tags
- Send the base url with every suite/test event (in order to create a url in I am on page step)
- Create a separate directory for every test run (and collect test artifacts like screenshots there)
- Filter suites/tests by search text (simple)
- Show test/suite source code
- Sort tests
- BUG No events fired when error in Before Hook
- BUG Cannot grep for test if scenario contains ''
- Run only specific test from the UI
- Record detailed test statistics (e. g. show success statistics per test)
- Watch test files and run (only changed) tests automatically
- Rerun failed tests automatically
- Send email when tests fail
- Show all features and scenarios in book form
- Show step context (i. e. page object method)
- Run a test in different environments
- Show actual/expected results in failed tests
- Show detailed report of a scenario execution
- Link to scenario source code
- Circumvent the codeceptjs exit listener
- Debug a test
- Test Editor
- Fulltext search in features and scenarios
