package com.ivsrealtime

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class IvsRealtimePackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(IvsCameraPreviewViewManager())
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    when (name) {
      IvsRealtimeModule.NAME -> IvsRealtimeModule(reactContext)
      IvsStageModule.NAME -> IvsStageModule(reactContext)
      else -> null
    }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      IvsRealtimeModule.NAME to turboModuleInfo(IvsRealtimeModule.NAME),
      IvsStageModule.NAME to turboModuleInfo(IvsStageModule.NAME),
    )
  }

  private fun turboModuleInfo(name: String) =
    ReactModuleInfo(
      name,
      name,
      false, // canOverrideExistingModule
      false, // needsEagerInit
      false, // isCxxModule
      true // isTurboModule
    )
}
