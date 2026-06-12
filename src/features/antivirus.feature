Feature: Antivirus Core Functions
  As a user
  I want to be able to scan my system and manage threats
  So that I can keep my computer secure

  Scenario: Dashboard shows initial protected status
    Given I open the RustGuard application
    Then I should see the "SISTEMA PROTEGIDO" status
    And the realtime protection toggle should be visible

  Scenario: Toggling realtime protection
    Given I open the RustGuard application
    When I click the realtime protection toggle
    Then the status should change to "ON"

  Scenario: Quick scan execution
    Given I open the RustGuard application
    When I click on "Escaneo Rápido"
    Then I should be navigated to the "Centro de Escaneo" page
    And I should see the "Detener Escaneo" button

  Scenario: Full scan execution
    Given I open the RustGuard application
    When I click on "Escaneo Completo"
    Then I should be navigated to the "Centro de Escaneo" page
    And I should see the "Detener Escaneo" button

  Scenario: Quarantine view access
    Given I open the RustGuard application
    When I navigate to the Quarantine section
    Then I should see "Bóveda de Cuarentena"
    And I should see the quarantine records table or empty state

  Scenario: History view access
    Given I open the RustGuard application
    When I navigate to the History section
    Then I should see "Historial de Escaneos"
    And I should see the scan history records table or empty state

  Scenario: Canceling an active scan
    Given I open the RustGuard application
    And I click on "Escaneo Rápido"
    When I click on "Detener Escaneo"
    Then the scan should stop and the button should disappear

  Scenario: Sidebar navigation highlights active section
    Given I open the RustGuard application
    When I navigate to the Scan section
    Then the Scan section in the sidebar should be highlighted

  Scenario: Realtime page status
    Given I open the RustGuard application
    When I navigate to the RealTime section
    Then I should see "Protección en Tiempo Real"
    And I should see the anti-ransomware status

  Scenario: History export functionality exists
    Given I open the RustGuard application
    When I navigate to the History section
    Then I should see an "Exportar Historial" button

  Scenario: View application version
    Given I open the RustGuard application
    Then I should see the application version "RustGuard v1.0.0" in the sidebar

  Scenario: Log viewer displays messages
    Given I open the RustGuard application
    When I navigate to the Scan section
    Then I should see "Registro en vivo"
    And the log viewer should display "Esperando eventos..."

  Scenario: Dashboard stats are visible
    Given I open the RustGuard application
    Then I should see "Firmas ClamAV"
    And I should see "Último Escaneo"

  Scenario: Titlebar window controls are present
    Given I open the RustGuard application
    Then I should see the application title "RUSTGUARD"
    And the window control buttons should be visible

  Scenario: Threat Modal handles ignoring threats
    # This is a unit-level behavioral scenario simulated through UI actions or mocking
    Given I open the RustGuard application
    When a threat is detected
    Then a threat modal should appear
    When I click on "Ignorar"
    Then the threat modal should disappear
