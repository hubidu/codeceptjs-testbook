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
- Add step prefix for before/after suite
- Run continuously
- UI: Extract step as component
- Add suite and test duration
- Create a multi-reporter
- Create an email reporter
- DONE Run a suite
- Microservice to manage phantomjs instances
- Add context when step is executed in within
- BUG Dont mark executing step as passed
- BUG Pressing stop causes error on linux
- Implement test.after event
- Make small tags
- Make a nice scrolling sidebar
- Show error message when testrun fails
- Switch environment
- Enter coninuous testing mode from frontend
- Send notification on failure
- FIX Codeceptjs grep does not work if test title contains () (same for / and I think quotes)
- Start/Stop phantomjs before testrun
- Run tests for all devices
- Run tests continuously
- Send an email notification when tests fail
- Run testbook app and server in a docker container

- Use and display markdown in feature and scenario titles

## BETA 2

- Store test runs in a database
- Record test runs on the server
- Search suites, tests and steps

## BACKLOG
- For better readability of steps: Make method templates which specify parameters. E. g. I.see => I see {text} in {element}
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
