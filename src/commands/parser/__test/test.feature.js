Feature('@Google @important I can find **codeceptjs** on google')


Before((I, googleSearchPage) => {
  I.prepareTest()
  googleSearchPage.goto()
})

Scenario('When I type codeceptjs on the google page I get the codeceptjs home page as first result', (googleSearchPage) => {
  googleSearchPage.enterInSearchField('codeceptjs')
  googleSearchPage.seeCodeceptJSAsFirstResult()
})

After((I) => {

})
