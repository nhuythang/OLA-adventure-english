Feature: Write hut
  A child traces the letters and finishes the Write hut (Starter = trace).

  Scenario: Trace every letter to finish the hut
    Given I open "/child/milo/island/weather/write"
    Then I should see the trace pad
    When I trace every letter
    Then I should see "Play again"
