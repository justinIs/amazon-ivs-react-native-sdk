package com.amazonivsrealtime

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.IvsParticipantVideoViewManagerDelegate
import com.facebook.react.viewmanagers.IvsParticipantVideoViewManagerInterface

@ReactModule(name = IvsParticipantVideoViewManager.NAME)
class IvsParticipantVideoViewManager :
  SimpleViewManager<IvsParticipantVideoView>(),
  IvsParticipantVideoViewManagerInterface<IvsParticipantVideoView> {

  private val delegate: ViewManagerDelegate<IvsParticipantVideoView> =
    IvsParticipantVideoViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<IvsParticipantVideoView> = delegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): IvsParticipantVideoView =
    IvsParticipantVideoView(context)

  override fun onDropViewInstance(view: IvsParticipantVideoView) {
    super.onDropViewInstance(view)
    view.release()
  }

  @ReactProp(name = "participantId")
  override fun setParticipantId(view: IvsParticipantVideoView?, participantId: String?) {
    view?.setParticipantIdProp(participantId)
  }

  @ReactProp(name = "mirror")
  override fun setMirror(view: IvsParticipantVideoView?, mirror: Boolean) {
    view?.setMirrorProp(mirror)
  }

  @ReactProp(name = "aspectMode")
  override fun setAspectMode(view: IvsParticipantVideoView?, aspectMode: String?) {
    view?.setAspectModeProp(aspectMode)
  }

  companion object {
    const val NAME = "IvsParticipantVideoView"
  }
}
