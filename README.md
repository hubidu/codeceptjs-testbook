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
- Report before/after suite events
- Send the base url with every suite/test event (in order to create a url in I am on page step)
- Filter tests/suites by tags
- In 'I am on page' command format the parameter as link
- Link to test source file
- Show actual/expected result nicely formatted
- Run test in environment
- Show test stats (passed/failed) on tags
- Create a separate directory for every test run (and collect test artifacts like screenshots there)
- Filter suites/tests by search text (simple)
- Send an email notification when tests fail
- Run testbook app and server in a docker container
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
