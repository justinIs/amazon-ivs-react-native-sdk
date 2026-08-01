#import <Foundation/Foundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

@class IvsParticipantVideoView;

typedef void (^IvsStreamsChangedHandler)(NSString *participantId, NSArray<NSDictionary *> *streams);

/// participantId → renderer registry; pushes stream changes to views and JS.
@interface IvsParticipantStreams : NSObject

+ (instancetype)shared;

@property(nonatomic, copy, nullable) IvsStreamsChangedHandler streamsChangedHandler;
@property(nonatomic, copy, nullable) IVSStageStream *_Nullable (^streamLookup)(NSString *participantId);

- (void)registerView:(IvsParticipantVideoView *)view participantId:(NSString *)participantId;
- (void)deregisterView:(IvsParticipantVideoView *)view;

- (nullable IVSStageStream *)currentVideoStreamForParticipantId:(NSString *)participantId;

- (nullable IVSStageStream *)videoStreamForParticipantId:(NSString *)participantId
                                            fromStreams:(NSArray<IVSStageStream *> *)streams;

- (void)notifyStreamsChangedForParticipantId:(NSString *)participantId
                                     streams:(NSArray<IVSStageStream *> *)streams;

- (void)notifyAllViewsWithLookup:(IVSStageStream *_Nullable (^)(NSString *participantId))lookup;

@end

NS_ASSUME_NONNULL_END
