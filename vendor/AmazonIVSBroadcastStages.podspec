# AWS stopped publishing the AmazonIVSBroadcast pod after 1.38.0 and now ships
# newer SDKs via Swift Package Manager / direct XCFramework download only.
# This podspec wraps the official 1.43.0 Real-Time (Stages) XCFramework so the
# latest SDK stays usable from a CocoaPods-based React Native project.
#
# The sha256 below matches the checksum AWS publishes in
# https://broadcast.live-video.net/1.43.0/Package.swift
Pod::Spec.new do |s|
  s.name         = "AmazonIVSBroadcastStages"
  s.version      = "1.43.0"
  s.summary      = "Amazon IVS Real-Time (Stages) Broadcast SDK for iOS"
  s.homepage     = "https://aws.amazon.com/ivs/"
  s.license      = { :type => "Custom", :text => "https://broadcast.live-video.net/LICENSE.txt" }
  s.authors      = "Amazon.com, Inc."

  s.platforms    = { :ios => "14.0" }
  s.source       = {
    :http => "https://broadcast.live-video.net/#{s.version}/AmazonIVSBroadcast-Stages.xcframework.zip",
    :type => "zip",
    :sha256 => "0b7961924971964c518640c561cc2d16751a1c728832a6571553896ceca207a0"
  }

  s.vendored_frameworks = "AmazonIVSBroadcast.xcframework"
end
