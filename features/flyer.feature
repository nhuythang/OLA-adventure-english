Feature: Flyer (L3) mechanics
  Flyer turns single words into sentences. Set the Listen skill to Flyer via the
  dev toggle, then play the sentence → scene hut (4 choices) end-to-end.

  Scenario: Complete the Flyer Listen hut
    Given I open "/child/milo"
    Then I should see "Levels (dev)"
    When I toggle the "listen" level
    And I toggle the "listen" level
    Then the "listen" level shows "Flyer"
    When I open "/child/milo/island/weather/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "You earned"
