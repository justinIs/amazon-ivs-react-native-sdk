package com.amazonivsrealtime

import android.content.Context
import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.DeviceDiscovery
import com.amazonaws.ivs.broadcast.ImageDevice

/**
 * On-demand [DeviceDiscovery] and device holds. Creates discovery when something
 * needs devices and tears it down when nothing holds a camera or microphone.
 */
object IvsDevices {
  @Volatile
  private var discovery: DeviceDiscovery? = null

  @Volatile
  private var discoveryHolders: Int = 0

  @Volatile
  private var camera: ImageDevice? = null

  @Volatile
  private var microphone: Device? = null

  @Volatile
  private var cameraHolders: Int = 0

  @Volatile
  private var microphoneHolders: Int = 0

  @Synchronized
  fun acquireDiscovery(context: Context): DeviceDiscovery {
    val appContext = context.applicationContext
    discoveryHolders++
    return discovery ?: DeviceDiscovery(appContext).also { discovery = it }
  }

  @Synchronized
  fun releaseDiscovery() {
    if (discoveryHolders > 0) {
      discoveryHolders--
    }
    maybeReleaseDiscovery()
  }

  @Synchronized
  fun acquireCamera(context: Context, position: Device.Descriptor.Position): ImageDevice? {
    ensureDiscovery(context)
    cameraHolders++
    val selected = findCamera(discovery!!, position) ?: run {
      releaseCameraHold()
      return null
    }
    camera = selected
    return selected
  }

  @Synchronized
  fun acquireMicrophone(context: Context): Device? {
    ensureDiscovery(context)
    microphoneHolders++
    val selected = findMicrophone(discovery!!) ?: run {
      releaseMicrophoneHold()
      return null
    }
    microphone = selected
    return selected
  }

  @Synchronized
  fun camera(): ImageDevice? = camera

  @Synchronized
  fun microphone(): Device? = microphone

  @Synchronized
  fun releaseCameraHold() {
    if (cameraHolders > 0) {
      cameraHolders--
    }
    if (cameraHolders == 0) {
      camera = null
    }
    maybeReleaseDiscovery()
  }

  @Synchronized
  fun releaseMicrophoneHold() {
    if (microphoneHolders > 0) {
      microphoneHolders--
    }
    if (microphoneHolders == 0) {
      microphone = null
    }
    maybeReleaseDiscovery()
  }

  @Synchronized
  fun releaseAllHolds() {
    cameraHolders = 0
    microphoneHolders = 0
    discoveryHolders = 0
    camera = null
    microphone = null
    maybeReleaseDiscovery()
  }

  /**
   * Pick a camera from the managed discovery. Returns null when nothing has
   * acquired devices yet — call [acquireCamera] / [prepareDevices] first so the
   * discovery stays owned and can be released via [releaseAllHolds].
   */
  @Synchronized
  fun selectCamera(context: Context, position: Device.Descriptor.Position): ImageDevice? {
    val current = discovery ?: return null
    return findCamera(current, position)
  }

  @Synchronized
  fun selectMicrophone(context: Context): Device? {
    val current = discovery ?: return null
    return findMicrophone(current)
  }

  fun enumerateDevices(context: Context): List<Device.Descriptor> {
    val owned = acquireDiscovery(context)
    return try {
      owned.listLocalDevices().map { it.descriptor }
    } finally {
      releaseDiscovery()
    }
  }

  @Synchronized
  private fun ensureDiscovery(context: Context) {
    if (discovery == null) {
      discovery = DeviceDiscovery(context.applicationContext)
    }
  }

  private fun findCamera(
    discovery: DeviceDiscovery,
    position: Device.Descriptor.Position,
  ): ImageDevice? {
    val cameras =
      discovery.listLocalDevices()
        .filter { it.descriptor.type == Device.Descriptor.DeviceType.CAMERA }
    val chosen =
      cameras.firstOrNull { it.descriptor.position == position }
        ?: cameras.firstOrNull()
    return chosen as? ImageDevice
  }

  private fun findMicrophone(discovery: DeviceDiscovery): Device? {
    return discovery.listLocalDevices()
      .firstOrNull { it.descriptor.type == Device.Descriptor.DeviceType.MICROPHONE }
  }

  @Synchronized
  private fun maybeReleaseDiscovery() {
    if (cameraHolders == 0 && microphoneHolders == 0 && discoveryHolders == 0) {
      discovery?.release()
      discovery = null
    }
  }
}
