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
 * It selects a camera by the requested [cameraPosition] from the shared
 * [IvsDevices] discovery, asks the [ImageDevice] for an [ImagePreviewView], and
 * hosts it as a child. No Stage is joined — this is on-device preview only.
 *
 * Applying is idempotent: if the resolved camera and aspect mode haven't changed,
 * the existing preview is reused rather than torn down and reopened, so re-renders
 * (or the TurboModule enumerating devices) don't cause the camera to thrash.
 * The camera is released when the ViewManager drops the view.
 */
class IvsCameraPreviewView(context: Context) : FrameLayout(context) {

  private var previewView: ImagePreviewView? = null

  // Current desired configuration (set by the ViewManager).
  private var cameraPosition: String = "front"
  private var mirror: Boolean = true
  private var aspectMode: String = "fill"

  // What is actually rendered right now — used to make applyConfiguration idempotent.
  private var appliedDeviceId: String? = null
  private var appliedAspectMode: String? = null

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
      // Coalesce with any camera/aspect change in the same frame. Applying the
      // mirror transform immediately would flip the OUTGOING camera for one frame
      // before a concurrent position change swaps it (visible glitch on flip).
      scheduleApply()
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

  /** Release the camera preview. Called by the ViewManager when the view is dropped. */
  fun release() {
    previewView?.let { removeView(it) }
    previewView = null
    appliedDeviceId = null
    appliedAspectMode = null
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

  /**
   * Deterministically pick a camera for the requested position: prefer an exact
   * position match, otherwise fall back to the first available camera.
   */
  private fun selectCamera(discovery: DeviceDiscovery): ImageDevice? {
    val cameras = discovery.listLocalDevices()
      .filter { it.descriptor.type == Device.Descriptor.DeviceType.CAMERA }
    val chosen = cameras.firstOrNull { it.descriptor.position == desiredPosition() }
      ?: cameras.firstOrNull()
    return chosen as? ImageDevice
  }

  private fun applyConfiguration() {
    if (!isAttachedToWindow) return

    val camera: ImageDevice? = try {
      selectCamera(IvsDevices.get(context))
    } catch (t: Throwable) {
      // Most commonly: CAMERA permission not yet granted.
      Log.e(TAG, "Failed to enumerate camera devices: ${t.message}", t)
      null
    }

    if (camera == null) {
      Log.w(TAG, "No camera device available (check permissions / hardware).")
      return
    }

    val deviceId = camera.descriptor.deviceId

    // Idempotent: nothing meaningful changed → keep the running preview, just make
    // sure the mirror transform is current. Avoids tearing down / reopening the camera.
    if (deviceId == appliedDeviceId && aspectMode == appliedAspectMode && previewView != null) {
      previewView?.scaleX = if (mirror) -1f else 1f
      return
    }

    previewView?.let { removeView(it) }
    try {
      val newPreview = camera.getPreviewView(aspectModeEnum())
      newPreview.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      newPreview.scaleX = if (mirror) -1f else 1f
      addView(newPreview)
      previewView = newPreview
      appliedDeviceId = deviceId
      appliedAspectMode = aspectMode
    } catch (t: Throwable) {
      Log.e(TAG, "Failed to create camera preview: ${t.message}", t)
    }
  }

  companion object {
    private const val TAG = "IvsCameraPreviewView"
  }
}
