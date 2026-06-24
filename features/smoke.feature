Feature: App smoke test
  The stack boots and the child chooser renders.

  Scenario: Home screen renders
    Given I open the home screen
    Then I should see "Who's playing?"
