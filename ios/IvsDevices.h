#import <Foundation/Foundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

/// On-demand device discovery and acquire/release holder for IVS camera and microphone.
/// Discovery is created lazily and torn down when all devices are released.
@interface IvsDevices : NSObject

+ (nullable IVSDeviceDiscovery *)discovery;

/// Acquires (or returns already-held) camera. May trigger permission prompts.
+ (nullable id<IVSCamera>)acquireCamera;

/// Acquires (or returns already-held) microphone. May trigger permission prompts.
+ (nullable id<IVSMicrophone>)acquireMicrophone;

/// Currently held camera, or nil if not acquired.
+ (nullable id<IVSCamera>)camera;

/// Currently held microphone, or nil if not acquired.
+ (nullable id<IVSMicrophone>)microphone;

/// Prepare only the requested devices (defaults to both when unspecified).
+ (BOOL)prepareDevicesWithCamera:(BOOL)camera microphone:(BOOL)microphone error:(NSError *_Nullable *_Nullable)error;

/// Releases held camera and microphone and tears down discovery when idle.
+ (void)releaseDevices;

@end

NS_ASSUME_NONNULL_END
