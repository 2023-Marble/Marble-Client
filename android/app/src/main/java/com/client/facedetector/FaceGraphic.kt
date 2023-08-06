package com.client.facedetector

import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.MaskFilter
import android.graphics.Paint
import android.graphics.Shader
import android.util.Log
import com.client.Camera
import com.client.GraphicOverlay
import com.client.GraphicOverlay.Graphic
import com.google.mlkit.vision.face.Face


/**
 * Graphic instance for rendering face position, contour, and landmarks within the associated
 * graphic overlay view.
 */
class FaceGraphic constructor(overlay: GraphicOverlay?, private val face: Face,bitmap: Bitmap) : Graphic(overlay) {
    private val numColors = COLORS.size
    private val idPaints = Array(numColors) { Paint() }
    private val boxPaints = Array(numColors) { Paint() }
    private val labelPaints = Array(numColors) { Paint() }
    private val mosaicPaints = Paint()
    private val paints = Paint()
    private val bitmap = bitmap
    private var dstW = 10
    private var dstH = 10
    private var filter = false


    init {
        paints.isAntiAlias = true
        paints.maskFilter=BlurMaskFilter(10f,BlurMaskFilter.Blur.NORMAL)
    }

    /** Draws the face annotations for position on the supplied canvas. */
    override fun draw(canvas: Canvas) {
        Log.d("CameraView draw","FaceGraphic")
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
        if(Camera.optionId==-1){
            dstW=10
            dstH=10
            filter=false
        }else if(Camera.optionId==-2){
            dstW=30
            dstH=30
            filter=true
        }
        val temp = Bitmap.createScaledBitmap(bitmap,dstW,dstH,filter)
        val mosaicBitmap=Bitmap.createScaledBitmap(temp,bitmap.width,bitmap.height,filter)
        canvas.drawBitmap(mosaicBitmap,left,top,paints)




    }




    companion object {
        private const val TAG = "FaceGraphic"
        private const val FACE_POSITION_RADIUS = 8.0f
        private const val ID_TEXT_SIZE = 30.0f
        private const val ID_Y_OFFSET = 40.0f
        private const val BOX_STROKE_WIDTH = 5.0f
        private const val NUM_COLORS = 10
        private val COLORS =
            arrayOf(
                intArrayOf(Color.BLACK, Color.WHITE),
                intArrayOf(Color.WHITE, Color.MAGENTA),
                intArrayOf(Color.BLACK, Color.LTGRAY),
                intArrayOf(Color.WHITE, Color.RED),
                intArrayOf(Color.WHITE, Color.BLUE),
                intArrayOf(Color.WHITE, Color.DKGRAY),
                intArrayOf(Color.BLACK, Color.CYAN),
                intArrayOf(Color.BLACK, Color.YELLOW),
                intArrayOf(Color.WHITE, Color.BLACK),
                intArrayOf(Color.BLACK, Color.GREEN)
            )
    }
}