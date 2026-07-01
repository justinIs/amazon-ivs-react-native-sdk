package com.ivsrealtime

import android.content.Context
import android.util.Log
import android.view.Choreographer
import android.widget.FrameLayout
import com.amazonaws.ivs.broadcast.BroadcastConfiguration
import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.DeviceDiscovery
import com.amazonaws.ivs.broadcast.ImageDevice
import com.amazonaws.ivs.broadcast.ImagePreviewView

/**
 * Native view that renders a live preview of a local camera using the IVS SDK.
 *
 * It enumerates local devices via [DeviceDiscovery], selects a camera by the
 * requested [cameraPosition], asks the [ImageDevice] for an [ImagePreviewView],
 * and hosts it as a child. No Stage is joined — this is on-device preview only.
 *
 * Props are applied asynchronously (coalesced to one layout frame) so that
 * setting several props at mount time rebuilds the preview only once.
 */
class IvsCameraPreviewView(context: Context) : FrameLayout(context) {

  private var deviceDiscovery: DeviceDiscovery? = null
  private var previewView: ImagePreviewView? = null

  // Current desired configuration (set by the ViewManager).
  private var cameraPosition: String = "front"
  private var mirror: Boolean = true
  private var aspectMode: String = "fill"

  private var applyScheduled = false

  // React Native (Yoga) sizes THIS view but does not run a measure/layout pass on
  // children we add natively at runtime, and requestLayout() is a no-op on
  // RN-managed views. Without this, the IVS ImagePreviewView child stays 0x0 and
  // renders black. Force a manual measure/layout of the subtree on every layout.
  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  fun setCameraPosition(value: String?) {
    val next = value ?: "front"
    if (next != cameraPosition) {
      cameraPosition = next
      scheduleApply()
    }
  }

  fun setMirror(value: Boolean) {
    if (value != mirror) {
      mirror = value
      // Mirroring is a cheap view transform; apply immediately if we have a preview.
      previewView?.scaleX = if (mirror) -1f else 1f
    }
  }

  fun setAspectMode(value: String?) {
    val next = value ?: "fill"
    if (next != aspectMode) {
      aspectMode = next
      scheduleApply()
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleApply()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    releaseDiscovery()
  }

  /** Coalesce multiple prop changes in the same frame into a single rebuild. */
  private fun scheduleApply() {
    if (applyScheduled) return
    applyScheduled = true
    Choreographer.getInstance().postFrameCallback {
      applyScheduled = false
      applyConfiguration()
    }
  }

  private fun aspectModeEnum(): BroadcastConfiguration.AspectMode =
    when (aspectMode) {
      "fit" -> BroadcastConfiguration.AspectMode.FIT
      else -> BroadcastConfiguration.AspectMode.FILL
    }

  private fun desiredPosition(): Device.Descriptor.Position =
    if (cameraPosition == "back") {
      Device.Descriptor.Position.BACK
    } else {
      Device.Descriptor.Position.FRONT
    }

  private fun applyConfiguration() {
    if (!isAttachedToWindow) return

    val discovery = deviceDiscovery ?: DeviceDiscovery(context).also { deviceDiscovery = it }

    val camera: ImageDevice? = try {
      discovery.listLocalDevices()
        .firstOrNull {
          it.descriptor.type == Device.Descriptor.DeviceType.CAMERA &&
            it.descriptor.position == desiredPosition()
        } as? ImageDevice
        // Fall back to any camera if the exact position isn't available.
        ?: discovery.listLocalDevices()
          .firstOrNull { it.descriptor.type == Device.Descriptor.DeviceType.CAMERA } as? ImageDevice
    } catch (t: Throwable) {
      // Most commonly: CAMERA permission not yet granted.
      Log.e(TAG, "Failed to enumerate camera devices: ${t.message}", t)
      null
    }

    if (camera == null) {
      Log.w(TAG, "No camera device available (check permissions / hardware).")
      return
    }

    // Swap in a fresh preview view for the selected camera + aspect mode.
    previewView?.let { removeView(it) }
    try {
      val newPreview = camera.getPreviewView(aspectModeEnum())
      newPreview.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      newPreview.scaleX = if (mirror) -1f else 1f
      addView(newPreview)
      previewView = newPreview
    } catch (t: Throwable) {
      Log.e(TAG, "Failed to create camera preview: ${t.message}", t)
    }
  }

  private fun releaseDiscovery() {
    previewView?.let { removeView(it) }
    previewView = null
    try {
      deviceDiscovery?.release()
    } catch (t: Throwable) {
      Log.w(TAG, "Error releasing DeviceDiscovery: ${t.message}")
    }
    deviceDiscovery = null
  }

  companion object {
    private const val TAG = "IvsCameraPreviewView"
  }
}
