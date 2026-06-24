Feature: Listen hut
  A child plays the Listen hut end-to-end and earns a sticker.

  Scenario: Complete the Listen hut
    Given I open "/child/milo/island/weather/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "Play again"
