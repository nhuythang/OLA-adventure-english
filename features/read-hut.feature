Feature: Read hut
  A child reads printed words and taps the matching picture (Mover = no audio).

  Scenario: Complete the Read hut
    Given I open "/child/sunny/island/weather/read"
    Then I should see "sunny"
    When I complete the hut
    Then I should see "You earned"
    When I tap "Keep going"
    Then I should see "Play again"
