#import "IvsMapping.h"

#import <AVFoundation/AVFoundation.h>

@implementation IvsMapping

+ (NSString *)connectionStateToString:(IVSStageConnectionState)state
{
  switch (state) {
    case IVSStageConnectionStateConnecting:
      return @"connecting";
    case IVSStageConnectionStateConnected:
      return @"connected";
    default:
      return @"disconnected";
  }
}

+ (NSString *)publishStateToString:(IVSParticipantPublishState)state
{
  switch (state) {
    case IVSParticipantPublishStateAttemptingPublish:
      return @"attemptingPublish";
    case IVSParticipantPublishStatePublished:
      return @"published";
    default:
      return @"notPublished";
  }
}

+ (NSString *)subscribeStateToString:(IVSParticipantSubscribeState)state
{
  switch (state) {
    case IVSParticipantSubscribeStateAttemptingSubscribe:
      return @"attemptingSubscribe";
    case IVSParticipantSubscribeStateSubscribed:
      return @"subscribed";
    default:
      return @"notSubscribed";
  }
}

+ (NSString *)subscribeTypeToString:(IVSStageSubscribeType)type
{
  switch (type) {
    case IVSStageSubscribeTypeNone:
      return @"none";
    case IVSStageSubscribeTypeAudioOnly:
      return @"audio-only";
    default:
      return @"audio-video";
  }
}

+ (NSString *)deviceTypeToString:(IVSDeviceType)type
{
  switch (type) {
    case IVSDeviceTypeCamera:
      return @"camera";
    case IVSDeviceTypeMicrophone:
      return @"microphone";
    case IVSDeviceTypeUserImage:
      return @"userImage";
    case IVSDeviceTypeUserAudio:
      return @"userAudio";
    default:
      return @"unknown";
  }
}

+ (NSString *)devicePositionToString:(IVSDevicePosition)position
{
  switch (position) {
    case IVSDevicePositionFront:
      return @"front";
    case IVSDevicePositionBack:
      return @"back";
    case IVSDevicePositionUSB:
      return @"usb";
    case IVSDevicePositionBluetooth:
      return @"bluetooth";
    case IVSDevicePositionAUX:
      return @"aux";
    default:
      return @"unknown";
  }
}

+ (NSString *)cameraPositionToString:(IVSDevicePosition)position
{
  return position == IVSDevicePositionBack ? @"back" : @"front";
}

+ (NSString *)permissionStatusToString:(AVAuthorizationStatus)status
{
  switch (status) {
    case AVAuthorizationStatusAuthorized:
      return @"granted";
    case AVAuthorizationStatusDenied:
      return @"denied";
    case AVAuthorizationStatusRestricted:
      return @"restricted";
    default:
      return @"undetermined";
  }
}

+ (NSString *)mediaTypeForDeviceType:(IVSDeviceType)type
{
  switch (type) {
    case IVSDeviceTypeMicrophone:
    case IVSDeviceTypeUserAudio:
      return @"audio";
    default:
      return @"video";
  }
}

+ (BOOL)isValidAudioOutput:(NSString *)output
{
  static NSSet<NSString *> *valid;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    valid = [NSSet setWithArray:@[ @"auto", @"speaker", @"earpiece", @"bluetooth", @"wired" ]];
  });
  return [valid containsObject:output];
}

+ (IVSStageSubscribeType)subscribeTypeFromString:(NSString *)type
{
  if ([type isEqualToString:@"none"]) {
    return IVSStageSubscribeTypeNone;
  }
  if ([type isEqualToString:@"audio-only"]) {
    return IVSStageSubscribeTypeAudioOnly;
  }
  return IVSStageSubscribeTypeAudioVideo;
}

+ (BOOL)isValidSubscribeType:(NSString *)type
{
  return [type isEqualToString:@"none"] || [type isEqualToString:@"audio-only"] ||
         [type isEqualToString:@"audio-video"];
}

+ (IVSDevicePosition)cameraPositionFromString:(NSString *)position
{
  return [position isEqualToString:@"back"] ? IVSDevicePositionBack : IVSDevicePositionFront;
}

+ (NSDictionary *)descriptorToDictionary:(IVSDeviceDescriptor *)descriptor
{
  return @{
    @"deviceId" : descriptor.deviceId ?: @"",
    @"urn" : descriptor.urn ?: @"",
    @"friendlyName" : descriptor.friendlyName ?: @"",
    @"type" : [self deviceTypeToString:descriptor.type],
    @"position" : [self devicePositionToString:descriptor.position],
    @"isDefault" : @(descriptor.isDefault),
  };
}

+ (NSDictionary *)streamToDictionary:(IVSStageStream *)stream
{
  IVSDeviceType deviceType = stream.device.descriptor.type;
  return @{
    @"mediaType" : [self mediaTypeForDeviceType:deviceType],
    @"isMuted" : @(stream.isMuted),
    @"deviceType" : [self deviceTypeToString:deviceType],
    @"urn" : stream.device.descriptor.urn ?: @"",
  };
}

+ (nullable NSDictionary *)nativeErrorDictionary:(NSError *_Nullable)error
{
  if (error == nil) {
    return nil;
  }

  NSMutableDictionary *dict = [@{
    @"domain" : error.domain ?: @"",
    @"code" : @(error.code),
    @"message" : error.localizedDescription ?: @"",
  } mutableCopy];

  if (error.userInfo.count > 0) {
    NSMutableDictionary *safeUserInfo = [NSMutableDictionary dictionary];
    [error.userInfo enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
      if ([obj isKindOfClass:[NSString class]] || [obj isKindOfClass:[NSNumber class]]) {
        safeUserInfo[key] = obj;
      }
    }];
    if (safeUserInfo.count > 0) {
      dict[@"userInfo"] = safeUserInfo;
    }
  }
  return dict;
}

+ (NSError *)promiseRejectErrorWithCode:(NSString *)code
                                message:(NSString *)message
                            nativeError:(NSDictionary *_Nullable)nativeError
{
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  userInfo[NSLocalizedDescriptionKey] = message ?: @"";

  if (nativeError != nil) {
    if (nativeError[@"domain"] != nil) {
      userInfo[@"domain"] = nativeError[@"domain"];
    }
    if (nativeError[@"code"] != nil) {
      userInfo[@"code"] = nativeError[@"code"];
    }
    userInfo[@"message"] = nativeError[@"message"] ?: (message ?: @"");
    if (nativeError[@"userInfo"] != nil) {
      userInfo[@"userInfo"] = nativeError[@"userInfo"];
    }
    userInfo[@"nativeError"] = nativeError;
  } else {
    userInfo[@"domain"] = @"AmazonIvsRealTime";
    userInfo[@"code"] = @0;
    userInfo[@"message"] = message ?: @"";
  }

  NSString *domain = userInfo[@"domain"] ?: @"AmazonIvsRealTime";
  NSNumber *errorCodeNumber = userInfo[@"code"];
  NSInteger errorCode = errorCodeNumber != nil ? errorCodeNumber.integerValue : 0;

  return [NSError errorWithDomain:domain code:errorCode userInfo:userInfo];
}

+ (NSString *)mapErrorCode:(NSError *_Nullable)error fallback:(NSString *_Nullable)fallback
{
  if (error == nil) {
    return fallback ?: @"unknown";
  }

  NSInteger code = error.code;
  NSString *message = error.localizedDescription.lowercaseString ?: @"";

  if (code == IVSBroadcastErrorCodeRealTimeStageExpiredToken ||
      code == IVSBroadcastErrorCodeRealTimeAccountTokenExpired || [message containsString:@"expired"]) {
    return @"token-expired";
  }
  if (code == IVSBroadcastErrorCodeRealTimeStageInvalidToken ||
      code == IVSBroadcastErrorCodeRealTimeStageTokenRejected ||
      code == IVSBroadcastErrorCodeRealTimeStageAuthenticationError ||
      code == IVSBroadcastErrorCodeRealTimeTokenExchangeInvalidToken ||
      code == IVSBroadcastErrorCodeRealTimeAccountTokenInvalid ||
      [message containsString:@"invalid token"] || [message containsString:@"token is invalid"]) {
    return @"token-invalid";
  }
  if (code == IVSBroadcastErrorCodeRealTimeRemoteDisconnectReasonUnknown ||
      code == IVSBroadcastErrorCodeRealTimeRemoteDisconnectStageDeleted ||
      code == IVSBroadcastErrorCodeRealTimeRemoteDisconnectTokenReused ||
      code == IVSBroadcastErrorCodeRealTimeRemoteDisconnectParticipantDisconnected ||
      code == IVSBroadcastErrorCodeRealTimePeerConnectionNetworkError ||
      code == IVSBroadcastErrorCodeRealTimePeerConnectionUnexpectedRemoteClose ||
      code == IVSBroadcastErrorCodeRealTimeEventsRetriesExhausted) {
    return @"disconnected";
  }
  if ([message containsString:@"permission"] || [message containsString:@"denied"] ||
      [message containsString:@"not authorized"]) {
    return @"permission-denied";
  }
  if ([message containsString:@"camera"] || [message containsString:@"microphone"] ||
      [message containsString:@"device"] || [message containsString:@"unavailable"]) {
    return @"device-unavailable";
  }
  if ([fallback isEqualToString:@"join-failed"] ||
      code == IVSBroadcastErrorCodeRealTimeStageNotReady ||
      code == IVSBroadcastErrorCodeRealTimeAlreadyJoiningStage ||
      code == IVSBroadcastErrorCodeRealTimeStageAtCapacity) {
    return @"join-failed";
  }
  return fallback ?: @"unknown";
}

@end
