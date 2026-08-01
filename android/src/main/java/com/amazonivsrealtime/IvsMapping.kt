package com.amazonivsrealtime

import com.amazonaws.ivs.broadcast.BroadcastException
import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.Stage
import com.amazonaws.ivs.broadcast.StageStream
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

object IvsMapping {
  fun connectionStateToString(state: Stage.ConnectionState): String =
    when (state) {
      Stage.ConnectionState.CONNECTING -> "connecting"
      Stage.ConnectionState.CONNECTED -> "connected"
      else -> "disconnected"
    }

  fun publishStateToString(state: Stage.PublishState): String =
    when (state) {
      Stage.PublishState.ATTEMPTING_PUBLISH -> "attemptingPublish"
      Stage.PublishState.PUBLISHED -> "published"
      else -> "notPublished"
    }

  fun subscribeStateToString(state: Stage.SubscribeState): String =
    when (state) {
      Stage.SubscribeState.ATTEMPTING_SUBSCRIBE -> "attemptingSubscribe"
      Stage.SubscribeState.SUBSCRIBED -> "subscribed"
      else -> "notSubscribed"
    }

  fun subscribeTypeToString(type: Stage.SubscribeType): String =
    when (type) {
      Stage.SubscribeType.NONE -> "none"
      Stage.SubscribeType.AUDIO_ONLY -> "audio-only"
      else -> "audio-video"
    }

  fun subscribeTypeFromString(type: String): Stage.SubscribeType =
    when (type) {
      "none" -> Stage.SubscribeType.NONE
      "audio-only" -> Stage.SubscribeType.AUDIO_ONLY
      else -> Stage.SubscribeType.AUDIO_VIDEO
    }

  fun isValidSubscribeType(type: String): Boolean =
    type == "none" || type == "audio-only" || type == "audio-video"

  fun deviceTypeToString(type: Device.Descriptor.DeviceType): String =
    when (type) {
      Device.Descriptor.DeviceType.CAMERA -> "camera"
      Device.Descriptor.DeviceType.MICROPHONE -> "microphone"
      else -> "unknown"
    }

  fun devicePositionToString(position: Device.Descriptor.Position): String =
    when (position) {
      Device.Descriptor.Position.FRONT -> "front"
      Device.Descriptor.Position.BACK -> "back"
      else -> "unknown"
    }

  fun cameraPositionToString(position: Device.Descriptor.Position): String =
    if (position == Device.Descriptor.Position.BACK) "back" else "front"

  fun cameraPositionFromString(position: String): Device.Descriptor.Position =
    if (position == "back") Device.Descriptor.Position.BACK else Device.Descriptor.Position.FRONT

  fun mediaTypeForStreamType(type: StageStream.Type): String =
    if (type == StageStream.Type.AUDIO) "audio" else "video"

  fun permissionGranted(): String = "granted"

  fun permissionDenied(): String = "denied"

  fun permissionRestricted(): String = "restricted"

  fun permissionUndetermined(): String = "undetermined"

  fun isValidAudioOutput(output: String): Boolean =
    output == "auto" ||
      output == "speaker" ||
      output == "earpiece" ||
      output == "bluetooth" ||
      output == "wired"

  fun streamToMap(stream: StageStream): WritableMap {
    val descriptor = stream.device.descriptor
    return Arguments.createMap().apply {
      putString("mediaType", mediaTypeForStreamType(stream.streamType))
      putBoolean("isMuted", stream.muted)
      putString("deviceType", deviceTypeToString(descriptor.type))
      putString("urn", descriptor.urn ?: "")
    }
  }

  fun attributesToMap(attributes: Map<String, String>?): ReadableMap {
    val map = Arguments.createMap()
    for ((key, value) in attributes ?: emptyMap()) {
      map.putString(key, value)
    }
    return map
  }

  fun nativeErrorMap(exception: BroadcastException?): WritableMap? {
    if (exception == null) return null
    return Arguments.createMap().apply {
      putString("domain", "BroadcastException")
      putInt("code", exception.code)
      putString("message", exception.message ?: "")
    }
  }

  fun mapErrorCode(exception: BroadcastException?, fallback: String?): String {
    if (exception == null) return fallback ?: "unknown"
    return mapErrorCodeValue(exception.code, exception.message, fallback)
  }

  internal fun mapErrorCodeValue(code: Int, message: String?, fallback: String?): String {
    val normalizedMessage = message?.lowercase() ?: ""

    if (code == 1300) {
      return "disconnected"
    }
    if (code == 1400) {
      return "unknown"
    }

    if (normalizedMessage.contains("expired")) {
      return "token-expired"
    }
    if (normalizedMessage.contains("invalid token") || normalizedMessage.contains("token is invalid")) {
      return "token-invalid"
    }
    if (normalizedMessage.contains("permission") ||
      normalizedMessage.contains("denied") ||
      normalizedMessage.contains("not authorized")
    ) {
      return "permission-denied"
    }
    if (normalizedMessage.contains("camera") ||
      normalizedMessage.contains("microphone") ||
      normalizedMessage.contains("device") ||
      normalizedMessage.contains("unavailable")
    ) {
      return "device-unavailable"
    }
    if (fallback == "join-failed") {
      return "join-failed"
    }
    return fallback ?: "unknown"
  }
}
