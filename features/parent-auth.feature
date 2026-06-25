Feature: Parent area is gated
  The parent area is never open to a child. Without a parent session, any
  /parent route lands on the Vietnamese login. (Runs with Supabase unconfigured,
  like the e2e harness, so it exercises the degrade-to-signed-out path.)

  Scenario: Visiting the parent area without a session shows the login
    Given I open "/parent"
    Then I should see "Khu vực phụ huynh"
    And I should see "Đăng nhập"

  Scenario: The parent lock on the chooser opens the login
    Given I open the home screen
    When I tap "Khu vực phụ huynh"
    Then I should see "Đăng nhập"
