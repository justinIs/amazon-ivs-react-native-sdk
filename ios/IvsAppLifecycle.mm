#import "IvsAppLifecycle.h"

#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>

@implementation IvsAppLifecycle

+ (instancetype)shared
{
  static IvsAppLifecycle *lifecycle;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    lifecycle = [[IvsAppLifecycle alloc] init];
  });
  return lifecycle;
}

- (instancetype)init
{
  if (self = [super init]) {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:self
               selector:@selector(appDidEnterBackground)
                   name:UIApplicationDidEnterBackgroundNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(appWillEnterForeground)
                   name:UIApplicationWillEnterForegroundNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(handleAudioInterruption:)
                   name:AVAudioSessionInterruptionNotification
                 object:[AVAudioSession sharedInstance]];
  }
  return self;
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)appDidEnterBackground
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.delegate appLifecycleDidEnterBackground];
  });
}

- (void)appWillEnterForeground
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.delegate appLifecycleWillEnterForeground];
  });
}

- (void)handleAudioInterruption:(NSNotification *)notification
{
  NSNumber *typeValue = notification.userInfo[AVAudioSessionInterruptionTypeKey];
  if (typeValue == nil) {
    return;
  }

  AVAudioSessionInterruptionType type =
      (AVAudioSessionInterruptionType)typeValue.unsignedIntegerValue;
  dispatch_async(dispatch_get_main_queue(), ^{
    if (type == AVAudioSessionInterruptionTypeBegan) {
      [self.delegate appLifecycleAudioInterruptionBegan];
    } else if (type == AVAudioSessionInterruptionTypeEnded) {
      [self.delegate appLifecycleAudioInterruptionEnded];
    }
  });
}

@end
