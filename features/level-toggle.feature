Feature: Dev level toggle
  A per-skill level toggle (Starter/Mover) on the sticker book, saved per child.

  Scenario: Flip a skill's level and have it persist
    Given I open "/child/milo"
    Then I should see "Levels (dev)"
    And the "listen" level shows "Starter"
    When I toggle the "listen" level
    Then the "listen" level shows "Mover"
    When I reload the page
    Then the "listen" level shows "Mover"
