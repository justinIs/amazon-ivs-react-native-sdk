#import "IvsLocalPreviewView.h"
#import "IvsDevices.h"
#import "IvsPreviewHostView.h"

#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

#import <react/renderer/components/AmazonIvsRealTimeSpec/ComponentDescriptors.h>
#import <react/renderer/components/AmazonIvsRealTimeSpec/Props.h>
#import <react/renderer/components/AmazonIvsRealTimeSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation IvsLocalPreviewView {
  IvsPreviewHostView *_hostView;
  NSString *_source;
  NSString *_aspectMode;
  BOOL _mirror;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<IvsLocalPreviewViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const IvsLocalPreviewViewProps>();
    _props = defaultProps;
    _hostView = [[IvsPreviewHostView alloc] initWithFrame:self.bounds];
    _hostView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self addSubview:_hostView];
    _source = @"camera";
    _aspectMode = @"fill";
    _mirror = YES;
    _hostView.aspectMode = _aspectMode;
    _hostView.mirror = _mirror;
  }
  return self;
}

- (nullable id<IVSImageDevice>)imageDeviceForSource:(NSString *)source
{
  if ([source isEqualToString:@"camera"]) {
    id<IVSCamera> camera = [IvsDevices camera] ?: [IvsDevices acquireCamera];
    return camera;
  }

  if ([source isEqualToString:@"screen"]) {
    return nil;
  }

  IVSDeviceDiscovery *discovery = [IvsDevices discovery];
  if (discovery == nil) {
    discovery = [[IVSDeviceDiscovery alloc] init];
  }

  for (id<IVSDevice> device in [discovery listLocalDevices]) {
    if ([device conformsToProtocol:@protocol(IVSMultiSourceDevice)]) {
      id<IVSMultiSourceDevice> multiSource = (id<IVSMultiSourceDevice>)device;
      for (IVSDeviceDescriptor *descriptor in [multiSource listAvailableInputSources]) {
        if ([descriptor.urn isEqualToString:source]) {
          if ([device conformsToProtocol:@protocol(IVSCamera)]) {
            return (id<IVSImageDevice>)device;
          }
        }
      }
    }
    if ([[device descriptor].urn isEqualToString:source] &&
        [device conformsToProtocol:@protocol(IVSImageDevice)]) {
      return (id<IVSImageDevice>)device;
    }
  }

  return nil;
}

- (void)rebuildPreview
{
  id<IVSImageDevice> device = [self imageDeviceForSource:_source];
  if (device == nil) {
    [_hostView clearPreview];
    return;
  }

  if (_hostView.previewView != nil) {
    [_hostView applyMirror];
    return;
  }

  NSError *error = nil;
  IVSImagePreviewView *preview = [device previewViewWithAspectMode:[_hostView ivsAspectMode] error:&error];
  if (preview == nil) {
    NSLog(@"IvsLocalPreviewView: failed to create preview: %@", error);
    return;
  }

  [_hostView attachPreview:preview];
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window != nil) {
    [self rebuildPreview];
  }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newViewProps = *std::static_pointer_cast<IvsLocalPreviewViewProps const>(props);

  NSString *source = [NSString stringWithUTF8String:newViewProps.source.c_str()];
  NSString *aspectMode = [NSString stringWithUTF8String:toString(newViewProps.aspectMode).c_str()];
  BOOL mirror = newViewProps.mirror;

  BOOL sourceChanged = ![source isEqualToString:_source];
  BOOL aspectModeChanged = ![aspectMode isEqualToString:_aspectMode];
  BOOL mirrorChanged = mirror != _mirror;

  _source = source;
  _aspectMode = aspectMode;
  _mirror = mirror;
  _hostView.aspectMode = aspectMode;
  _hostView.mirror = mirror;

  if (self.window != nil) {
    if (sourceChanged || (_hostView.previewView == nil)) {
      [_hostView clearPreview];
      [self rebuildPreview];
    } else if (aspectModeChanged) {
      [_hostView clearPreview];
      [self rebuildPreview];
    } else if (mirrorChanged) {
      [_hostView applyMirror];
    }
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_hostView clearPreview];
  _source = @"camera";
}

@end

Class<RCTComponentViewProtocol> IvsLocalPreviewViewCls(void)
{
  return IvsLocalPreviewView.class;
}
