Feature: Grammar island
  The Grammar island (G1 MVP) reuses the four huts via a new buildGrammarQuestions
  whose choices are grammatical contrasts of the same referent (one cat vs three
  cats; running vs swimming). It is always unlocked, so deep-link its huts and play
  them end-to-end like any other island.

  Scenario: Complete the Grammar Listen hut
    Given I open "/child/milo/island/grammar/listen"
    Then I should see the audio button
    When I complete the hut
    Then I should see "You earned"

  Scenario: Complete the Grammar Speak hut by self-rating
    Given I open "/child/milo/island/grammar/speak"
    Then I should see the audio button
    When I self-rate through the hut
    Then I should see "You earned"
