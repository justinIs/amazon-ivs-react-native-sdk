package com.amazonivsrealtime

import android.content.Context
import com.facebook.react.bridge.UiThreadUtil
import java.util.Collections
import java.util.WeakHashMap

/**
 * Local camera preview. Camera position is owned by [IvsStageManager], not a prop.
 */
class IvsLocalPreviewView(context: Context) : IvsPreviewHostView(context) {

  private var source: String = "camera"
  private var appliedSource: String? = null
  private var appliedAspectMode: String? = null
  /** True when this view called [IvsDevices.acquireCamera] for lobby preview. */
  private var ownsCameraHold = false

  fun setSourceProp(value: String?) {
    val next = value ?: "camera"
    if (next != source) {
      source = next
      scheduleApply()
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    mounted.add(this)
  }

  override fun onDetachedFromWindow() {
    mounted.remove(this)
    super.onDetachedFromWindow()
  }

  override fun applyConfiguration() {
    if (!isAttachedToWindow) return
    if (source != "camera") {
      releaseOwnedCameraHold()
      clearPreview()
      appliedSource = source
      return
    }

    val camera =
      IvsDevices.camera()
        ?: IvsDevices.acquireCamera(context, IvsStageManager.cameraPosition())?.also {
          ownsCameraHold = true
        }
        ?: IvsDevices.selectCamera(context, IvsStageManager.cameraPosition())
    if (camera == null) {
      return
    }

    val deviceId = camera.descriptor.deviceId
    if (deviceId == appliedSource && aspectMode == appliedAspectMode && previewView != null) {
      previewView?.scaleX = if (mirror) -1f else 1f
      return
    }

    attachPreview(camera)
    appliedSource = deviceId
    appliedAspectMode = aspectMode
  }

  override fun onRelease() {
    releaseOwnedCameraHold()
    appliedSource = null
    appliedAspectMode = null
  }

  private fun releaseOwnedCameraHold() {
    if (!ownsCameraHold) {
      return
    }
    ownsCameraHold = false
    IvsDevices.releaseCameraHold()
  }

  companion object {
    /** Mounted previews, main thread only. Weak so a dropped view cannot leak. */
    private val mounted: MutableSet<IvsLocalPreviewView> =
      Collections.newSetFromMap(WeakHashMap())

    /**
     * Re-attach every mounted preview to the current camera. Without this a flip
     * leaves the preview holding the previous device's preview, which keeps
     * displaying its last frame while the stage publishes the new camera.
     */
    fun onLocalCameraChanged() {
      UiThreadUtil.runOnUiThread {
        for (view in mounted.toList()) {
          // Force a re-attach rather than relying on the device id having changed.
          view.appliedSource = null
          view.scheduleApply()
        }
      }
    }
  }
}
