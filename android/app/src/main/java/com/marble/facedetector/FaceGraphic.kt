package com.marble.facedetector

import android.R.attr.src
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ImageDecoder
import android.graphics.Paint
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.RequiresApi
import com.marble.CameraModule
import com.marble.GraphicOverlay
import com.marble.GraphicOverlay.Graphic
import com.marble.R
import com.google.mlkit.vision.face.Face
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException
import java.net.HttpURLConnection
import java.net.MalformedURLException
import java.net.URL


/**
 * Graphic instance for rendering face position, contour, and landmarks within the associated
 * graphic overlay view.
 */
class FaceGraphic constructor(overlay: GraphicOverlay?, private val face: Face,bitmap: Bitmap,private val context: Context) : Graphic(overlay) {
    private val paints = Paint()
    private val bitmap = bitmap
    private var mosaicBitmap:Bitmap?=null


    init {
        paints.isAntiAlias = true
        paints.maskFilter=BlurMaskFilter(20f,BlurMaskFilter.Blur.NORMAL)
    }

    /** Draws the face annotations for position on the supplied canvas. */
    @RequiresApi(Build.VERSION_CODES.P)
    override fun draw(canvas: Canvas) {
        // Draws a circle at the position of the detected face, with the face's track id below.
        val x = translateX(face.boundingBox.centerX().toFloat())
        val y = translateY(face.boundingBox.centerY().toFloat())
        // Calculate positions.
        var left = x - scale(face.boundingBox.width() / 2.0f)
        var top = y - scale(face.boundingBox.height() / 2.0f)
        var right = x + scale(face.boundingBox.width() / 2.0f)
        var bottom = y + scale(face.boundingBox.height() / 2.0f)
        var width = (right-left).toInt()
        var height = (bottom-top).toInt()

        //모자이크 옵션
        if(CameraModule.optionId==-1){//모자이크
            val temp = Bitmap.createScaledBitmap(bitmap,10,10,false)
            mosaicBitmap=Bitmap.createScaledBitmap(temp,bitmap.width,bitmap.height,false)
        }else if(CameraModule.optionId==-2){//블러
            val temp = Bitmap.createScaledBitmap(bitmap,30,30,true)
            mosaicBitmap=Bitmap.createScaledBitmap(temp,bitmap.width,bitmap.height,true)
        }else if(CameraModule.optionId==-3){//표정
            paints.reset()
            if(face.smilingProbability!! >=0.7f){
                mosaicBitmap = BitmapFactory.decodeResource(context.resources, R.drawable.smile)
                mosaicBitmap=Bitmap.createScaledBitmap(mosaicBitmap!!,width,height,false)
            }else{
                mosaicBitmap = BitmapFactory.decodeResource(context.resources, R.drawable.natural)
                mosaicBitmap=Bitmap.createScaledBitmap(mosaicBitmap!!,width,height,false)
            }
        }else{
                paints.reset()
                mosaicBitmap=Bitmap.createScaledBitmap(CameraModule.customBitmap!!, width, height, false)
                canvas.drawBitmap(mosaicBitmap!!,left,top,paints)


        }

        if(CameraModule.optionId!!<0){
            canvas.drawBitmap(mosaicBitmap!!,left,top,paints)

        }




    }




    companion object {
        private const val TAG = "FaceGraphic"
    }
}