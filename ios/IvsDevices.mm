#import "IvsDevices.h"

static IVSDeviceDiscovery *_discovery = nil;
static id<IVSCamera> _camera = nil;
static id<IVSMicrophone> _microphone = nil;

@implementation IvsDevices

+ (nullable IVSDeviceDiscovery *)discovery
{
  if (_camera == nil && _microphone == nil) {
    return nil;
  }
  if (_discovery == nil) {
    _discovery = [[IVSDeviceDiscovery alloc] init];
  }
  return _discovery;
}

+ (IVSDeviceDiscovery *)ensureDiscovery
{
  if (_discovery == nil) {
    _discovery = [[IVSDeviceDiscovery alloc] init];
  }
  return _discovery;
}

+ (nullable id<IVSCamera>)acquireCamera
{
  if (_camera != nil) {
    return _camera;
  }
  for (id<IVSDevice> device in [[self ensureDiscovery] listLocalDevices]) {
    if ([device conformsToProtocol:@protocol(IVSCamera)]) {
      _camera = (id<IVSCamera>)device;
      break;
    }
  }
  return _camera;
}

+ (nullable id<IVSMicrophone>)acquireMicrophone
{
  if (_microphone != nil) {
    return _microphone;
  }
  for (id<IVSDevice> device in [[self ensureDiscovery] listLocalDevices]) {
    if ([device conformsToProtocol:@protocol(IVSMicrophone)]) {
      _microphone = (id<IVSMicrophone>)device;
      break;
    }
  }
  return _microphone;
}

+ (nullable id<IVSCamera>)camera
{
  return _camera;
}

+ (nullable id<IVSMicrophone>)microphone
{
  return _microphone;
}

+ (BOOL)prepareDevicesWithCamera:(BOOL)camera microphone:(BOOL)microphone error:(NSError *_Nullable *_Nullable)error
{
  if (camera) {
    if ([self acquireCamera] == nil) {
      if (error != nil) {
        *error = [NSError errorWithDomain:@"IvsDevices"
                                     code:1
                                 userInfo:@{NSLocalizedDescriptionKey : @"Camera unavailable."}];
      }
      return NO;
    }
  }
  if (microphone) {
    if ([self acquireMicrophone] == nil) {
      if (error != nil) {
        *error = [NSError errorWithDomain:@"IvsDevices"
                                     code:2
                                 userInfo:@{NSLocalizedDescriptionKey : @"Microphone unavailable."}];
      }
      return NO;
    }
  }
  return YES;
}

+ (void)releaseDevices
{
  _camera = nil;
  _microphone = nil;
  _discovery = nil;
}

@end
