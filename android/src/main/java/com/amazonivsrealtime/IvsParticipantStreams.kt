package com.amazonivsrealtime

import com.amazonaws.ivs.broadcast.ImageDevice
import com.amazonaws.ivs.broadcast.StageStream
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.lang.ref.WeakReference
import java.util.concurrent.ConcurrentHashMap

/**
 * Participant stream registry and view notification. Views register by
 * participantId and are pushed updates when streams change — no streamVersion.
 */
object IvsParticipantStreams {
  data class StreamRecord(
    val stream: StageStream,
    var videoDevice: ImageDevice?,
  )

  private val byParticipant = ConcurrentHashMap<String, MutableList<StreamRecord>>()
  private val registeredViews = ConcurrentHashMap<String, MutableSet<WeakReference<IvsParticipantVideoView>>>()

  fun streams(participantId: String): List<StreamRecord> =
    byParticipant[participantId]?.toList() ?: emptyList()

  fun videoDevice(participantId: String): ImageDevice? =
    byParticipant[participantId]
      ?.firstOrNull { it.stream.streamType == StageStream.Type.VIDEO && !it.stream.muted }
      ?.videoDevice

  fun setStreams(participantId: String, records: List<StreamRecord>) {
    byParticipant[participantId] = records.toMutableList()
    notifyViews(participantId)
  }

  fun addStreams(participantId: String, streams: List<StageStream>) {
    val list = byParticipant.getOrPut(participantId) { mutableListOf() }
    for (stream in streams) {
      if (list.none { it.stream === stream }) {
        list.add(
          StreamRecord(
            stream = stream,
            videoDevice = stream.device as? ImageDevice,
          )
        )
      }
    }
    notifyViews(participantId)
  }

  fun removeStreams(participantId: String, streams: List<StageStream>) {
    val list = byParticipant[participantId] ?: return
    list.removeAll { record -> streams.any { it === record.stream } }
    if (list.isEmpty()) {
      byParticipant.remove(participantId)
    }
    notifyViews(participantId)
  }

  fun updateMutedStreams(participantId: String, streams: List<StageStream>) {
    notifyViews(participantId)
  }

  fun remove(participantId: String) {
    byParticipant.remove(participantId)
    notifyViews(participantId)
  }

  fun clear() {
    byParticipant.clear()
    for (views in registeredViews.values) {
      for (ref in views) {
        ref.get()?.clearPreview()
      }
    }
  }

  fun registerView(participantId: String, view: IvsParticipantVideoView) {
    val set =
      registeredViews.getOrPut(participantId) {
        java.util.Collections.newSetFromMap(ConcurrentHashMap<WeakReference<IvsParticipantVideoView>, Boolean>())
      }
    set.add(WeakReference(view))
    view.applyStream(videoDevice(participantId))
  }

  fun unregisterView(view: IvsParticipantVideoView) {
    for ((participantId, views) in registeredViews) {
      views.removeAll { it.get() == null || it.get() === view }
      if (views.isEmpty()) {
        registeredViews.remove(participantId)
      }
    }
  }

  fun streamsChangedPayload(participantId: String): WritableMap {
    val records = streams(participantId)
    val streamsArray: WritableArray = Arguments.createArray()
    for (record in records) {
      streamsArray.pushMap(IvsMapping.streamToMap(record.stream))
    }
    return Arguments.createMap().apply {
      putString("participantId", participantId)
      putArray("streams", streamsArray)
    }
  }

  private fun notifyViews(participantId: String) {
    val device = videoDevice(participantId)
    val views = registeredViews[participantId] ?: return
    val dead = mutableListOf<WeakReference<IvsParticipantVideoView>>()
    for (ref in views) {
      val view = ref.get()
      if (view == null) {
        dead.add(ref)
      } else {
        view.applyStream(device)
      }
    }
    views.removeAll(dead.toSet())
  }
}
