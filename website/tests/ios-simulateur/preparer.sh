#!/bin/zsh
# ───────────────────────────────────────────────────────────────────────────
#  Banc d'essai iPhone (2026-11-19) : le VRAI Safari du simulateur iOS, piloté
#  par XCUITest (gestes réels : défilement sur le compositeur, barre d'outils,
#  inertie) — ce que Playwright ne sait pas faire (voir la mémoire du projet,
#  « verif-playwright »). safaridriver n'y trouve aucune session : XCUITest
#  pilote Safari depuis une app hôte vide.
#
#    ./preparer.sh                       # génère le projet Xcode et le compile
#    ./scenario.sh <url> <scénario.txt> <sortie.mp4>
#    python3 tremble.py <sortie.mp4> 150 500    # allers-retours (tremblement)
#    python3 saccade.py <sortie.mp4> 600 1100   # arrêts du défilement
#
#  Scénario : une action par ligne — `wait s`, `tap x y`, `swipe x y1 y2 v`
#  (coordonnées en fraction de la fenêtre, vitesse en pt/s), `shot nom`.
#  L'aperçu doit tourner (npm run preview / vite preview --port 4173).
#  ⚠️ Le simulateur charge fortement le Mac : ne pas mesurer de temps (batteries
#  Playwright) pendant qu'il tourne, et l'éteindre après (xcrun simctl shutdown all).
# ───────────────────────────────────────────────────────────────────────────
set -e
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
cd ${0:a:h}
UDID=${UDID:-$(xcrun simctl list devices available | grep -m1 "iPhone" | grep -oE "[0-9A-F-]{36}")}
mkdir -p Hote.xcodeproj/xcshareddata/xcschemes
python3 gen.py
TT=$(python3 -c "print(f'{0xA0000000000000000000001+11:024X}')")
TA=$(python3 -c "print(f'{0xA0000000000000000000001+10:024X}')")
cat > Hote.xcodeproj/xcshareddata/xcschemes/Pilote.xcscheme <<XML
<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1600" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "NO" buildForArchiving = "NO" buildForAnalyzing = "NO">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "$TA" BuildableName = "Hote.app" BlueprintName = "Hote" ReferencedContainer = "container:Hote.xcodeproj"></BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
         <TestableReference skipped = "NO">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "$TT" BuildableName = "HoteUITests.xctest" BlueprintName = "HoteUITests" ReferencedContainer = "container:Hote.xcodeproj"></BuildableReference>
         </TestableReference>
      </Testables>
   </TestAction>
</Scheme>
XML
xcrun simctl boot $UDID 2>/dev/null || true
xcrun simctl bootstatus $UDID -b > /dev/null
xcodebuild -project Hote.xcodeproj -scheme Pilote -destination "id=$UDID" -derivedDataPath build build-for-testing CODE_SIGN_IDENTITY=- CODE_SIGNING_REQUIRED=NO | tail -1
echo "UDID=$UDID"
