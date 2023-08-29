package com.marble

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import com.marble.facedetector.FaceGraphic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException
import java.net.MalformedURLException
import java.net.URL


class CameraModule (reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CameraModule"
    }

    @ReactMethod
    fun getOption(optionId:Int){
        CameraModule.optionId = optionId
    }

    @ReactMethod
    fun getImage(url: String){
        CoroutineScope(Dispatchers.IO).launch {
            customBitmap = withContext(Dispatchers.IO) {
                loadImage(url)
            }

        }
    }

    @ReactMethod
    fun handlePermissions() {
        Log.d(TAG,"허가")
        val activity = currentActivity
        // Request camera permissions
        if (activity != null) {
            if (allPermissionsGranted(activity)) {

            } else {
                ActivityCompat.requestPermissions(
                    activity, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS
                )
            }
        }
    }

    private suspend fun loadImage(url:String):Bitmap?{
        val bmp:Bitmap? = null
        try{
            val url = URL(url)
            val stream = url.openStream()

            return BitmapFactory.decodeStream(stream)
        }catch (e: MalformedURLException){
            e.printStackTrace()
        }catch (e: IOException){
            e.printStackTrace()
        }
        return bmp
    }

    private fun getIdFromResource(activity: Activity, resourceName: String): Int {
        return activity.resources.getIdentifier(resourceName, "id", activity.packageName)
    }


    private fun allPermissionsGranted(activity: Activity) : Boolean{
        return REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
    }
    }

    companion object{
        var optionId : Int? = -1
        var customBitmap : Bitmap? = null
        private const val TAG = "CameraModule"
        private const val FILENAME_FORMAT = "yyyy-MM-dd-HH-mm-ss-SSS"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS =
            mutableListOf (
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO
            ).apply {
                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                    add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                }
            }.toTypedArray()
    }
}