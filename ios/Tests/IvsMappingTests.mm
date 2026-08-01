#import <XCTest/XCTest.h>
#import <AVFoundation/AVFoundation.h>

#import "IvsMapping.h"

#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

@interface IvsMappingTests : XCTestCase
@end

@implementation IvsMappingTests

- (void)testConnectionStateToString
{
  XCTAssertEqualObjects([IvsMapping connectionStateToString:IVSStageConnectionStateDisconnected], @"disconnected");
  XCTAssertEqualObjects([IvsMapping connectionStateToString:IVSStageConnectionStateConnecting], @"connecting");
  XCTAssertEqualObjects([IvsMapping connectionStateToString:IVSStageConnectionStateConnected], @"connected");
}

- (void)testPublishStateToString
{
  XCTAssertEqualObjects([IvsMapping publishStateToString:IVSParticipantPublishStateNotPublished], @"notPublished");
  XCTAssertEqualObjects([IvsMapping publishStateToString:IVSParticipantPublishStateAttemptingPublish],
                        @"attemptingPublish");
  XCTAssertEqualObjects([IvsMapping publishStateToString:IVSParticipantPublishStatePublished], @"published");
}

- (void)testSubscribeStateToString
{
  XCTAssertEqualObjects([IvsMapping subscribeStateToString:IVSParticipantSubscribeStateNotSubscribed], @"notSubscribed");
  XCTAssertEqualObjects([IvsMapping subscribeStateToString:IVSParticipantSubscribeStateAttemptingSubscribe],
                        @"attemptingSubscribe");
  XCTAssertEqualObjects([IvsMapping subscribeStateToString:IVSParticipantSubscribeStateSubscribed], @"subscribed");
}

- (void)testSubscribeTypeRoundTrip
{
  XCTAssertEqualObjects([IvsMapping subscribeTypeToString:IVSStageSubscribeTypeNone], @"none");
  XCTAssertEqualObjects([IvsMapping subscribeTypeToString:IVSStageSubscribeTypeAudioOnly], @"audio-only");
  XCTAssertEqualObjects([IvsMapping subscribeTypeToString:IVSStageSubscribeTypeAudioVideo], @"audio-video");

  XCTAssertTrue([IvsMapping isValidSubscribeType:@"none"]);
  XCTAssertTrue([IvsMapping isValidSubscribeType:@"audio-only"]);
  XCTAssertTrue([IvsMapping isValidSubscribeType:@"audio-video"]);
  XCTAssertFalse([IvsMapping isValidSubscribeType:@"audio_video"]);

  XCTAssertEqual([IvsMapping subscribeTypeFromString:@"none"], IVSStageSubscribeTypeNone);
  XCTAssertEqual([IvsMapping subscribeTypeFromString:@"audio-only"], IVSStageSubscribeTypeAudioOnly);
  XCTAssertEqual([IvsMapping subscribeTypeFromString:@"audio-video"], IVSStageSubscribeTypeAudioVideo);
}

- (void)testPermissionStatusToString
{
  XCTAssertEqualObjects([IvsMapping permissionStatusToString:AVAuthorizationStatusAuthorized], @"granted");
  XCTAssertEqualObjects([IvsMapping permissionStatusToString:AVAuthorizationStatusDenied], @"denied");
  XCTAssertEqualObjects([IvsMapping permissionStatusToString:AVAuthorizationStatusRestricted], @"restricted");
  XCTAssertEqualObjects([IvsMapping permissionStatusToString:AVAuthorizationStatusNotDetermined], @"undetermined");
}

- (void)testMediaTypeForDeviceType
{
  XCTAssertEqualObjects([IvsMapping mediaTypeForDeviceType:IVSDeviceTypeMicrophone], @"audio");
  XCTAssertEqualObjects([IvsMapping mediaTypeForDeviceType:IVSDeviceTypeUserAudio], @"audio");
  XCTAssertEqualObjects([IvsMapping mediaTypeForDeviceType:IVSDeviceTypeCamera], @"video");
  XCTAssertEqualObjects([IvsMapping mediaTypeForDeviceType:IVSDeviceTypeUserImage], @"video");
}

- (void)testDeviceTypeToString
{
  XCTAssertEqualObjects([IvsMapping deviceTypeToString:IVSDeviceTypeCamera], @"camera");
  XCTAssertEqualObjects([IvsMapping deviceTypeToString:IVSDeviceTypeMicrophone], @"microphone");
  XCTAssertEqualObjects([IvsMapping deviceTypeToString:IVSDeviceTypeUserImage], @"userImage");
  XCTAssertEqualObjects([IvsMapping deviceTypeToString:IVSDeviceTypeUserAudio], @"userAudio");
}

- (void)testCameraPositionMapping
{
  XCTAssertEqualObjects([IvsMapping cameraPositionToString:IVSDevicePositionFront], @"front");
  XCTAssertEqualObjects([IvsMapping cameraPositionToString:IVSDevicePositionBack], @"back");
  XCTAssertEqual([IvsMapping cameraPositionFromString:@"back"], IVSDevicePositionBack);
  XCTAssertEqual([IvsMapping cameraPositionFromString:@"front"], IVSDevicePositionFront);
}

- (void)testMapErrorCodeTokenExpired
{
  NSError *error = [NSError errorWithDomain:IVSBroadcastErrorDomain
                                       code:IVSBroadcastErrorCodeRealTimeStageExpiredToken
                                   userInfo:nil];
  XCTAssertEqualObjects([IvsMapping mapErrorCode:error fallback:@"unknown"], @"token-expired");
}

- (void)testMapErrorCodeTokenInvalid
{
  NSError *error = [NSError errorWithDomain:IVSBroadcastErrorDomain
                                       code:IVSBroadcastErrorCodeRealTimeStageInvalidToken
                                   userInfo:nil];
  XCTAssertEqualObjects([IvsMapping mapErrorCode:error fallback:@"unknown"], @"token-invalid");
}

- (void)testIsValidAudioOutput
{
  XCTAssertTrue([IvsMapping isValidAudioOutput:@"auto"]);
  XCTAssertTrue([IvsMapping isValidAudioOutput:@"speaker"]);
  XCTAssertTrue([IvsMapping isValidAudioOutput:@"earpiece"]);
  XCTAssertTrue([IvsMapping isValidAudioOutput:@"bluetooth"]);
  XCTAssertTrue([IvsMapping isValidAudioOutput:@"wired"]);
  XCTAssertFalse([IvsMapping isValidAudioOutput:@"hdmi"]);
}

@end
