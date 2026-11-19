#!/bin/zsh
# scenario.sh <url> <scénario.txt> <sortie.mp4> — voir preparer.sh.
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
D=${0:a:h}
UDID=${UDID:-$(xcrun simctl list devices booted | grep -m1 "iPhone" | grep -oE "[0-9A-F-]{36}")}
xcrun simctl openurl $UDID "$1"; sleep 8
rm -f "$3"; xcrun simctl io $UDID recordVideo --codec h264 --force "$3" > /dev/null 2>&1 &
REC=$!
sleep 1.5
TEST_RUNNER_SCENARIO="${2:a}" xcodebuild test-without-building -project $D/Hote.xcodeproj -scheme Pilote -destination "id=$UDID" -derivedDataPath $D/build > $D/build/dernier-test.log 2>&1
grep -E "Test Case.*(passed|failed)" $D/build/dernier-test.log | tail -1
sleep 0.5
kill -INT $REC; wait $REC 2>/dev/null
