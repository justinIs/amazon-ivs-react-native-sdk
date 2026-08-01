package com.amazonivsrealtime

import android.Manifest
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.fbreact.specs.NativeAmazonIvsRealTimeSpec
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

@ReactModule(name = NativeAmazonIvsRealTimeSpec.NAME)
class AmazonIvsRealTimeModule(reactContext: ReactApplicationContext) :
  NativeAmazonIvsRealTimeSpec(reactContext) {

  init {
    IvsStageManager.initialize(reactContext)
    IvsStageManager.eventHandler =
      object : IvsStageManager.EventHandler {
        override fun onConnectionStateChanged(body: WritableMap) {
          emitOnStageConnectionStateChanged(body)
        }

        override fun onParticipantJoined(body: WritableMap) {
          emitOnParticipantJoined(body)
        }

        override fun onParticipantUpdated(body: WritableMap) {
          emitOnParticipantUpdated(body)
        }

        override fun onParticipantLeft(body: WritableMap) {
          emitOnParticipantLeft(body)
        }

        override fun onParticipantStreamsChanged(body: WritableMap) {
          emitOnParticipantStreamsChanged(body)
        }

        override fun onStageError(body: WritableMap) {
          emitOnStageError(body)
        }
      }

    IvsAudioSession.setRouteChangeHandler { route ->
      emitOnAudioRouteChanged(route)
    }
  }

  override fun getSdkVersion(promise: Promise) {
    try {
      promise.resolve(IvsStageManager.getSdkVersion())
    } catch (t: Throwable) {
      promise.reject("E_SDK_VERSION", t.message, t)
    }
  }

  override fun getCapabilities(promise: Promise) {
    promise.resolve(
      Arguments.createMap().apply {
        putBoolean("screenShare", false)
        putBoolean("backgroundAudio", true)
        putBoolean("bluetoothMicrophone", true)
        putBoolean("audioRouting", true)
        putBoolean("rtcStats", false)
        putBoolean("simulcast", false)
      },
    )
  }

  override fun enumerateDevices(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val descriptors = IvsDevices.enumerateDevices(reactApplicationContext)
        val result = Arguments.createArray()
        for (descriptor in descriptors) {
          result.pushMap(
            Arguments.createMap().apply {
              putString("deviceId", descriptor.deviceId)
              putString("urn", descriptor.urn ?: "")
              putString("friendlyName", descriptor.friendlyName ?: "")
              putString("type", IvsMapping.deviceTypeToString(descriptor.type))
              putString("position", IvsMapping.devicePositionToString(descriptor.position))
              putBoolean("isDefault", descriptor.isDefault)
            },
          )
        }
        promise.resolve(result)
      } catch (t: Throwable) {
        promise.reject("E_ENUMERATE", t.message, t)
      }
    }
  }

  override fun getCameraPermission(promise: Promise) {
    promise.resolve(getCameraPermissionStatus())
  }

  override fun getMicrophonePermission(promise: Promise) {
    promise.resolve(getMicrophonePermissionStatus())
  }

  override fun requestCameraPermission(promise: Promise) {
    requestPermission(Manifest.permission.CAMERA, PREF_CAMERA_REQUESTED, promise)
  }

  override fun requestMicrophonePermission(promise: Promise) {
    requestPermission(Manifest.permission.RECORD_AUDIO, PREF_MIC_REQUESTED, promise)
  }

  override fun joinStage(token: String, options: ReadableMap, promise: Promise) {
    IvsStageManager.join(
      token = token,
      options = options,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun leaveStage(promise: Promise) {
    IvsStageManager.leave(
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun renewToken(token: String, promise: Promise) {
    IvsStageManager.renewToken(
      token = token,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun listParticipants(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      promise.resolve(IvsStageManager.listParticipants())
    }
  }

  override fun readState(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      promise.resolve(IvsStageManager.readState())
    }
  }

  override fun setPublishEnabled(enabled: Boolean, promise: Promise) {
    IvsStageManager.setPublishEnabled(
      enabled = enabled,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setMicrophoneEnabled(enabled: Boolean, promise: Promise) {
    IvsStageManager.setMicrophoneEnabled(
      enabled = enabled,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setCameraEnabled(enabled: Boolean, promise: Promise) {
    IvsStageManager.setCameraEnabled(
      enabled = enabled,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setCameraPosition(position: String, promise: Promise) {
    IvsStageManager.setCameraPosition(
      position = position,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun flipCamera(promise: Promise) {
    IvsStageManager.flipCamera(
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun prepareDevices(options: ReadableMap, promise: Promise) {
    IvsStageManager.prepareDevices(
      options = options,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun releaseDevices(promise: Promise) {
    IvsStageManager.releaseDevices(
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setVideoConfig(config: ReadableMap, promise: Promise) {
    IvsStageManager.setVideoConfig(
      config = config,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setDefaultSubscribeType(type: String, promise: Promise) {
    IvsStageManager.setDefaultSubscribeType(
      type = type,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setSubscribeType(participantId: String, type: String, promise: Promise) {
    IvsStageManager.setSubscribeType(
      participantId = participantId,
      type = type,
      resolve = { promise.resolve(null) },
      reject = { code, message, _ -> promise.reject(code, message) },
    )
  }

  override fun setAudioPreset(preset: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      if (preset != "video-chat" && preset != "subscribe-only" && preset != "studio") {
        promise.reject("unknown", "Invalid audio preset. Use video-chat, subscribe-only, or studio.")
        return@runOnUiThread
      }
      try {
        IvsAudioSession.setAudioPreset(reactApplicationContext, preset)
        promise.resolve(null)
      } catch (t: Throwable) {
        promise.reject("unknown", t.message, t)
      }
    }
  }

  override fun setAudioOutput(output: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      if (!IvsMapping.isValidAudioOutput(output)) {
        promise.reject("unknown", "Invalid audio output.")
        return@runOnUiThread
      }
      IvsAudioSession.setAudioOutput(reactApplicationContext, output)
      promise.resolve(null)
    }
  }

  override fun getAudioRoute(promise: Promise) {
    promise.resolve(IvsAudioSession.currentRoute(reactApplicationContext))
  }

  private fun getCameraPermissionStatus(): String {
    if (isCameraRestricted()) {
      return IvsMapping.permissionRestricted()
    }
    return permissionStatus(Manifest.permission.CAMERA, PREF_CAMERA_REQUESTED)
  }

  private fun getMicrophonePermissionStatus(): String =
    permissionStatus(Manifest.permission.RECORD_AUDIO, PREF_MIC_REQUESTED)

  private fun permissionStatus(permission: String, requestedPrefKey: String): String {
    when (
      ContextCompat.checkSelfPermission(reactApplicationContext, permission)
    ) {
      PackageManager.PERMISSION_GRANTED -> return IvsMapping.permissionGranted()
      PackageManager.PERMISSION_DENIED -> {
        val requested =
          reactApplicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getBoolean(requestedPrefKey, false)
        return if (requested) {
          IvsMapping.permissionDenied()
        } else {
          IvsMapping.permissionUndetermined()
        }
      }
      else -> return IvsMapping.permissionUndetermined()
    }
  }

  private fun isCameraRestricted(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
      return false
    }
    val dpm =
      reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
        ?: return false
    return dpm.getCameraDisabled(null)
  }

  private fun requestPermission(permission: String, requestedPrefKey: String, promise: Promise) {
    // Camera has an extra DPM restriction check that plain permissionStatus()
    // can't see; without it an MDM-restricted device would prompt uselessly.
    val current =
      if (permission == Manifest.permission.CAMERA) {
        getCameraPermissionStatus()
      } else {
        permissionStatus(permission, requestedPrefKey)
      }
    if (current == IvsMapping.permissionGranted() || current == IvsMapping.permissionRestricted()) {
      promise.resolve(current)
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("unknown", "No activity available to request permission.")
      return
    }

    if (activity !is PermissionAwareActivity) {
      promise.reject("unknown", "Activity does not support permission requests.")
      return
    }

    val listener =
      PermissionListener { _, _, grantResults ->
        val granted =
          grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        promise.resolve(
          if (granted) IvsMapping.permissionGranted() else IvsMapping.permissionDenied(),
        )
        true
      }

    if (
      ContextCompat.checkSelfPermission(reactApplicationContext, permission) ==
        PackageManager.PERMISSION_GRANTED
    ) {
      promise.resolve(IvsMapping.permissionGranted())
      return
    }

    reactApplicationContext
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putBoolean(requestedPrefKey, true)
      .apply()

    if (ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) {
      activity.requestPermissions(arrayOf(permission), REQUEST_CODE, listener)
      return
    }

    activity.requestPermissions(arrayOf(permission), REQUEST_CODE, listener)
  }

  companion object {
    private const val PREFS_NAME = "amazon_ivs_realtime_permissions"
    private const val PREF_CAMERA_REQUESTED = "camera_permission_requested"
    private const val PREF_MIC_REQUESTED = "microphone_permission_requested"
    private const val REQUEST_CODE = 99123
  }
}
