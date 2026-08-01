#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol IvsAppLifecycleDelegate <NSObject>
- (void)appLifecycleDidEnterBackground;
- (void)appLifecycleWillEnterForeground;
- (void)appLifecycleAudioInterruptionBegan;
- (void)appLifecycleAudioInterruptionEndedWithShouldResume:(BOOL)shouldResume;
@end

/// Observes UIApplication and AVAudioSession lifecycle events.
@interface IvsAppLifecycle : NSObject

+ (instancetype)shared;

@property(nonatomic, weak, nullable) id<IvsAppLifecycleDelegate> delegate;

- (void)notifyAudioInterruptionBegan;
- (void)notifyAudioInterruptionEndedWithShouldResume:(BOOL)shouldResume;

@end

NS_ASSUME_NONNULL_END
