package com.amazonivsrealtime

import android.content.Context
import com.amazonaws.ivs.broadcast.ImageDevice

/**
 * Remote (or local self-view) participant video. Stream updates are pushed from
 * [IvsParticipantStreams] — no streamVersion prop.
 */
class IvsParticipantVideoView(context: Context) : IvsPreviewHostView(context) {

  private var participantId: String? = null
  private var pendingDevice: ImageDevice? = null
  private var registered = false
  private var attachedDevice: ImageDevice? = null
  private var attachedAspectMode: String? = null

  fun setParticipantIdProp(value: String?) {
    val next = value?.takeIf { it.isNotEmpty() }
    if (next != participantId) {
      deregisterIfNeeded()
      attachedDevice = null
      attachedAspectMode = null
      participantId = next
      scheduleApply()
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    registerIfNeeded()
  }

  override fun onDetachedFromWindow() {
    deregisterIfNeeded()
    super.onDetachedFromWindow()
  }

  fun applyStream(device: ImageDevice?) {
    pendingDevice = device
    scheduleApply()
  }

  override fun applyConfiguration() {
    if (!isAttachedToWindow) return
    registerIfNeeded()
    val device = pendingDevice ?: participantId?.let { IvsParticipantStreams.videoDevice(it) }
    // Mute updates re-push the same device; re-binding would blank the tile.
    if (device != null && device === attachedDevice && aspectMode == attachedAspectMode &&
      previewView != null
    ) {
      previewView?.scaleX = if (mirror) -1f else 1f
      return
    }
    attachedDevice = null
    attachedAspectMode = null
    attachPreview(device)
    if (previewView != null) {
      attachedDevice = device
      attachedAspectMode = aspectMode
    }
  }

  override fun onRelease() {
    deregisterIfNeeded()
    pendingDevice = null
    attachedDevice = null
    attachedAspectMode = null
    participantId = null
  }

  private fun registerIfNeeded() {
    val id = participantId ?: return
    if (registered) return
    registered = true
    IvsParticipantStreams.registerView(id, this)
  }

  private fun deregisterIfNeeded() {
    if (!registered) return
    registered = false
    IvsParticipantStreams.unregisterView(this)
  }
}
