Feature: Speak hut
  A child hears the model word, repeats it, and self-rates (Starter / no-mic path).

  Scenario: Complete the Speak hut by self-rating
    Given I open "/child/milo/island/weather/speak"
    Then I should see "Now you say it"
    When I self-rate through the hut
    Then I should see "You earned"
    When I tap "Keep going"
    Then I should see "Play again"
