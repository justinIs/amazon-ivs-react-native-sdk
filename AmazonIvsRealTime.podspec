require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "AmazonIvsRealTime"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/WebRTCventures/amazon-ivs-react-native-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.exclude_files = "ios/Tests/**"
  s.private_header_files = "ios/**/*.h"

  s.frameworks = "AVFoundation", "AVKit"

  # New Architecture is required. Between RN 0.76 and 0.81 the old architecture
  # is still selectable; fail early with a clear message rather than an opaque
  # codegen error later.
  unless ENV['RCT_NEW_ARCH_ENABLED'] == '1'
    raise "amazon-ivs-react-native-sdk requires the New Architecture. Set RCT_NEW_ARCH_ENABLED=1 (or newArchEnabled=true in the app) and re-run pod install."
  end

  # Latest Real-Time (Stages) IVS SDK, wrapped by vendor/AmazonIVSBroadcastStages.podspec
  # because AWS no longer publishes versions newer than 1.38.0 to the CocoaPods
  # registry. Consumers must add to their Podfile:
  #   pod 'AmazonIVSBroadcastStages',
  #       :podspec => '../node_modules/amazon-ivs-react-native-sdk/vendor/AmazonIVSBroadcastStages.podspec'
  s.dependency "AmazonIVSBroadcastStages", "1.43.0"

  install_modules_dependencies(s)
end
