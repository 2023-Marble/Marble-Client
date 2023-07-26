package com.client

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import com.google.common.math.Quantiles.scale
import com.google.mlkit.vision.face.Face

class Draw(context: Context?, var face: Face, var isImageFlipped :Boolean,var imageWidth:Int) : View(context) {
    lateinit var boundaryPaint: Paint

    init{
        init()
    }

    private fun init(){
        boundaryPaint = Paint()
        boundaryPaint.color = Color.WHITE
        boundaryPaint.strokeWidth = 5f
        boundaryPaint.style = Paint.Style.STROKE



    }

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)

        val x= translateX(face.boundingBox.centerX().toFloat())
        val y = face.boundingBox.centerY().toFloat()

        val left = x - face.boundingBox.width() / 2.0f
        val top = y - face.boundingBox.height() / 2.0f
        val right = x + face.boundingBox.width() / 2.0f
        val bottom = y + face.boundingBox.height() / 2.0f

        canvas!!.drawRect(
            left - boundaryPaint.strokeWidth,
            top,
            left + 2*boundaryPaint.strokeWidth,
            top,
            boundaryPaint
        )

    }



    @RequiresApi(Build.VERSION_CODES.R)
    fun translateX(x: Float): Float {

        // you will need this for the inverted image in case of using front camera
        // return context.display?.width?.minus(x)!!
        if(isImageFlipped){
            return imageWidth-x
        }else {
            return x
        }
    }




}