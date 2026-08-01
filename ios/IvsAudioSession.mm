#import "IvsAudioSession.h"
#import "IvsMapping.h"

#import <AVFoundation/AVFoundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

@implementation IvsAudioSession {
  BOOL _observingRouteChanges;
}

+ (instancetype)shared
{
  static IvsAudioSession *session;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    session = [[IvsAudioSession alloc] init];
  });
  return session;
}

- (instancetype)init
{
  if (self = [super init]) {
    _requestedOutput = @"auto";
    [self startObservingRouteChangesIfNeeded];
  }
  return self;
}

- (void)dealloc
{
  if (_observingRouteChanges) {
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:AVAudioSessionRouteChangeNotification
                                                  object:[AVAudioSession sharedInstance]];
  }
}

- (void)startObservingRouteChangesIfNeeded
{
  if (_observingRouteChanges) {
    return;
  }
  _observingRouteChanges = YES;
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRouteChange:)
                                               name:AVAudioSessionRouteChangeNotification
                                             object:[AVAudioSession sharedInstance]];
}

- (IVSStageAudioManagerUseCasePreset)presetFromString:(NSString *)preset
{
  if ([preset isEqualToString:@"subscribe-only"]) {
    return IVSStageAudioManagerUseCasePresetSubscribeOnly;
  }
  if ([preset isEqualToString:@"studio"]) {
    return IVSStageAudioManagerUseCasePresetStudio;
  }
  return IVSStageAudioManagerUseCasePresetVideoChat;
}

- (void)setAudioPreset:(NSString *)preset
               resolve:(void (^)(void))resolve
                reject:(void (^)(NSString *code, NSString *message))reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![preset isEqualToString:@"video-chat"] && ![preset isEqualToString:@"subscribe-only"] &&
        ![preset isEqualToString:@"studio"]) {
      reject(@"unknown", @"Invalid audio preset. Use video-chat, subscribe-only, or studio.");
      return;
    }

    [[IVSStageAudioManager sharedInstance] setPreset:[self presetFromString:preset]];
    resolve();
  });
}

- (void)applyOutputOverride
{
  AVAudioSession *session = [AVAudioSession sharedInstance];
  NSError *error = nil;

  if ([_requestedOutput isEqualToString:@"auto"]) {
    [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error];
    return;
  }

  if ([_requestedOutput isEqualToString:@"speaker"]) {
    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];
    return;
  }

  if ([_requestedOutput isEqualToString:@"earpiece"]) {
    [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error];
    return;
  }

  // bluetooth / wired — clear override and let the OS route to the connected device.
  [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error];
}

- (void)setAudioOutput:(NSString *)output
               resolve:(void (^)(void))resolve
                reject:(void (^)(NSString *code, NSString *message))reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![IvsMapping isValidAudioOutput:output]) {
      reject(@"unknown", @"Invalid audio output.");
      return;
    }

    self.requestedOutput = output;
    [self applyOutputOverride];
    [self emitRouteChange];
    resolve();
  });
}

- (NSString *)activeOutputFromRoute:(AVAudioSessionRouteDescription *)route
{
  for (AVAudioSessionPortDescription *output in route.outputs) {
    NSString *port = output.portType;
    if ([port isEqualToString:AVAudioSessionPortBluetoothA2DP] ||
        [port isEqualToString:AVAudioSessionPortBluetoothHFP] ||
        [port isEqualToString:AVAudioSessionPortBluetoothLE]) {
      return @"bluetooth";
    }
    if ([port isEqualToString:AVAudioSessionPortHeadphones] ||
        [port isEqualToString:AVAudioSessionPortUSBAudio] ||
        [port isEqualToString:AVAudioSessionPortCarAudio]) {
      return @"wired";
    }
    if ([port isEqualToString:AVAudioSessionPortBuiltInReceiver]) {
      return @"earpiece";
    }
  }
  return @"speaker";
}

- (NSArray<NSString *> *)availableOutputsFromRoute:(AVAudioSessionRouteDescription *)route
{
  NSMutableOrderedSet<NSString *> *outputs = [NSMutableOrderedSet orderedSetWithArray:@[ @"speaker", @"earpiece" ]];

  for (AVAudioSessionPortDescription *output in route.outputs) {
    NSString *port = output.portType;
    if ([port isEqualToString:AVAudioSessionPortBluetoothA2DP] ||
        [port isEqualToString:AVAudioSessionPortBluetoothHFP] ||
        [port isEqualToString:AVAudioSessionPortBluetoothLE]) {
      [outputs addObject:@"bluetooth"];
    }
    if ([port isEqualToString:AVAudioSessionPortHeadphones] ||
        [port isEqualToString:AVAudioSessionPortUSBAudio]) {
      [outputs addObject:@"wired"];
    }
  }

  for (AVAudioSessionPortDescription *input in route.inputs) {
    NSString *port = input.portType;
    if ([port isEqualToString:AVAudioSessionPortBluetoothHFP]) {
      [outputs addObject:@"bluetooth"];
    }
  }

  return outputs.array;
}

- (NSDictionary *)currentRoute
{
  AVAudioSession *session = [AVAudioSession sharedInstance];
  AVAudioSessionRouteDescription *route = session.currentRoute;
  return @{
    @"output" : self.requestedOutput ?: @"auto",
    @"activeOutput" : [self activeOutputFromRoute:route],
    @"availableOutputs" : [self availableOutputsFromRoute:route],
  };
}

- (void)emitRouteChange
{
  if (self.routeChangeHandler != nil) {
    self.routeChangeHandler([self currentRoute]);
  }
}

- (void)handleRouteChange:(NSNotification *)notification
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![_requestedOutput isEqualToString:@"auto"]) {
      [self applyOutputOverride];
    }
    [self emitRouteChange];
  });
}

@end
