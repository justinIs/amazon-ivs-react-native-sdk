#import "IvsParticipantStreams.h"
#import "IvsMapping.h"
#import "IvsParticipantVideoView.h"

@implementation IvsParticipantStreams {
  NSHashTable<IvsParticipantVideoView *> *_registeredViews;
}

+ (instancetype)shared
{
  static IvsParticipantStreams *registry;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    registry = [[IvsParticipantStreams alloc] init];
  });
  return registry;
}

- (instancetype)init
{
  if (self = [super init]) {
    _registeredViews = [NSHashTable weakObjectsHashTable];
  }
  return self;
}

- (void)registerView:(IvsParticipantVideoView *)view participantId:(NSString *)participantId
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_registeredViews addObject:view];
    IVSStageStream *stream = self.streamLookup != nil ? self.streamLookup(participantId) : nil;
    [view attachVideoStream:stream];
  });
}

- (void)deregisterView:(IvsParticipantVideoView *)view
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_registeredViews removeObject:view];
  });
}

- (nullable IVSStageStream *)currentVideoStreamForParticipantId:(NSString *)participantId
{
  if (self.streamLookup == nil) {
    return nil;
  }
  return self.streamLookup(participantId);
}

- (nullable IVSStageStream *)videoStreamForParticipantId:(NSString *)participantId
                                            fromStreams:(NSArray<IVSStageStream *> *)streams
{
  for (IVSStageStream *stream in streams) {
    IVSDeviceType type = stream.device.descriptor.type;
    if (type == IVSDeviceTypeCamera || type == IVSDeviceTypeUserImage) {
      return stream;
    }
  }
  return nil;
}

- (void)notifyStreamsChangedForParticipantId:(NSString *)participantId
                                     streams:(NSArray<IVSStageStream *> *)streams
{
  IVSStageStream *videoStream = [self videoStreamForParticipantId:participantId fromStreams:streams];

  for (IvsParticipantVideoView *view in self->_registeredViews.allObjects) {
    if ([view.participantId isEqualToString:participantId]) {
      [view attachVideoStream:videoStream];
    }
  }

  if (self.streamsChangedHandler != nil) {
    NSMutableArray *payload = [NSMutableArray arrayWithCapacity:streams.count];
    for (IVSStageStream *stream in streams) {
      [payload addObject:[IvsMapping streamToDictionary:stream]];
    }
    self.streamsChangedHandler(participantId, payload);
  }
}

- (void)notifyAllViewsWithLookup:(IVSStageStream *_Nullable (^)(NSString *participantId))lookup
{
  if (lookup == nil) {
    return;
  }
  for (IvsParticipantVideoView *view in self->_registeredViews.allObjects) {
    IVSStageStream *stream = lookup(view.participantId);
    [view attachVideoStream:stream];
  }
}

@end
