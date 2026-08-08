package com.amazonivsrealtime

import android.app.Application
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.UiThreadUtil

interface IvsAppLifecycleDelegate {
  fun onEnterBackground()
  fun onEnterForeground()
  fun onAudioFocusLost()
  fun onAudioFocusGained()
}

object IvsAppLifecycle {
  private var installed = false

  fun install(application: Application, delegate: IvsAppLifecycleDelegate) {
    if (installed) return
    installed = true

    // TurboModules construct off the main thread; LifecycleRegistry.addObserver
    // enforces main, so registration is posted rather than called directly.
    UiThreadUtil.runOnUiThread { registerObserver(delegate) }
  }

  private fun registerObserver(delegate: IvsAppLifecycleDelegate) {
    ProcessLifecycleOwner.get().lifecycle.addObserver(
      object : DefaultLifecycleObserver {
        override fun onStop(owner: LifecycleOwner) {
          delegate.onEnterBackground()
        }

        override fun onStart(owner: LifecycleOwner) {
          delegate.onEnterForeground()
        }
      },
    )
  }
}
