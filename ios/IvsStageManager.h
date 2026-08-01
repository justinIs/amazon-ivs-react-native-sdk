#import <Foundation/Foundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^IvsStageEventHandler)(NSString *eventName, NSDictionary *body);

/// Owns IVSStage lifecycle, participant state, publish/subscribe strategy, and device streams.
@interface IvsStageManager : NSObject <IVSStageStrategy, IVSStageRenderer>

+ (instancetype)shared;

@property(nonatomic, copy, nullable) IvsStageEventHandler eventHandler;

- (void)joinWithToken:(NSString *)token
              options:(nullable NSDictionary *)options
              resolve:(void (^)(void))resolve
               reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)leaveWithResolve:(void (^)(void))resolve
                  reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)renewToken:(NSString *)token
           resolve:(void (^)(void))resolve
            reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (NSArray<NSDictionary *> *)listParticipants;
- (NSDictionary *)readState;

- (void)setPublishEnabled:(BOOL)enabled
                  resolve:(void (^)(void))resolve
                   reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setMicrophoneEnabled:(BOOL)enabled
                     resolve:(void (^)(void))resolve
                      reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setCameraEnabled:(BOOL)enabled
                 resolve:(void (^)(void))resolve
                  reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setCameraPosition:(NSString *)position
                  resolve:(void (^)(void))resolve
                   reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)flipCameraWithResolve:(void (^)(void))resolve
                      reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)prepareDevicesWithOptions:(nullable NSDictionary *)options
                          resolve:(void (^)(void))resolve
                           reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)releaseDevicesWithResolve:(void (^)(void))resolve
                           reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setVideoConfig:(NSDictionary *)config
               resolve:(void (^)(void))resolve
                reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setDefaultSubscribeType:(NSString *)type
                        resolve:(void (^)(void))resolve
                         reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

- (void)setSubscribeType:(NSString *)type
           participantId:(NSString *)participantId
                 resolve:(void (^)(void))resolve
                  reject:(void (^)(NSString *code, NSString *message, NSDictionary *_Nullable nativeError))reject;

@end

NS_ASSUME_NONNULL_END
