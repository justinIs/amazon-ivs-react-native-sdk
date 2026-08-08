package com.amazonivsrealtime

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class AmazonIvsRealTimePackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(
      IvsLocalPreviewViewManager(),
      IvsParticipantVideoViewManager(),
    )

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == NativeAmazonIvsRealTimeSpec.NAME) {
      AmazonIvsRealTimeModule(reactContext)
    } else {
      null
    }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      NativeAmazonIvsRealTimeSpec.NAME to ReactModuleInfo(
        NativeAmazonIvsRealTimeSpec.NAME,
        AmazonIvsRealTimeModule::class.java.name,
        false,
        false,
        false,
        true,
      ),
    )
  }
}
