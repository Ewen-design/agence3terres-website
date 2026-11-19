import XCTest

/// Pilote le VRAI Safari du simulateur : gestes réels (défilement sur le
/// compositeur, barre d'outils, inertie). Le scénario est lu dans
/// /tmp/claude-ios-scenario.txt (une action par ligne) :
///   wait <s> | tap <x> <y> | swipe <x> <y1> <y2> <vitesse pt/s> | shot <nom>
/// coordonnées en fraction de la fenêtre.
final class SafariTests: XCTestCase {
  func testScenario() throws {
    let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
    safari.activate()
    let win = safari.windows.firstMatch
    let path = ProcessInfo.processInfo.environment["SCENARIO"] ?? "/tmp/claude-ios-scenario.txt"
    let text = (try? String(contentsOfFile: path, encoding: .utf8)) ?? ""
    func pt(_ x: Double, _ y: Double) -> XCUICoordinate { win.coordinate(withNormalizedOffset: CGVector(dx: x, dy: y)) }
    for line in text.split(separator: "\n") {
      let p = line.split(separator: " ").map(String.init)
      guard let cmd = p.first else { continue }
      switch cmd {
      case "wait": Thread.sleep(forTimeInterval: Double(p[1])!)
      case "tap": pt(Double(p[1])!, Double(p[2])!).tap()
      case "swipe":
        let x = Double(p[1])!, y1 = Double(p[2])!, y2 = Double(p[3])!, v = Double(p[4])!
        pt(x, y1).press(forDuration: 0.02, thenDragTo: pt(x, y2), withVelocity: XCUIGestureVelocity(v), thenHoldForDuration: 0)
      case "drag":
        // Doigt RETENU à la fin : aucun élan, la page défile de la distance exacte.
        let x = Double(p[1])!, y1 = Double(p[2])!, y2 = Double(p[3])!, v = Double(p[4])!
        pt(x, y1).press(forDuration: 0.05, thenDragTo: pt(x, y2), withVelocity: XCUIGestureVelocity(v), thenHoldForDuration: 0.25)
      case "shot":
        let a = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        a.name = p.count > 1 ? p[1] : "shot"; a.lifetime = .keepAlways; add(a)
      default: break
      }
    }
  }
}
