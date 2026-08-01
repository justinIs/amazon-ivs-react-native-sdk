#import "AmazonIvsRealTime.h"
#import "IvsAppLifecycle.h"
#import "IvsAudioSession.h"
#import "IvsDevices.h"
#import "IvsMapping.h"
#import "IvsParticipantStreams.h"
#import "IvsStageManager.h"

#import <AVFoundation/AVFoundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

static void IvsRejectPromise(RCTPromiseRejectBlock reject,
                             NSString *code,
                             NSString *message,
                             NSDictionary *_Nullable nativeError)
{
  reject(code, message, [IvsMapping promiseRejectErrorWithCode:code message:message nativeError:nativeError]);
}

@implementation AmazonIvsRealTime {
  BOOL _eventsConfigured;
}

- (instancetype)init
{
  if (self = [super init]) {
    [self configureEventsIfNeeded];
    (void)[IvsAudioSession shared];
    (void)[IvsAppLifecycle shared];
  }
  return self;
}

- (void)configureEventsIfNeeded
{
  if (_eventsConfigured) {
    return;
  }
  _eventsConfigured = YES;

  __weak __typeof(self) weakSelf = self;

  [IvsStageManager shared].eventHandler = ^(NSString *eventName, NSDictionary *body) {
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong __typeof(weakSelf) strongSelf = weakSelf;
      if (strongSelf == nil) {
        return;
      }
      if ([eventName isEqualToString:@"onStageConnectionStateChanged"]) {
        [strongSelf emitOnStageConnectionStateChanged:body];
      } else if ([eventName isEqualToString:@"onParticipantJoined"]) {
        [strongSelf emitOnParticipantJoined:body];
      } else if ([eventName isEqualToString:@"onParticipantLeft"]) {
        [strongSelf emitOnParticipantLeft:body];
      } else if ([eventName isEqualToString:@"onParticipantUpdated"]) {
        [strongSelf emitOnParticipantUpdated:body];
      } else if ([eventName isEqualToString:@"onStageError"]) {
        [strongSelf emitOnStageError:body];
      }
    });
  };

  [IvsParticipantStreams shared].streamsChangedHandler =
      ^(NSString *participantId, NSArray<NSDictionary *> *streams) {
        dispatch_async(dispatch_get_main_queue(), ^{
          __strong __typeof(weakSelf) strongSelf = weakSelf;
          if (strongSelf == nil) {
            return;
          }
          [strongSelf emitOnParticipantStreamsChanged:@{
            @"participantId" : participantId ?: @"",
            @"streams" : streams ?: @[],
          }];
        });
      };

  [IvsAudioSession shared].routeChangeHandler = ^(NSDictionary *route) {
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong __typeof(weakSelf) strongSelf = weakSelf;
      if (strongSelf == nil) {
        return;
      }
      [strongSelf emitOnAudioRouteChanged:route];
    });
  };
}

#pragma mark - Environment

- (void)getSdkVersion:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve(IVSSession.sdkVersion);
}

- (void)getCapabilities:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve(@{
    @"screenShare" : @NO,
    @"backgroundAudio" : @YES,
    @"bluetoothMicrophone" : @YES,
    @"audioRouting" : @YES,
    @"rtcStats" : @NO,
    @"simulcast" : @NO,
  });
}

- (void)enumerateDevices:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    IVSDeviceDiscovery *discovery = [[IVSDeviceDiscovery alloc] init];
    NSMutableArray *result = [NSMutableArray array];

    for (id<IVSDevice> device in [discovery listLocalDevices]) {
      if ([device conformsToProtocol:@protocol(IVSMultiSourceDevice)]) {
        id<IVSMultiSourceDevice> multiSource = (id<IVSMultiSourceDevice>)device;
        for (IVSDeviceDescriptor *source in [multiSource listAvailableInputSources]) {
          [result addObject:[IvsMapping descriptorToDictionary:source]];
        }
      } else {
        [result addObject:[IvsMapping descriptorToDictionary:[device descriptor]]];
      }
    }

    resolve(result);
  });
}

- (void)getCameraPermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve([IvsMapping permissionStatusToString:[AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo]]);
}

- (void)getMicrophonePermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve([IvsMapping permissionStatusToString:[AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio]]);
}

- (void)requestPermissionForMediaType:(AVMediaType)mediaType resolve:(RCTPromiseResolveBlock)resolve
{
  AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:mediaType];
  if (status == AVAuthorizationStatusNotDetermined) {
    [AVCaptureDevice requestAccessForMediaType:mediaType
                             completionHandler:^(BOOL granted) {
                               resolve(granted ? @"granted" : @"denied");
                             }];
  } else {
    resolve([IvsMapping permissionStatusToString:status]);
  }
}

- (void)requestCameraPermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [self requestPermissionForMediaType:AVMediaTypeVideo resolve:resolve];
}

- (void)requestMicrophonePermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [self requestPermissionForMediaType:AVMediaTypeAudio resolve:resolve];
}

#pragma mark - Stage lifecycle

- (void)joinStage:(NSString *)token
          options:(JS::NativeAmazonIvsRealTime::JoinStageOptions &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  [self configureEventsIfNeeded];
  NSMutableDictionary *opts = [NSMutableDictionary dictionary];
  auto publish = options.publish();
  if (publish.has_value()) {
    opts[@"publish"] = @(publish.value());
  }
  [[IvsStageManager shared] joinWithToken:token
                                  options:opts
                                  resolve:^{
                                    resolve(nil);
                                  }
                                   reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                     IvsRejectPromise(reject, code, message, nativeError);
                                   }];
}

- (void)leaveStage:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] leaveWithResolve:^{
    resolve(nil);
  }
                                       reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                         IvsRejectPromise(reject, code, message, nativeError);
                                       }];
}

- (void)renewToken:(NSString *)token resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [self configureEventsIfNeeded];
  [[IvsStageManager shared] renewToken:token
                               resolve:^{
                                 resolve(nil);
                               }
                                reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                  IvsRejectPromise(reject, code, message, nativeError);
                                }];
}

- (void)listParticipants:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve([[IvsStageManager shared] listParticipants]);
}

- (void)readState:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve([[IvsStageManager shared] readState]);
}

#pragma mark - Publish + local media

- (void)setPublishEnabled:(BOOL)enabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setPublishEnabled:enabled
                                      resolve:^{
                                        resolve(nil);
                                      }
                                       reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                         IvsRejectPromise(reject, code, message, nativeError);
                                       }];
}

- (void)setMicrophoneEnabled:(BOOL)enabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setMicrophoneEnabled:enabled
                                         resolve:^{
                                           resolve(nil);
                                         }
                                          reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                            IvsRejectPromise(reject, code, message, nativeError);
                                          }];
}

- (void)setCameraEnabled:(BOOL)enabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setCameraEnabled:enabled
                                     resolve:^{
                                       resolve(nil);
                                     }
                                      reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                        IvsRejectPromise(reject, code, message, nativeError);
                                      }];
}

- (void)setCameraPosition:(NSString *)position
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setCameraPosition:position
                                      resolve:^{
                                        resolve(nil);
                                      }
                                       reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                         IvsRejectPromise(reject, code, message, nativeError);
                                       }];
}

- (void)flipCamera:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] flipCameraWithResolve:^{
    resolve(nil);
  }
                                           reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                             IvsRejectPromise(reject, code, message, nativeError);
                                           }];
}

- (void)prepareDevices:(JS::NativeAmazonIvsRealTime::PrepareDevicesOptions &)options
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  NSMutableDictionary *opts = [NSMutableDictionary dictionary];
  auto camera = options.camera();
  auto microphone = options.microphone();
  if (camera.has_value()) {
    opts[@"camera"] = @(camera.value());
  }
  if (microphone.has_value()) {
    opts[@"microphone"] = @(microphone.value());
  }
  [[IvsStageManager shared] prepareDevicesWithOptions:opts
                                              resolve:^{
                                                resolve(nil);
                                              }
                                               reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                                 IvsRejectPromise(reject, code, message, nativeError);
                                               }];
}

- (void)releaseDevices:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] releaseDevicesWithResolve:^{
    resolve(nil);
  }
                                               reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                                 IvsRejectPromise(reject, code, message, nativeError);
                                               }];
}

#pragma mark - Media configuration

- (void)setVideoConfig:(JS::NativeAmazonIvsRealTime::VideoConfigOptions &)config
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  auto width = config.width();
  auto height = config.height();
  auto targetFramerate = config.targetFramerate();
  auto minBitrate = config.minBitrate();
  auto maxBitrate = config.maxBitrate();
  if (width.has_value()) {
    dict[@"width"] = @(width.value());
  }
  if (height.has_value()) {
    dict[@"height"] = @(height.value());
  }
  if (targetFramerate.has_value()) {
    dict[@"targetFramerate"] = @(targetFramerate.value());
  }
  if (minBitrate.has_value()) {
    dict[@"minBitrate"] = @(minBitrate.value());
  }
  if (maxBitrate.has_value()) {
    dict[@"maxBitrate"] = @(maxBitrate.value());
  }
  [[IvsStageManager shared] setVideoConfig:dict
                                   resolve:^{
                                     resolve(nil);
                                   }
                                    reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                      IvsRejectPromise(reject, code, message, nativeError);
                                    }];
}

- (void)setDefaultSubscribeType:(NSString *)type
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setDefaultSubscribeType:type
                                            resolve:^{
                                              resolve(nil);
                                            }
                                             reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                               IvsRejectPromise(reject, code, message, nativeError);
                                             }];
}

- (void)setSubscribeType:(NSString *)participantId
                    type:(NSString *)type
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  [[IvsStageManager shared] setSubscribeType:type
                               participantId:participantId
                                     resolve:^{
                                       resolve(nil);
                                     }
                                      reject:^(NSString *code, NSString *message, NSDictionary *nativeError) {
                                        IvsRejectPromise(reject, code, message, nativeError);
                                      }];
}

#pragma mark - Audio session

- (void)setAudioPreset:(NSString *)preset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsAudioSession shared] setAudioPreset:preset
                                   resolve:^{
                                     resolve(nil);
                                   }
                                    reject:^(NSString *code, NSString *message) {
                                      IvsRejectPromise(reject, code, message, nil);
                                    }];
}

- (void)setAudioOutput:(NSString *)output resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [[IvsAudioSession shared] setAudioOutput:output
                                   resolve:^{
                                     resolve(nil);
                                   }
                                    reject:^(NSString *code, NSString *message) {
                                      IvsRejectPromise(reject, code, message, nil);
                                    }];
}

- (void)getAudioRoute:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [self configureEventsIfNeeded];
  resolve([[IvsAudioSession shared] currentRoute]);
}

#pragma mark - TurboModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  [self configureEventsIfNeeded];
  return std::make_shared<facebook::react::NativeAmazonIvsRealTimeSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"AmazonIvsRealTime";
}

@end
