package com.ivsrealtime

import android.util.Log
import com.amazonaws.ivs.broadcast.AudioLocalStageStream
import com.amazonaws.ivs.broadcast.BroadcastException
import com.amazonaws.ivs.broadcast.Device
import com.amazonaws.ivs.broadcast.ImageDevice
import com.amazonaws.ivs.broadcast.ImageLocalStageStream
import com.amazonaws.ivs.broadcast.LocalStageStream
import com.amazonaws.ivs.broadcast.ParticipantInfo
import com.amazonaws.ivs.broadcast.Stage
import com.amazonaws.ivs.broadcast.StageRenderer
import com.amazonaws.ivs.broadcast.StageStream
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import org.json.JSONObject

/**
 * TurboModule that connects to an IVS Real-Time **Stage** and streams lifecycle
 * events to JS (see [NativeIvsStageSpec], generated from src/NativeIvsStage.ts).
 *
 * PoC scope: join with a participant token and observe connection/participant
 * events. It subscribes to remote participants (so their join/publish events are
 * visible) but does not publish local media yet — [strategy] returns no streams.
 *
 * The IVS [Stage] must be created, joined, and left on a thread with a Looper,
 * and its [StageRenderer] callbacks are delivered on the main thread, so all
 * Stage interaction is marshalled onto the UI thread.
 */
@ReactModule(name = IvsStageModule.NAME)
class IvsStageModule(reactContext: ReactApplicationContext) :
  NativeIvsStageSpec(reactContext) {

  private var stage: Stage? = null

  // Local media we publish. Built from the shared device discovery on join and
  // handed to the SDK through [strategy]; torn down on leave.
  private var cameraStream: ImageLocalStageStream? = null
  private var micStream: AudioLocalStageStream? = null
  private var cameraDevice: ImageDevice? = null
  private var localVideoMuted = false
  private var localAudioMuted = false
  private var localParticipantId: String? = null

  override fun getName(): String = NAME

  override fun joinStage(token: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        // Replace any existing connection so repeated joins don't leak a Stage.
        releaseStage()

        // Build local camera/mic streams up front so the strategy can publish
        // them as soon as the SDK asks (during join). Best-effort: missing
        // permission or hardware just means we publish less (or nothing).
        buildLocalStreams()

        val newStage = Stage(reactApplicationContext, token, strategy)
        newStage.addRenderer(renderer)
        newStage.join()
        stage = newStage
        promise.resolve(null)
      } catch (e: BroadcastException) {
        Log.e(TAG, "joinStage failed: ${e.message}", e)
        promise.reject("E_STAGE_JOIN", e.message, e)
      } catch (t: Throwable) {
        Log.e(TAG, "joinStage failed: ${t.message}", t)
        promise.reject("E_STAGE_JOIN", t.message, t)
      }
    }
  }

  override fun leaveStage() {
    UiThreadUtil.runOnUiThread {
      val wasActive = stage != null
      releaseStage()
      // releaseStage() detaches the renderer, so the SDK's own DISCONNECTED
      // callback won't reach JS — emit it here so the UI returns to
      // disconnected (otherwise the app would sit on "leaving…" forever).
      if (wasActive) {
        emitOnConnectionStateChanged(writableMapOf("state" to "disconnected"))
      }
    }
  }

  override fun setLocalVideoMuted(muted: Boolean) {
    UiThreadUtil.runOnUiThread {
      localVideoMuted = muted
      cameraStream?.setMuted(muted)
      updateLocalMedia { it.videoMuted = muted }
    }
  }

  override fun setLocalAudioMuted(muted: Boolean) {
    UiThreadUtil.runOnUiThread {
      localAudioMuted = muted
      micStream?.setMuted(muted)
      updateLocalMedia { it.audioMuted = muted }
    }
  }

  /** Tear down the current Stage. Must run on the UI thread. */
  private fun releaseStage() {
    stage?.let {
      // Detach callbacks first so teardown doesn't emit partial state to JS.
      it.removeRenderer(renderer)
      it.leave()
      it.release()
    }
    stage = null
    destroyLocalStreams()
    localParticipantId = null
    // Drop any remote video devices we were holding for the participant views.
    IvsParticipantStreams.clear()
  }

  // --- Local publishing --------------------------------------------------------

  /**
   * Build the local camera + microphone streams from the shared device
   * discovery. Called on the UI thread before join so [strategy] can publish
   * them. Prefers the front camera; tolerates missing devices/permission.
   */
  private fun buildLocalStreams() {
    destroyLocalStreams()
    try {
      val devices = IvsDevices.get(reactApplicationContext).listLocalDevices()
      val cameras =
        devices.filter { it.descriptor.type == Device.Descriptor.DeviceType.CAMERA }
      val camera =
        cameras.firstOrNull { it.descriptor.position == Device.Descriptor.Position.FRONT }
          ?: cameras.firstOrNull()
      val mic =
        devices.firstOrNull { it.descriptor.type == Device.Descriptor.DeviceType.MICROPHONE }

      cameraDevice = camera as? ImageDevice
      cameraStream = cameraDevice?.let { ImageLocalStageStream(it) }
      micStream = mic?.let { AudioLocalStageStream(it) }
      // Honour the current mute state (e.g. rejoining after muting).
      cameraStream?.setMuted(localVideoMuted)
      micStream?.setMuted(localAudioMuted)
    } catch (t: Throwable) {
      Log.e(TAG, "Failed to build local streams: ${t.message}", t)
    }
  }

  private fun destroyLocalStreams() {
    cameraStream = null
    micStream = null
    cameraDevice = null
  }

  /**
   * Point the local participant's tile at our own camera (self-view) via the
   * shared registry, and emit its media summary. Called once we know the local
   * participant id.
   */
  private fun registerLocalSelfView() {
    val id = localParticipantId ?: return
    val media = IvsParticipantStreams.media(id)
    media.video = cameraDevice
    media.hasAudio = micStream != null
    media.videoMuted = localVideoMuted
    media.audioMuted = localAudioMuted
    emitStreamsChanged(id, media)
  }

  /** Mutate the local participant's media record and re-emit it, if joined. */
  private fun updateLocalMedia(mutate: (IvsParticipantStreams.Media) -> Unit) {
    val id = localParticipantId ?: return
    val media = IvsParticipantStreams.media(id)
    mutate(media)
    emitStreamsChanged(id, media)
  }

  // --- Strategy: publish local camera+mic, subscribe to everyone ---------------

  private val strategy = object : Stage.Strategy {
    override fun stageStreamsToPublishForParticipant(
      stage: Stage,
      participant: ParticipantInfo,
    ): List<LocalStageStream> =
      if (participant.isLocal) listOfNotNull(cameraStream, micStream) else emptyList()

    override fun shouldPublishFromParticipant(
      stage: Stage,
      participant: ParticipantInfo,
    ): Boolean =
      participant.isLocal && (cameraStream != null || micStream != null)

    override fun shouldSubscribeToParticipant(
      stage: Stage,
      participant: ParticipantInfo,
    ): Stage.SubscribeType = Stage.SubscribeType.AUDIO_VIDEO
  }

  // --- Renderer: fan SDK callbacks out to JS events ----------------------------

  private val renderer = object : StageRenderer {
    override fun onConnectionStateChanged(
      stage: Stage,
      state: Stage.ConnectionState,
      exception: BroadcastException?,
    ) {
      emitOnConnectionStateChanged(
        writableMapOf("state" to connectionStateToString(state))
      )
      exception?.let {
        emitOnError(writableMapOf("message" to (it.message ?: "unknown error")))
      }
    }

    override fun onParticipantJoined(stage: Stage, participant: ParticipantInfo) {
      emitOnParticipantJoined(
        writableMapOf(
          "participantId" to participant.participantId,
          "userId" to participant.userId,
          "isLocal" to participant.isLocal,
          "attributesJson" to attributesToJson(participant.attributes),
          "canPublish" to
            participant.capabilities.contains(ParticipantInfo.Capabilities.PUBLISH),
          "canSubscribe" to
            participant.capabilities.contains(ParticipantInfo.Capabilities.SUBSCRIBE),
        )
      )
      if (participant.isLocal) {
        // Show our own camera in the local tile (self-view) via the same path as
        // remote video.
        localParticipantId = participant.participantId
        registerLocalSelfView()
      }
    }

    override fun onParticipantMetadataUpdated(stage: Stage, participant: ParticipantInfo) {
      // Custom attributes (and other metadata) can change mid-session; push the
      // latest so the UI can reflect it without a rejoin.
      emitOnParticipantMetadataUpdated(
        writableMapOf(
          "participantId" to participant.participantId,
          "attributesJson" to attributesToJson(participant.attributes),
        )
      )
    }

    override fun onParticipantLeft(stage: Stage, participant: ParticipantInfo) {
      IvsParticipantStreams.remove(participant.participantId)
      emitOnParticipantLeft(writableMapOf("participantId" to participant.participantId))
    }

    override fun onStreamsAdded(
      stage: Stage,
      participant: ParticipantInfo,
      streams: List<StageStream>,
    ) {
      val media = IvsParticipantStreams.media(participant.participantId)
      for (stream in streams) {
        when (stream.streamType) {
          StageStream.Type.VIDEO -> {
            media.video = stream.device as? ImageDevice
            media.videoMuted = stream.muted
          }
          StageStream.Type.AUDIO -> {
            media.hasAudio = true
            media.audioMuted = stream.muted
          }
          else -> {}
        }
      }
      emitStreamsChanged(participant.participantId, media)
    }

    override fun onStreamsRemoved(
      stage: Stage,
      participant: ParticipantInfo,
      streams: List<StageStream>,
    ) {
      val media = IvsParticipantStreams.media(participant.participantId)
      for (stream in streams) {
        when (stream.streamType) {
          StageStream.Type.VIDEO -> {
            media.video = null
            media.videoMuted = false
          }
          StageStream.Type.AUDIO -> {
            media.hasAudio = false
            media.audioMuted = false
          }
          else -> {}
        }
      }
      emitStreamsChanged(participant.participantId, media)
    }

    override fun onStreamsMutedChanged(
      stage: Stage,
      participant: ParticipantInfo,
      streams: List<StageStream>,
    ) {
      val media = IvsParticipantStreams.media(participant.participantId)
      for (stream in streams) {
        when (stream.streamType) {
          StageStream.Type.VIDEO -> media.videoMuted = stream.muted
          StageStream.Type.AUDIO -> media.audioMuted = stream.muted
          else -> {}
        }
      }
      emitStreamsChanged(participant.participantId, media)
    }

    override fun onParticipantPublishStateChanged(
      stage: Stage,
      participant: ParticipantInfo,
      state: Stage.PublishState,
    ) {
      emitOnParticipantPublishStateChanged(
        writableMapOf(
          "participantId" to participant.participantId,
          "state" to publishStateToString(state),
        )
      )
    }

    override fun onParticipantSubscribeStateChanged(
      stage: Stage,
      participant: ParticipantInfo,
      state: Stage.SubscribeState,
    ) {
      emitOnParticipantSubscribeStateChanged(
        writableMapOf(
          "participantId" to participant.participantId,
          "state" to subscribeStateToString(state),
        )
      )
    }

    override fun onError(exception: BroadcastException) {
      emitOnError(writableMapOf("message" to (exception.message ?: "unknown error")))
    }
  }

  // --- Helpers -----------------------------------------------------------------

  /** Emit the current media summary for a participant to JS. */
  private fun emitStreamsChanged(
    participantId: String,
    media: IvsParticipantStreams.Media,
  ) {
    emitOnParticipantStreamsChanged(
      writableMapOf(
        "participantId" to participantId,
        "hasVideo" to (media.video != null),
        "hasAudio" to media.hasAudio,
        "videoMuted" to media.videoMuted,
        "audioMuted" to media.audioMuted,
      )
    )
  }

  /**
   * Serialise a participant's attribute map to a JSON object string. Codegen
   * event payloads are flat, so the map crosses the bridge as JSON and is parsed
   * back into an object in JS.
   */
  private fun attributesToJson(attributes: Map<String, String>?): String =
    JSONObject(attributes ?: emptyMap<String, String>()).toString()

  /** Build the [WritableMap] payload the generated `emitOn*` methods expect. */
  private fun writableMapOf(vararg pairs: Pair<String, Any?>): WritableMap {
    val map = Arguments.createMap()
    for ((key, value) in pairs) {
      when (value) {
        is Boolean -> map.putBoolean(key, value)
        is String -> map.putString(key, value)
        null -> map.putNull(key)
        else -> map.putString(key, value.toString())
      }
    }
    return map
  }

  private fun connectionStateToString(state: Stage.ConnectionState): String =
    when (state) {
      Stage.ConnectionState.CONNECTING -> "connecting"
      Stage.ConnectionState.CONNECTED -> "connected"
      else -> "disconnected"
    }

  private fun publishStateToString(state: Stage.PublishState): String =
    when (state) {
      Stage.PublishState.ATTEMPTING_PUBLISH -> "attempting_publish"
      Stage.PublishState.PUBLISHED -> "published"
      else -> "not_published"
    }

  private fun subscribeStateToString(state: Stage.SubscribeState): String =
    when (state) {
      Stage.SubscribeState.ATTEMPTING_SUBSCRIBE -> "attempting_subscribe"
      Stage.SubscribeState.SUBSCRIBED -> "subscribed"
      else -> "not_subscribed"
    }

  companion object {
    const val NAME = "IvsStage"
    private const val TAG = "IvsStageModule"
  }
}
