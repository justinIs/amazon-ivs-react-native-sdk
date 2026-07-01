package com.ivsrealtime

import android.content.Context
import com.amazonaws.ivs.broadcast.DeviceDiscovery

/**
 * Process-wide shared [DeviceDiscovery].
 *
 * The IVS SDK's DeviceDiscovery manages system device state. Having more than one
 * live instance (e.g. the preview view and the TurboModule each creating their own,
 * then the module releasing its instance) disconnects/reassigns the active camera —
 * which made the preview thrash front→back on startup. Sharing a single instance
 * removes that contention.
 *
 * It is created lazily against the application context and kept for the app's
 * lifetime, which is the intended usage for device discovery (it enumerates
 * devices; it does not hold the camera open — the ImagePreviewView does).
 */
object IvsDevices {
  @Volatile
  private var discovery: DeviceDiscovery? = null

  @Synchronized
  fun get(context: Context): DeviceDiscovery =
    discovery ?: DeviceDiscovery(context.applicationContext).also { discovery = it }
}
