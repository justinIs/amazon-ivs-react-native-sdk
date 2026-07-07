package com.ivsrealtime

import android.content.Context
import android.util.Log
import android.view.Choreographer
import android.widget.FrameLayout
import com.amazonaws.ivs.broadcast.BroadcastConfiguration
import com.amazonaws.ivs.broadcast.ImageDevice
import com.amazonaws.ivs.broadcast.ImagePreviewView

/**
 * Native view that renders a remote Stage participant's video.
 *
 * The [IvsStageModule] records each subscribed participant's video [ImageDevice]
 * in [IvsParticipantStreams] as the SDK reports streams; this view looks that
 * device up by [participantId] and hosts its [ImagePreviewView]. It holds no
 * Stage state itself — JS decides which participant to show and bumps
 * [streamVersion] when their media changes so we re-resolve the device.
 *
 * Unlike the local camera preview this is never mirrored (remote video is shown
 * as received). The same manual measure/layout pass is needed because RN does
 * not lay out children added natively at runtime.
 */
class IvsParticipantView(context: Context) : FrameLayout(context) {

  private var previewView: ImagePreviewView? = null

  // Desired configuration (set by the ViewManager).
  private var participantId: String? = null
  private var aspectMode: String = "fill"
  private var streamVersion: Int = 0
  private var mirror: Boolean = false

  // The (participant, version, aspect) currently rendered — makes apply idempotent.
  private var appliedKey: String? = null

  private var applyScheduled = false

  // See IvsCameraPreviewView: RN sizes this view but not children we add
  // natively, so force a measure/layout of the subtree or the preview stays 0x0.
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

  fun setParticipantId(value: String?) {
    if (value != participantId) {
      participantId = value
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

  fun setStreamVersion(value: Int) {
    if (value != streamVersion) {
      streamVersion = value
      scheduleApply()
    }
  }

  fun setMirror(value: Boolean) {
    if (value != mirror) {
      mirror = value
      // A flip transform is cheap; apply it live rather than rebuilding the view.
      previewView?.scaleX = if (mirror) -1f else 1f
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleApply()
  }

  /** Detach the rendered preview. Called by the ViewManager when the view is dropped. */
  fun release() {
    previewView?.let { removeView(it) }
    previewView = null
    appliedKey = null
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

  private fun applyConfiguration() {
    if (!isAttachedToWindow) return

    val id = participantId
    val key = "$id@$streamVersion@$aspectMode"
    if (key == appliedKey && previewView != null) return

    val device: ImageDevice? = id?.let { IvsParticipantStreams.video(it) }

    // Tear down whatever we were showing; the device may have changed or gone away.
    previewView?.let { removeView(it) }
    previewView = null

    if (device == null) {
      // No video yet (not published, unsubscribed, or muted-to-nothing) — render
      // blank. A later streamVersion bump will bring us back here to resolve it.
      appliedKey = key
      return
    }

    try {
      val newPreview = device.getPreviewView(aspectModeEnum())
      newPreview.layoutParams =
        LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      newPreview.scaleX = if (mirror) -1f else 1f
      addView(newPreview)
      previewView = newPreview
      appliedKey = key
    } catch (t: Throwable) {
      Log.e(TAG, "Failed to create participant preview for $id: ${t.message}", t)
      appliedKey = null
    }
  }

  companion object {
    private const val TAG = "IvsParticipantView"
  }
}
