#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

@interface IvsParticipantVideoView : RCTViewComponentView

@property(nonatomic, copy, readonly, nullable) NSString *participantId;

- (void)attachVideoStream:(nullable IVSStageStream *)stream;

@end

NS_ASSUME_NONNULL_END
