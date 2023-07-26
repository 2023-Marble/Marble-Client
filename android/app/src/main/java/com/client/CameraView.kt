import android.Manifest
import android.content.ContentValues
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.hardware.camera2.CameraCharacteristics
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.Toast
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.ExperimentalCamera2Interop
import androidx.camera.core.CameraSelector
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import com.client.GraphicOverlay
import com.client.R
import com.client.databinding.CameraViewBinding
import com.client.facedetector.FaceGraphic
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.otaliastudios.cameraview.CameraListener
import com.otaliastudios.cameraview.CameraView
import com.otaliastudios.cameraview.VideoResult
import com.otaliastudios.cameraview.controls.Facing
import com.otaliastudios.cameraview.controls.Mode
import com.otaliastudios.cameraview.frame.Frame
import com.otaliastudios.cameraview.frame.FrameProcessor
import java.io.ByteArrayOutputStream
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale


class CameraView : FrameLayout, LifecycleOwner {
    val TAG = "CameraView"

    private lateinit var context: ThemedReactContext

    private lateinit var lifecycleRegistry : LifecycleRegistry
    private lateinit var imageButton: ImageButton
    private lateinit var galleryBtn: ImageButton
    private lateinit var layoutInflater : LayoutInflater
    private var graphicOverlay: GraphicOverlay? = null
    private var lensFacing = Facing.BACK
    private lateinit var binding: CameraViewBinding
    private lateinit var camera : CameraView

    constructor(context: ThemedReactContext) : super(context) {
        this.context = context

        layoutInflater = LayoutInflater.from(context)
        binding = CameraViewBinding.inflate(layoutInflater)
        var layout = LayoutInflater.from(context).inflate(R.layout.camera_view, this, true) as FrameLayout
        var containerLayout = layout.findViewById<FrameLayout>(R.id.container)
        graphicOverlay = layout.findViewById<GraphicOverlay>(R.id.graphic_overlay)
        containerLayout.setOnHierarchyChangeListener(object :ViewGroup.OnHierarchyChangeListener{
            override fun onChildViewRemoved(parent: View?, child: View?) = Unit
            override fun onChildViewAdded(parent: View?, child: View?) {
                parent?.measure(
                    View.MeasureSpec.makeMeasureSpec(measuredWidth, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(measuredHeight, View.MeasureSpec.EXACTLY)
                )
                parent?.layout(0, 0, parent.measuredWidth, parent.measuredHeight)
            }
        })
        camera = layout.findViewById<CameraView>(R.id.camera)

        imageButton = layout.findViewById<ImageButton>(R.id.recording_button)
        imageButton.setOnClickListener{
            if(camera.isTakingVideo){
                camera.stopVideo()
            }else{
                Log.d("CameraView","촬영버튼 클릭")
                camera.takeVideoSnapshot(File(context.filesDir,"video_${System.currentTimeMillis()}.mp4"))
            }
        }

        galleryBtn=layout.findViewById<ImageButton>(R.id.gallery_button)
        galleryBtn.setOnClickListener{
            val intent = Intent(Intent.ACTION_PICK)
        }

        val flipBtn=layout.findViewById<ImageButton>(R.id.flip_button)
        flipBtn.setOnClickListener{
            camera.toggleFacing()
            if(lensFacing == Facing.BACK){
                lensFacing=Facing.FRONT
            }else{
                lensFacing=Facing.BACK
            }
            Log.d("CameraView","카메라전환")
        }


        //startCamera()

        lifecycleRegistry = LifecycleRegistry(this)
        camera.setLifecycleOwner(this)
        camera.setMode(Mode.VIDEO)
        camera.open()
        camera.addCameraListener(Listener())
        val faceDetectorOptions = FaceDetectorOptions.Builder()
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .enableTracking()
            .build()

        camera.addFrameProcessor(object :FrameProcessor{
            private var lastTime = System.currentTimeMillis()
            override fun process(frame: Frame) {
                val newTime = frame.time
                val delay = newTime - lastTime
                lastTime = newTime
                //Log.d("CameraView Frame", "$delay")
                if (frame.format == ImageFormat.NV21
                    && frame.dataClass == ByteArray::class.java) {
                    val data = frame.getData<ByteArray>()
                    val yuvImage = YuvImage(data,
                        frame.format,
                        frame.size.width,
                        frame.size.height,
                        null)
                    val jpegStream = ByteArrayOutputStream()
                    yuvImage.compressToJpeg(
                        Rect(0, 0,
                        frame.size.width,
                        frame.size.height), 100, jpegStream)
                    val jpegByteArray = jpegStream.toByteArray()
                    val bitmap = BitmapFactory.decodeByteArray(jpegByteArray,
                        0, jpegByteArray.size)
                    bitmap.toString()
                    val image = InputImage.fromBitmap(bitmap,0)
                    val isImageFlipped = lensFacing == Facing.FRONT
                    val rotationDegrees = frame.getRotationToView()
                    Log.d("CameraView ro","$rotationDegrees")
                    if (rotationDegrees == 0 || rotationDegrees == 180) {
                        graphicOverlay!!.setImageSourceInfo(frame.size.width, frame.size.height, isImageFlipped)
                    } else {
                        graphicOverlay!!.setImageSourceInfo(frame.size.height, frame.size.width, isImageFlipped)
                    }
                    val detector = FaceDetection.getClient(faceDetectorOptions)
                    detector.process(image)
                        .addOnSuccessListener { faces ->
                            for (face in faces) {
                                graphicOverlay?.add(FaceGraphic(graphicOverlay, face))
                            }
                        }
                }
            }
        })
        context.addLifecycleEventListener(object : LifecycleEventListener {
            override fun onHostResume() {
                lifecycleRegistry.currentState = Lifecycle.State.RESUMED
            }

            override fun onHostPause() {
                lifecycleRegistry.currentState = Lifecycle.State.CREATED
            }

            override fun onHostDestroy() {
                lifecycleRegistry.currentState = Lifecycle.State.DESTROYED
            }
        })

    }

    private inner class Listener:CameraListener(){
        override fun onVideoTaken(result: VideoResult) {
            Log.d("CameraView","결과")
            result.file.apply {
                // 동영상 파일 사용
                val name = SimpleDateFormat(FILENAME_FORMAT, Locale.KOREA)
                    .format(System.currentTimeMillis())
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, name)
                    put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4")
                    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.P) {
                        put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/Marble")
                    }
                }

                val contentResolver = context.contentResolver
                val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI,contentValues)

                uri?.let { outputUri ->
                    val outputStream = contentResolver.openOutputStream(outputUri)
                    outputStream?.use { outputStream ->
                        this.inputStream().copyTo(outputStream)
                    }
                }
                Toast.makeText(context, "동영상이 갤러리에 저장되었습니다.", Toast.LENGTH_SHORT).show()
            }
        }
        // 동영상 촬영 종료 리스너
        override fun onVideoRecordingEnd() {
            super.onVideoRecordingEnd()
            Log.d("CameraView","촬영 끝")
        }
        // 동영상 촬영 시작 리스너
        override fun onVideoRecordingStart() {
            Log.d("CameraView","촬영시작")
        }

    }







    @androidx.annotation.OptIn(ExperimentalCamera2Interop::class)
    fun isBackCameraLevel3Device(cameraProvider: ProcessCameraProvider) : Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return CameraSelector.DEFAULT_BACK_CAMERA
                .filter(cameraProvider.availableCameraInfos)
                .firstOrNull()
                ?.let { Camera2CameraInfo.from(it) }
                ?.getCameraCharacteristic(CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL) ==
                    CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_3
        }
        return false
    }


    companion object{
        private const val TAG = "CameraView"
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

    override fun getLifecycle(): Lifecycle {
        return lifecycleRegistry
    }
}