package com.client

import android.graphics.*
import android.graphics.drawable.Drawable
import com.google.mlkit.vision.face.Face


/**
 * A Drawable that handles displaying a QR Code's data and a bounding box around the QR code.
 */
class FaceDrawable(face: Face) : Drawable() {
    var boundingRect: Rect = face.boundingBox!!
    private val boundingRectPaint = Paint().apply {
        style = Paint.Style.STROKE
        color = Color.YELLOW
        strokeWidth = 5F
        alpha = 200
    }

    private val contentRectPaint = Paint().apply {
        style = Paint.Style.FILL
        color = Color.YELLOW
        alpha = 255
    }

    private val contentTextPaint = Paint().apply {
        color = Color.DKGRAY
        alpha = 255
        textSize = 36F
    }

    private val contentPadding = 25

    override fun draw(canvas: Canvas) {
        canvas.drawRect(boundingRect, boundingRectPaint)
        canvas.drawRect(
            Rect(
                boundingRect.left,
                boundingRect.bottom + contentPadding/2,
                boundingRect.left + contentPadding*2,
                boundingRect.bottom + contentPadding),
            contentRectPaint
        )
//        val x = translateX(boundingRect.centerX().toFloat())
//        val y = translateY(boundingRect.centerY().toFloat())
//        val left = x - scale(boundingRect.width() / 2.0f)
//        val top = y - scale(boundingRect.height() / 2.0f)
//        val right = x + scale(boundingRect.width() / 2.0f)
//        val bottom = y + scale(boundingRect.height() / 2.0f)
//        canvas.drawRect(left, top, right, bottom, boxPaints[colorID])
    }

    override fun setAlpha(alpha: Int) {
        boundingRectPaint.alpha = alpha
        contentRectPaint.alpha = alpha
        contentTextPaint.alpha = alpha
    }

    override fun setColorFilter(colorFiter: ColorFilter?) {
        boundingRectPaint.colorFilter = colorFilter
        contentRectPaint.colorFilter = colorFilter
        contentTextPaint.colorFilter = colorFilter
    }

    @Deprecated("Deprecated in Java")
    override fun getOpacity(): Int = PixelFormat.TRANSLUCENT
}