Feature: Write hut
  The Write hut renders its trace UI (Starter). Full freehand-trace completion is
  slow/flaky to drive in CI, so the trace mechanic is covered by unit tests
  (spelling logic) + a local sweep; here we assert it mounts and renders.

  Scenario: The Write hut renders the trace pad
    Given I open "/child/milo/island/weather/write"
    Then I should see the trace pad
    And I should see the audio button
