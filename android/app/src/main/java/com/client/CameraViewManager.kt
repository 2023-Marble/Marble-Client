package com.client

import CameraView
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactPropGroup

class CameraViewManager :SimpleViewManager<CameraView>(){

    override fun getName(): String {
            Log.d("CameraViewManager함수", "1");
            return "CameraContainer"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): CameraView {
        Log.d("CameraViewManager함수","2")
        return CameraView(reactContext)
    }
}
