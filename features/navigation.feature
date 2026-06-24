Feature: Child navigation — chooser to island map
  A child picks their profile, opens their sticker book, and reaches an island.

  Background:
    Given I open the home screen

  Scenario: Choose a child and reach the Weather island
    Then I should see "Who's playing?"
    When I tap "Milo"
    Then I should see "My sticker book"
    When I tap "Play"
    Then I should see "Choose an island"
    And I should see "Weather"
    When I tap "Weather"
    Then I should see "Weather island"

  Scenario: Locked islands are not enterable
    When I tap "Sunny"
    And I tap "Play"
    Then I should see "Animals"
    And the "Animals island, locked" control is not a link
