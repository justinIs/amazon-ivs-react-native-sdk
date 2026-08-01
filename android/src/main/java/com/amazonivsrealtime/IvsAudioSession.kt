package com.amazonivsrealtime

import android.content.Context
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import com.amazonaws.ivs.broadcast.StageAudioManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

object IvsAudioSession {
  private var initialized = false
  private var requestedOutput: String = "auto"
  private var routeChangeHandler: ((WritableMap) -> Unit)? = null
  private var appContext: Context? = null
  private var audioManager: AudioManager? = null
  private var deviceCallback: AudioDeviceCallback? = null

  fun initialize(context: Context) {
    if (initialized) return
    initialized = true
    appContext = context.applicationContext
    StageAudioManager.getInstance(appContext!!)
      .setAudioModeManagementEnabled(false)
    audioManager = appContext!!.getSystemService(AudioManager::class.java)
    registerDeviceCallback()
  }

  fun setRouteChangeHandler(handler: ((WritableMap) -> Unit)?) {
    routeChangeHandler = handler
  }

  fun setAudioPreset(context: Context, preset: String) {
    initialize(context)
    val manager = StageAudioManager.getInstance(context.applicationContext)
    when (preset) {
      "subscribe-only" -> manager.setPreset(StageAudioManager.UseCasePreset.SUBSCRIBE_ONLY)
      "studio" -> manager.setPreset(StageAudioManager.UseCasePreset.STUDIO)
      else -> manager.setPreset(StageAudioManager.UseCasePreset.VIDEO_CHAT)
    }
  }

  fun setAudioOutput(context: Context, output: String) {
    initialize(context)
    requestedOutput = output
    if (output != "auto") {
      applyOutputOverride(context)
    } else {
      clearOutputOverride(context)
    }
    emitRouteChange(context)
  }

  fun requestedOutput(): String = requestedOutput

  fun currentRoute(context: Context): WritableMap {
    initialize(context)
    val manager = audioManager ?: return emptyRoute()
    return Arguments.createMap().apply {
      putString("output", requestedOutput)
      putString("activeOutput", activeOutput(manager))
      putArray("availableOutputs", availableOutputs(manager))
    }
  }

  private fun emptyRoute(): WritableMap =
    Arguments.createMap().apply {
      putString("output", requestedOutput)
      putString("activeOutput", "speaker")
      putArray("availableOutputs", Arguments.createArray())
    }

  private fun applyOutputOverride(context: Context) {
    val manager = audioManager ?: return
    when (requestedOutput) {
      "speaker" -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_BUILTIN_SPEAKER)
        } else {
          @Suppress("DEPRECATION")
          manager.isSpeakerphoneOn = true
        }
      }
      "earpiece" -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_BUILTIN_EARPIECE)
        } else {
          @Suppress("DEPRECATION")
          manager.isSpeakerphoneOn = false
        }
      }
      "bluetooth" -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_BLUETOOTH_SCO)
            || selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_BLE_HEADSET)
        }
      }
      "wired" -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_WIRED_HEADSET)
            || selectCommunicationDevice(manager, AudioDeviceInfo.TYPE_USB_HEADSET)
        }
      }
    }
  }

  private fun clearOutputOverride(context: Context) {
    val manager = audioManager ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      manager.clearCommunicationDevice()
    } else {
      @Suppress("DEPRECATION")
      manager.isSpeakerphoneOn = true
    }
  }

  private fun selectCommunicationDevice(manager: AudioManager, type: Int): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return false
    val device = manager.availableCommunicationDevices.firstOrNull { it.type == type }
      ?: return false
    manager.mode = AudioManager.MODE_IN_COMMUNICATION
    return manager.setCommunicationDevice(device)
  }

  private fun activeOutput(manager: AudioManager): String {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      when (manager.communicationDevice?.type) {
        AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
        AudioDeviceInfo.TYPE_BLE_HEADSET,
        -> return "bluetooth"
        AudioDeviceInfo.TYPE_WIRED_HEADSET,
        AudioDeviceInfo.TYPE_USB_HEADSET,
        -> return "wired"
        AudioDeviceInfo.TYPE_BUILTIN_EARPIECE -> return "earpiece"
      }
    } else {
      @Suppress("DEPRECATION")
      if (!manager.isSpeakerphoneOn) {
        return "earpiece"
      }
    }
    return "speaker"
  }

  private fun availableOutputs(manager: AudioManager): WritableArray {
    val outputs = linkedSetOf("speaker", "earpiece")
    val devices =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        manager.availableCommunicationDevices
      } else {
        emptyList()
      }
    for (device in devices) {
      when (device.type) {
        AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
        AudioDeviceInfo.TYPE_BLE_HEADSET,
        -> outputs.add("bluetooth")
        AudioDeviceInfo.TYPE_WIRED_HEADSET,
        AudioDeviceInfo.TYPE_USB_HEADSET,
        -> outputs.add("wired")
      }
    }
    val array = Arguments.createArray()
    for (output in outputs) {
      array.pushString(output)
    }
    return array
  }

  private fun registerDeviceCallback() {
    val manager = audioManager ?: return
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return
    val callback =
      object : AudioDeviceCallback() {
        override fun onAudioDevicesAdded(addedDevices: Array<out AudioDeviceInfo>) {
          emitRouteChangeFromManager()
        }

        override fun onAudioDevicesRemoved(removedDevices: Array<out AudioDeviceInfo>) {
          emitRouteChangeFromManager()
        }
      }
    deviceCallback = callback
    manager.registerAudioDeviceCallback(callback, null)
  }

  private fun emitRouteChangeFromManager() {
    val context = appContext ?: return
    if (requestedOutput != "auto") {
      applyOutputOverride(context)
    }
    emitRouteChange(context)
  }

  private fun emitRouteChange(context: Context) {
    routeChangeHandler?.invoke(currentRoute(context))
  }
}
