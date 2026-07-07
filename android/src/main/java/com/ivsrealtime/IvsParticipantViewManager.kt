package com.ivsrealtime

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.IvsParticipantViewManagerDelegate
import com.facebook.react.viewmanagers.IvsParticipantViewManagerInterface

/**
 * Fabric ViewManager bridging the JS <ParticipantVideo /> component (codegen name
 * "IvsParticipantView") to the native [IvsParticipantView].
 *
 * The generated [IvsParticipantViewManagerInterface] / [IvsParticipantViewManagerDelegate]
 * come from src/IvsParticipantViewNativeComponent.ts via React Native codegen.
 */
@ReactModule(name = IvsParticipantViewManager.NAME)
class IvsParticipantViewManager :
  SimpleViewManager<IvsParticipantView>(),
  IvsParticipantViewManagerInterface<IvsParticipantView> {

  private val mDelegate: ViewManagerDelegate<IvsParticipantView> =
    IvsParticipantViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<IvsParticipantView> = mDelegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): IvsParticipantView =
    IvsParticipantView(context)

  override fun onDropViewInstance(view: IvsParticipantView) {
    super.onDropViewInstance(view)
    view.release()
  }

  @ReactProp(name = "participantId")
  override fun setParticipantId(view: IvsParticipantView?, value: String?) {
    view?.setParticipantId(value)
  }

  @ReactProp(name = "aspectMode")
  override fun setAspectMode(view: IvsParticipantView?, value: String?) {
    view?.setAspectMode(value)
  }

  @ReactProp(name = "mirror")
  override fun setMirror(view: IvsParticipantView?, value: Boolean) {
    view?.setMirror(value)
  }

  @ReactProp(name = "streamVersion")
  override fun setStreamVersion(view: IvsParticipantView?, value: Int) {
    view?.setStreamVersion(value)
  }

  companion object {
    const val NAME = "IvsParticipantView"
  }
}
