import itertools
ids = iter(f"{i:024X}" for i in itertools.count(0xA0000000000000000000001))
N = {k: next(ids) for k in "bApp bTest fApp fTest pApp pTest gMain gProd sApp sTest tApp tTest dep proxy proj cl0 cl1 cl2 c0d c0r c1d c1r c2d c2r".split()}
common = 'ALWAYS_SEARCH_USER_PATHS = NO; CLANG_ENABLE_MODULES = YES; IPHONEOS_DEPLOYMENT_TARGET = 18.0; SDKROOT = iphoneos; SWIFT_VERSION = 5.0; TARGETED_DEVICE_FAMILY = 1; CODE_SIGN_IDENTITY = "-"; CODE_SIGN_STYLE = Manual; DEVELOPMENT_TEAM = "";'
dbg = common + ' ONLY_ACTIVE_ARCH = YES; DEBUG_INFORMATION_FORMAT = dwarf; SWIFT_OPTIMIZATION_LEVEL = "-Onone";'
app_s = 'PRODUCT_BUNDLE_IDENTIFIER = fr.agence3terres.hote; PRODUCT_NAME = "$(TARGET_NAME)"; GENERATE_INFOPLIST_FILE = YES; INFOPLIST_KEY_UILaunchScreen_Generation = YES;'
test_s = 'PRODUCT_BUNDLE_IDENTIFIER = fr.agence3terres.hote.uitests; PRODUCT_NAME = "$(TARGET_NAME)"; GENERATE_INFOPLIST_FILE = YES; TEST_TARGET_NAME = Hote;'
def cfg(key, name, s): return N[key] + " = {isa = XCBuildConfiguration; buildSettings = { " + s + " }; name = " + name + "; };"
L = []
a = L.append
a(N["bApp"] + " = {isa = PBXBuildFile; fileRef = " + N["fApp"] + "; };")
a(N["bTest"] + " = {isa = PBXBuildFile; fileRef = " + N["fTest"] + "; };")
a(N["fApp"] + ' = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = App.swift; sourceTree = "<group>"; };')
a(N["fTest"] + ' = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SafariTests.swift; sourceTree = "<group>"; };')
a(N["pApp"] + " = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Hote.app; sourceTree = BUILT_PRODUCTS_DIR; };")
a(N["pTest"] + " = {isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = HoteUITests.xctest; sourceTree = BUILT_PRODUCTS_DIR; };")
a(N["gMain"] + " = {isa = PBXGroup; children = ( " + N["fApp"] + ", " + N["fTest"] + ", " + N["gProd"] + ', ); sourceTree = "<group>"; };')
a(N["gProd"] + " = {isa = PBXGroup; children = ( " + N["pApp"] + ", " + N["pTest"] + ', ); name = Products; sourceTree = "<group>"; };')
a(N["sApp"] + " = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ( " + N["bApp"] + ", ); runOnlyForDeploymentPostprocessing = 0; };")
a(N["sTest"] + " = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ( " + N["bTest"] + ", ); runOnlyForDeploymentPostprocessing = 0; };")
a(N["tApp"] + " = {isa = PBXNativeTarget; buildConfigurationList = " + N["cl1"] + "; buildPhases = ( " + N["sApp"] + ', ); buildRules = ( ); dependencies = ( ); name = Hote; productName = Hote; productReference = ' + N["pApp"] + '; productType = "com.apple.product-type.application"; };')
a(N["tTest"] + " = {isa = PBXNativeTarget; buildConfigurationList = " + N["cl2"] + "; buildPhases = ( " + N["sTest"] + ", ); buildRules = ( ); dependencies = ( " + N["dep"] + ', ); name = HoteUITests; productName = HoteUITests; productReference = ' + N["pTest"] + '; productType = "com.apple.product-type.bundle.ui-testing"; };')
a(N["dep"] + " = {isa = PBXTargetDependency; target = " + N["tApp"] + "; targetProxy = " + N["proxy"] + "; };")
a(N["proxy"] + " = {isa = PBXContainerItemProxy; containerPortal = " + N["proj"] + "; proxyType = 1; remoteGlobalIDString = " + N["tApp"] + "; remoteInfo = Hote; };")
a(N["proj"] + " = {isa = PBXProject; attributes = { LastUpgradeCheck = 1600; TargetAttributes = { " + N["tTest"] + " = { TestTargetID = " + N["tApp"] + "; }; }; }; buildConfigurationList = " + N["cl0"] + '; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = ( en, Base, ); mainGroup = ' + N["gMain"] + "; productRefGroup = " + N["gProd"] + '; projectDirPath = ""; projectRoot = ""; targets = ( ' + N["tApp"] + ", " + N["tTest"] + ", ); };")
a(cfg("c0d", "Debug", dbg)); a(cfg("c0r", "Release", common))
a(cfg("c1d", "Debug", app_s)); a(cfg("c1r", "Release", app_s))
a(cfg("c2d", "Debug", test_s)); a(cfg("c2r", "Release", test_s))
for cl, (d, r) in {"cl0": ("c0d", "c0r"), "cl1": ("c1d", "c1r"), "cl2": ("c2d", "c2r")}.items():
    a(N[cl] + " = {isa = XCConfigurationList; buildConfigurations = ( " + N[d] + ", " + N[r] + ", ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Debug; };")
out = "// !$*UTF8*$!\n{\n\tarchiveVersion = 1;\n\tclasses = {\n\t};\n\tobjectVersion = 56;\n\tobjects = {\n\t\t" + "\n\t\t".join(L) + "\n\t};\n\trootObject = " + N["proj"] + ";\n}\n"
open("Hote.xcodeproj/project.pbxproj", "w").write(out)
