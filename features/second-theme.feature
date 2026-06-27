Feature: Second theme (Animals)
  The Animals island reuses the same engine + huts via the theme-content registry.
  Play its Listen hut end-to-end to prove the theme is wired (the map still locks
  it until Weather is mastered; this deep-links the hut route directly).

  Scenario: Complete the Animals Listen hut
    Given I open "/child/milo/island/animals/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "You earned"
