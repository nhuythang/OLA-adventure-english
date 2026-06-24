Feature: UI primitives behavior
  The task-05 primitives render and the choice card reflects selection state.

  Background:
    Given I open the home screen

  Scenario: The audio replay button is present
    Then I should see the audio button

  Scenario: Tapping the correct choice marks it correct
    When I tap the "sunny" choice
    Then the "sunny" choice is marked "correct"

  Scenario: Tapping a wrong choice dims it (scaffold), not "correct"
    When I tap the "rainy" choice
    Then the "rainy" choice is marked "dimmed"
