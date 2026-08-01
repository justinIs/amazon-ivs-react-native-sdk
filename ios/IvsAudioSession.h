#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^IvsAudioRouteEventHandler)(NSDictionary *route);

/// IVS audio preset passthrough and AVAudioSession output routing.
/// When output is `auto`, IVSStageAudioManager retains control (no override).
@interface IvsAudioSession : NSObject

+ (instancetype)shared;

@property(nonatomic, copy) NSString *requestedOutput;
@property(nonatomic, copy, nullable) IvsAudioRouteEventHandler routeChangeHandler;

- (void)setAudioPreset:(NSString *)preset
               resolve:(void (^)(void))resolve
                reject:(void (^)(NSString *code, NSString *message))reject;

- (void)setAudioOutput:(NSString *)output
               resolve:(void (^)(void))resolve
                reject:(void (^)(NSString *code, NSString *message))reject;

- (NSDictionary *)currentRoute;

@end

NS_ASSUME_NONNULL_END
