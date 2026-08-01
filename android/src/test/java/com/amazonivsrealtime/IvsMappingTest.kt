package com.amazonivsrealtime

import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.Stage
import com.amazonaws.ivs.broadcast.StageStream
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class IvsMappingTest {
  @Test
  fun connectionStateStringifier() {
    assertEquals("connecting", IvsMapping.connectionStateToString(Stage.ConnectionState.CONNECTING))
    assertEquals("connected", IvsMapping.connectionStateToString(Stage.ConnectionState.CONNECTED))
    assertEquals("disconnected", IvsMapping.connectionStateToString(Stage.ConnectionState.DISCONNECTED))
  }

  @Test
  fun publishStateStringifier() {
    assertEquals("attemptingPublish", IvsMapping.publishStateToString(Stage.PublishState.ATTEMPTING_PUBLISH))
    assertEquals("published", IvsMapping.publishStateToString(Stage.PublishState.PUBLISHED))
    assertEquals("notPublished", IvsMapping.publishStateToString(Stage.PublishState.NOT_PUBLISHED))
  }

  @Test
  fun subscribeStateStringifier() {
    assertEquals("attemptingSubscribe", IvsMapping.subscribeStateToString(Stage.SubscribeState.ATTEMPTING_SUBSCRIBE))
    assertEquals("subscribed", IvsMapping.subscribeStateToString(Stage.SubscribeState.SUBSCRIBED))
    assertEquals("notSubscribed", IvsMapping.subscribeStateToString(Stage.SubscribeState.NOT_SUBSCRIBED))
  }

  @Test
  fun subscribeTypeRoundTrip() {
    assertEquals("none", IvsMapping.subscribeTypeToString(Stage.SubscribeType.NONE))
    assertEquals("audio-only", IvsMapping.subscribeTypeToString(Stage.SubscribeType.AUDIO_ONLY))
    assertEquals("audio-video", IvsMapping.subscribeTypeToString(Stage.SubscribeType.AUDIO_VIDEO))
    assertEquals(Stage.SubscribeType.NONE, IvsMapping.subscribeTypeFromString("none"))
    assertEquals(Stage.SubscribeType.AUDIO_ONLY, IvsMapping.subscribeTypeFromString("audio-only"))
    assertEquals(Stage.SubscribeType.AUDIO_VIDEO, IvsMapping.subscribeTypeFromString("audio-video"))
  }

  @Test
  fun deviceTypeStringifier() {
    assertEquals("camera", IvsMapping.deviceTypeToString(Device.Descriptor.DeviceType.CAMERA))
    assertEquals("microphone", IvsMapping.deviceTypeToString(Device.Descriptor.DeviceType.MICROPHONE))
    assertEquals("unknown", IvsMapping.deviceTypeToString(Device.Descriptor.DeviceType.UNKNOWN))
  }

  @Test
  fun devicePositionStringifier() {
    assertEquals("front", IvsMapping.devicePositionToString(Device.Descriptor.Position.FRONT))
    assertEquals("back", IvsMapping.devicePositionToString(Device.Descriptor.Position.BACK))
  }

  @Test
  fun cameraPositionRoundTrip() {
    assertEquals("front", IvsMapping.cameraPositionToString(Device.Descriptor.Position.FRONT))
    assertEquals("back", IvsMapping.cameraPositionToString(Device.Descriptor.Position.BACK))
    assertEquals(Device.Descriptor.Position.FRONT, IvsMapping.cameraPositionFromString("front"))
    assertEquals(Device.Descriptor.Position.BACK, IvsMapping.cameraPositionFromString("back"))
  }

  @Test
  fun mediaTypeStringifier() {
    assertEquals("audio", IvsMapping.mediaTypeForStreamType(StageStream.Type.AUDIO))
    assertEquals("video", IvsMapping.mediaTypeForStreamType(StageStream.Type.VIDEO))
  }

  @Test
  fun permissionStatuses() {
    assertEquals("granted", IvsMapping.permissionGranted())
    assertEquals("denied", IvsMapping.permissionDenied())
    assertEquals("restricted", IvsMapping.permissionRestricted())
    assertEquals("undetermined", IvsMapping.permissionUndetermined())
  }

  @Test
  fun subscribeTypeValidation() {
    assertTrue(IvsMapping.isValidSubscribeType("none"))
    assertTrue(IvsMapping.isValidSubscribeType("audio-only"))
    assertTrue(IvsMapping.isValidSubscribeType("audio-video"))
    assertFalse(IvsMapping.isValidSubscribeType("invalid"))
  }

  @Test
  fun audioOutputValidation() {
    assertTrue(IvsMapping.isValidAudioOutput("auto"))
    assertTrue(IvsMapping.isValidAudioOutput("speaker"))
    assertTrue(IvsMapping.isValidAudioOutput("earpiece"))
    assertTrue(IvsMapping.isValidAudioOutput("bluetooth"))
    assertTrue(IvsMapping.isValidAudioOutput("wired"))
    assertFalse(IvsMapping.isValidAudioOutput("invalid"))
  }

  @Test
  fun errorCode1300MapsToDisconnected() {
    assertEquals("disconnected", IvsMapping.mapErrorCodeValue(1300, "Retry attempts are exhausted", "unknown"))
  }

  @Test
  fun errorCode1400MapsToUnknownWhileConnected() {
    assertEquals("unknown", IvsMapping.mapErrorCodeValue(1400, "PeerConnection is lost", "unknown"))
  }

  @Test
  fun expiredTokenMessageMapsCorrectly() {
    assertEquals("token-expired", IvsMapping.mapErrorCodeValue(0, "Token has expired", "unknown"))
  }

  @Test
  fun invalidTokenMessageMapsCorrectly() {
    assertEquals("token-invalid", IvsMapping.mapErrorCodeValue(0, "invalid token", "unknown"))
  }

  @Test
  fun permissionMessageMapsCorrectly() {
    assertEquals("permission-denied", IvsMapping.mapErrorCodeValue(0, "permission denied", "unknown"))
  }

  @Test
  fun deviceUnavailableMessageMapsCorrectly() {
    assertEquals("device-unavailable", IvsMapping.mapErrorCodeValue(0, "camera unavailable", "unknown"))
  }

  @Test
  fun nullExceptionUsesFallback() {
    assertEquals("join-failed", IvsMapping.mapErrorCode(null, "join-failed"))
    assertEquals("unknown", IvsMapping.mapErrorCode(null, null))
  }
}
