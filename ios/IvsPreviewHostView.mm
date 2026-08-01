#import "IvsPreviewHostView.h"

@implementation IvsPreviewHostView

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _aspectMode = @"fill";
    _mirror = YES;
  }
  return self;
}

- (IVSAspectMode)ivsAspectMode
{
  return [_aspectMode isEqualToString:@"fit"] ? IVSAspectModeFit : IVSAspectModeFill;
}

- (void)clearPreview
{
  [_previewView removeFromSuperview];
  _previewView = nil;
}

- (void)attachPreview:(IVSImagePreviewView *)preview
{
  [self clearPreview];
  _previewView = preview;
  preview.frame = self.bounds;
  preview.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  [self applyMirror];
  [self addSubview:preview];
}

- (void)applyMirror
{
  [_previewView setMirrored:_mirror];
}

- (void)layoutPreview
{
  _previewView.frame = self.bounds;
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  [self layoutPreview];
}

@end
