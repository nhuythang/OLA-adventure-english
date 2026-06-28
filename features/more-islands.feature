Feature: Food & Colours islands
  The Food and Colours islands reuse the engine via the theme-content registry.
  Play their Listen huts end-to-end (deep-linking the hut route, since the map
  locks later islands until the earlier ones are mastered).

  Scenario: Complete the Colours Listen hut
    Given I open "/child/milo/island/colors/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "You earned"

  Scenario: Complete the Food Listen hut
    Given I open "/child/milo/island/food/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "You earned"
