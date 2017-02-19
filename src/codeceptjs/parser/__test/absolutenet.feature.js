Feature('Testing Begins');

Before((I) => {
  I.prepareTest();
})

After((I) => {
  I.clearCookie();
})

Scenario('ANI testing', function*(I){
  I.amOnPage('http://www.absolutenet.com/');
  let title = yield I.grabTitle();
  I.comment(`I see this in **title** *${title}*`)
  I.see('bogus text that is not there'); //this should give an error and not success.
});