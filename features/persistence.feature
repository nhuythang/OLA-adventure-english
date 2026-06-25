Feature: Sticker persistence
  Stickers are awarded one-by-one and saved per child across reloads.

  Scenario: An earned sticker is saved and survives a reload
    Given I open "/child/milo/island/weather/listen"
    When I complete the hut
    And I tap "Keep going"
    And I open "/child/milo"
    Then I should see "1 / 30"
    When I reload the page
    Then I should see "1 / 30"
