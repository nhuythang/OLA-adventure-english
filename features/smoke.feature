Feature: App smoke test
  The stack boots and the placeholder home screen renders.

  Scenario: Home screen renders
    Given I open the home screen
    Then I should see "OLA English Adventure"
