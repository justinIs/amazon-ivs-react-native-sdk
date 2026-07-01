package com.ivsrealtime

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.IvsCameraPreviewManagerDelegate
import com.facebook.react.viewmanagers.IvsCameraPreviewManagerInterface

/**
 * Fabric ViewManager bridging the JS <CameraPreview /> component (codegen name
 * "IvsCameraPreview") to the native [IvsCameraPreviewView].
 *
 * The generated [IvsCameraPreviewManagerInterface] / [IvsCameraPreviewManagerDelegate]
 * come from src/IvsCameraPreviewNativeComponent.ts via React Native codegen.
 */
@ReactModule(name = IvsCameraPreviewViewManager.NAME)
class IvsCameraPreviewViewManager :
  SimpleViewManager<IvsCameraPreviewView>(),
  IvsCameraPreviewManagerInterface<IvsCameraPreviewView> {

  private val mDelegate: ViewManagerDelegate<IvsCameraPreviewView> =
    IvsCameraPreviewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<IvsCameraPreviewView> = mDelegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): IvsCameraPreviewView =
    IvsCameraPreviewView(context)

  override fun onDropViewInstance(view: IvsCameraPreviewView) {
    super.onDropViewInstance(view)
    // Release the camera preview only when RN actually removes the view (not on
    // transient detach), so the camera doesn't churn during layout/re-render.
    view.release()
  }

  @ReactProp(name = "cameraPosition")
  override fun setCameraPosition(view: IvsCameraPreviewView?, value: String?) {
    view?.setCameraPosition(value)
  }

  @ReactProp(name = "mirror")
  override fun setMirror(view: IvsCameraPreviewView?, value: Boolean) {
    view?.setMirror(value)
  }

  @ReactProp(name = "aspectMode")
  override fun setAspectMode(view: IvsCameraPreviewView?, value: String?) {
    view?.setAspectMode(value)
  }

  companion object {
    const val NAME = "IvsCameraPreview"
  }
}
