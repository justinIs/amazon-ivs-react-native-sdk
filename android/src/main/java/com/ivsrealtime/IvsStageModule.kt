package com.ivsrealtime

import android.util.Log
import com.amazonaws.ivs.broadcast.BroadcastException
import com.amazonaws.ivs.broadcast.LocalStageStream
import com.amazonaws.ivs.broadcast.ParticipantInfo
import com.amazonaws.ivs.broadcast.Stage
import com.amazonaws.ivs.broadcast.StageRenderer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule

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

  override fun getName(): String = NAME

  override fun joinStage(token: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        // Replace any existing connection so repeated joins don't leak a Stage.
        releaseStage()

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
    UiThreadUtil.runOnUiThread { releaseStage() }
  }

  /** Tear down the current Stage. Must run on the UI thread. */
  private fun releaseStage() {
    stage?.let {
      it.leave()
      it.removeRenderer(renderer)
      it.release()
    }
    stage = null
  }

  // --- Strategy: subscribe to everyone, publish nothing (yet) ------------------

  private val strategy = object : Stage.Strategy {
    override fun stageStreamsToPublishForParticipant(
      stage: Stage,
      participant: ParticipantInfo,
    ): List<LocalStageStream> = emptyList()

    override fun shouldPublishFromParticipant(
      stage: Stage,
      participant: ParticipantInfo,
    ): Boolean = false

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
        )
      )
    }

    override fun onParticipantLeft(stage: Stage, participant: ParticipantInfo) {
      emitOnParticipantLeft(writableMapOf("participantId" to participant.participantId))
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
