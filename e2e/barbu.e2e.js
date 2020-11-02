describe("Barbu", async () => {
  test("A whole 3p barbu game", function(browser) {
    browser.url("localhost:3001")
      .waitForElementVisible('.WaitingRoom__NameInput')
      .setValue('.WaitingRoom__NameInput', "Player 1")
      .waitForElementNotPresent('.WaitingRoom input[type=submit]:disabled')
      .submitForm('.WaitingRoom form')
      .assert.containsText('.WaitingRoom__PlayerList .WaitingRoom__Player:nth-child(1)', "Player 1")
      .end()
  });
})
