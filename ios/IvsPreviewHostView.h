#import <UIKit/UIKit.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

/// Shared preview host: mirror, aspectMode, and layout for IVSImagePreviewView.
@interface IvsPreviewHostView : UIView

@property(nonatomic, copy) NSString *aspectMode;
@property(nonatomic, assign) BOOL mirror;
@property(nonatomic, strong, nullable) IVSImagePreviewView *previewView;

- (IVSAspectMode)ivsAspectMode;
- (void)clearPreview;
- (void)attachPreview:(IVSImagePreviewView *)preview;
- (void)applyMirror;
- (void)layoutPreview;

@end

NS_ASSUME_NONNULL_END
