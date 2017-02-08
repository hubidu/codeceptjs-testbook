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
- Fire an end_run event when all parallel runs have finished
- Switch between diffferent device runs
- Keep statistics per device
- Fix email reporter to support multiple devices
- Mark tags which have failed tests
- Sometimes seeing a mobile screenshot in steps
- Add environment to events
- Cannot read property reduce of undefined in suite-service / updateStats
- Spinner does not spinning after test run finished
- Fix problems with parallel device runs
- Format suite time correctly
- BUG Failed to resolve filter truncate
- Restore continuous run mode
- Stop continous testing mode
- Switch environment
- Switch device
- Handle errors in before/after hooks properly
- Send an email notification when tests fail
- Run tests for different devices in parallel
- Add step prefix for before/after suite
- UI: Extract step as component
- Add suite and test duration
- Microservice to manage phantomjs instances
- Add context when step is executed in within
- BUG Dont mark executing step as passed
- BUG Pressing stop causes error on linux
- Make a nice scrolling sidebar
- Show error message when testrun fails
- Switch environment
- Enter coninuous testing mode from frontend
- Send notification on failure
- FIX Codeceptjs grep does not work if test title contains () (same for / and I think quotes)
- Start/Stop phantomjs before testrun
- Run tests for all devices
- Run tests continuously
- Run testbook app and server in a docker container

- Use and display markdown in feature and scenario titles

## BETA 2

- Store test runs in a database
- Record test runs on the server
- Search suites, tests and steps
- Group steps by page object methods

## BACKLOG
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
