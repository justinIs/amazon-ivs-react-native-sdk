package com.ivsrealtime

import com.amazonaws.ivs.broadcast.ImageDevice
import java.util.concurrent.ConcurrentHashMap

/**
 * Process-wide registry of the media each remote Stage participant is currently
 * publishing to us.
 *
 * The [IvsStageModule] writes to it as the SDK delivers `onStreamsAdded` /
 * `onStreamsRemoved` / `onStreamsMutedChanged`, and the [IvsParticipantView]
 * reads back a participant's video [ImageDevice] to render its preview. Sharing
 * a registry avoids threading the (non-serialisable) SDK device objects through
 * the JS bridge — JS only carries the participant id and a version counter, and
 * resolves the actual device natively here.
 *
 * All access happens on the UI thread (renderer callbacks and view layout both
 * run there), but the map is concurrent as a defensive measure.
 */
object IvsParticipantStreams {

  /** The video/audio a participant is publishing, as last reported by the SDK. */
  class Media {
    var video: ImageDevice? = null
    var hasAudio: Boolean = false
    var videoMuted: Boolean = false
    var audioMuted: Boolean = false
  }

  private val byParticipant = ConcurrentHashMap<String, Media>()

  /** The mutable media record for a participant, created on first access. */
  fun media(participantId: String): Media =
    byParticipant.getOrPut(participantId) { Media() }

  /** The participant's current video device, or null if they aren't sending video. */
  fun video(participantId: String): ImageDevice? = byParticipant[participantId]?.video

  /** Forget a participant's media (they left). */
  fun remove(participantId: String) {
    byParticipant.remove(participantId)
  }

  /** Forget everyone's media (the Stage was left/released). */
  fun clear() {
    byParticipant.clear()
  }
}
