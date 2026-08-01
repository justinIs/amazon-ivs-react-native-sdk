package com.amazonivsrealtime

import android.content.Context

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
}
