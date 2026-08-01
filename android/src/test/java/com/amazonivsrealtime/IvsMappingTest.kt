package com.amazonivsrealtime

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class IvsMappingTest {
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
