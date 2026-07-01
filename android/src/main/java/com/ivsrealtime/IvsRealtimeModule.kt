package com.ivsrealtime

import com.amazonaws.ivs.broadcast.BroadcastSession
import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.DeviceDiscovery
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.module.annotations.ReactModule

/**
 * TurboModule exposing device-level IVS APIs that don't need a view.
 *
 * Implements the codegen-generated [NativeIvsRealtimeSpec] (from
 * src/NativeIvsRealtime.ts). PoC scope: SDK version + local device enumeration.
 */
@ReactModule(name = IvsRealtimeModule.NAME)
class IvsRealtimeModule(reactContext: ReactApplicationContext) :
  NativeIvsRealtimeSpec(reactContext) {

  override fun getName(): String = NAME

  override fun getSdkVersion(promise: Promise) {
    try {
      promise.resolve(BroadcastSession.getVersion())
    } catch (t: Throwable) {
      promise.reject("E_SDK_VERSION", "Failed to read IVS SDK version: ${t.message}", t)
    }
  }

  override fun enumerateDevices(promise: Promise) {
    var discovery: DeviceDiscovery? = null
    try {
      discovery = DeviceDiscovery(reactApplicationContext)
      val result: WritableArray = Arguments.createArray()
      for (device in discovery.listLocalDevices()) {
        val d = device.descriptor
        val map = Arguments.createMap()
        map.putString("id", d.deviceId)
        map.putString("name", d.friendlyName)
        map.putString("type", typeToString(d.type))
        map.putString("position", positionToString(d.position))
        result.pushMap(map)
      }
      promise.resolve(result)
    } catch (t: Throwable) {
      promise.reject("E_ENUMERATE", "Failed to enumerate devices: ${t.message}", t)
    } finally {
      try {
        discovery?.release()
      } catch (_: Throwable) {
        // best-effort cleanup
      }
    }
  }

  private fun typeToString(type: Device.Descriptor.DeviceType): String =
    when (type) {
      Device.Descriptor.DeviceType.CAMERA -> "camera"
      Device.Descriptor.DeviceType.MICROPHONE -> "microphone"
      else -> "unknown"
    }

  private fun positionToString(position: Device.Descriptor.Position): String =
    when (position) {
      Device.Descriptor.Position.FRONT -> "front"
      Device.Descriptor.Position.BACK -> "back"
      else -> "unknown"
    }

  companion object {
    const val NAME = "IvsRealtime"
  }
}
