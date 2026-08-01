#import <Foundation/Foundation.h>
#import <AmazonIVSBroadcast/AmazonIVSBroadcast.h>

NS_ASSUME_NONNULL_BEGIN

@interface IvsMapping : NSObject

#pragma mark - Enum → wire string

+ (NSString *)connectionStateToString:(IVSStageConnectionState)state;
+ (NSString *)publishStateToString:(IVSParticipantPublishState)state;
+ (NSString *)subscribeStateToString:(IVSParticipantSubscribeState)state;
+ (NSString *)subscribeTypeToString:(IVSStageSubscribeType)type;
+ (NSString *)deviceTypeToString:(IVSDeviceType)type;
+ (NSString *)devicePositionToString:(IVSDevicePosition)position;
+ (NSString *)cameraPositionToString:(IVSDevicePosition)position;
+ (NSString *)permissionStatusToString:(AVAuthorizationStatus)status;
+ (NSString *)mediaTypeForDeviceType:(IVSDeviceType)type;

+ (BOOL)isValidAudioOutput:(NSString *)output;

#pragma mark - Wire string → enum

+ (IVSStageSubscribeType)subscribeTypeFromString:(NSString *)type;
+ (BOOL)isValidSubscribeType:(NSString *)type;
+ (IVSDevicePosition)cameraPositionFromString:(NSString *)position;

#pragma mark - Dictionaries

+ (NSDictionary *)descriptorToDictionary:(IVSDeviceDescriptor *)descriptor;
+ (NSDictionary *)streamToDictionary:(IVSStageStream *)stream;

#pragma mark - Errors

+ (nullable NSDictionary *)nativeErrorDictionary:(NSError *_Nullable)error;
+ (NSString *)mapErrorCode:(NSError *_Nullable)error fallback:(NSString *_Nullable)fallback;

@end

NS_ASSUME_NONNULL_END
