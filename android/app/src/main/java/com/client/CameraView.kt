import android.Manifest
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.Toast
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.MediaStoreOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.PermissionChecker
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import com.client.R
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ThemedReactContext
import com.google.common.util.concurrent.ListenableFuture
import java.text.SimpleDateFormat
import java.util.Locale

class CameraView : FrameLayout, LifecycleOwner {
    val TAG = "CameraView"

    private lateinit var context: ThemedReactContext

    private lateinit var cameraProviderFuture : ListenableFuture<ProcessCameraProvider>
    private lateinit var lifecycleRegistry : LifecycleRegistry
    private lateinit var previewView: PreviewView
    private lateinit var linearlayout : LinearLayout
    private lateinit var imageButton: ImageButton
    private var videoCapture: VideoCapture<Recorder>? = null
    private var recording: Recording? = null

    private var camera: Camera? = null

    constructor(context: ThemedReactContext) : super(context) {
        this.context = context

        var layout = LayoutInflater.from(context).inflate(R.layout.camera_view, this, true) as FrameLayout

        previewView = layout.findViewById<PreviewView>(R.id.camera_view)
        previewView.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
            override fun onChildViewRemoved(parent: View?, child: View?) = Unit
            override fun onChildViewAdded(parent: View?, child: View?) {
                parent?.measure(
                    View.MeasureSpec.makeMeasureSpec(measuredWidth, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(measuredHeight, View.MeasureSpec.EXACTLY)
                )
                parent?.layout(0, 0, parent.measuredWidth, parent.measuredHeight)
            }
        })
        linearlayout=layout.findViewById<LinearLayout>(R.id.bottom_view)
        linearlayout.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
            override fun onChildViewRemoved(parent: View?, child: View?) = Unit
            override fun onChildViewAdded(parent: View?, child: View?) {
                parent?.measure(
                    View.MeasureSpec.makeMeasureSpec(measuredWidth, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(measuredHeight, View.MeasureSpec.EXACTLY)
                )
                parent?.layout(0, 0, parent.measuredWidth, parent.measuredHeight)
            }
        })
        imageButton = layout.findViewById<ImageButton>(R.id.recording_button)
        imageButton.setOnClickListener{
            captureVideo(imageButton)
        }

        startCamera()

        lifecycleRegistry = LifecycleRegistry(this)
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


    private fun startCamera() {
        cameraProviderFuture = ProcessCameraProvider.getInstance(this.context as Context)

        cameraProviderFuture.addListener(Runnable {
            try {
                val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()
                bindPreview(cameraProvider)
            } catch (e: Exception){
                Log.e(TAG, e.stackTraceToString())
            }
        }, ContextCompat.getMainExecutor(this.context as Context))
    }

    fun bindPreview(cameraProvider: ProcessCameraProvider) {
        val preview = Preview.Builder()
            .build()
            .also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }
        val recorder = Recorder.Builder()
            .setQualitySelector(QualitySelector.from(Quality.HIGHEST))
            .build()

        videoCapture = VideoCapture.withOutput(recorder)

        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        try {
            cameraProvider.unbindAll()
            camera = cameraProvider.bindToLifecycle(
                this, cameraSelector, preview, videoCapture
            )
        } catch (exc: Exception) {
            Log.e(TAG, "Use case binding failed", exc)
        }
    }

    private fun captureVideo(imageButton: ImageButton) {
        Log.d(TAG, "captureVideo실행")
        val videoCapture = this.videoCapture ?: return

        imageButton.isEnabled=false

        val curRecording = recording
        if (curRecording != null) {
            // Stop the current recording session.
            curRecording.stop()
            recording = null
            return
        }

        // create and start a new recording session
        val name = SimpleDateFormat(FILENAME_FORMAT, Locale.KOREA)
            .format(System.currentTimeMillis())
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, name)
            put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4")
            if (Build.VERSION.SDK_INT > Build.VERSION_CODES.P) {
                put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/Marble")
            }
        }

        val mediaStoreOutputOptions = MediaStoreOutputOptions
            .Builder(this.context.contentResolver, MediaStore.Video.Media.EXTERNAL_CONTENT_URI)
            .setContentValues(contentValues)
            .build()
        recording = videoCapture.output
            .prepareRecording(this.context,mediaStoreOutputOptions)
            .apply {
                if (PermissionChecker.checkSelfPermission(this@CameraView.context,
                        Manifest.permission.RECORD_AUDIO) ==
                    PermissionChecker.PERMISSION_GRANTED)
                {
                    withAudioEnabled()
                    Log.d(TAG,"준비완료")
                }
            }
            .start(ContextCompat.getMainExecutor(this.context)) { recordEvent ->
                Log.d(TAG,"start실행")
                when(recordEvent) {
                    is VideoRecordEvent.Start->{
                        imageButton.apply { isEnabled=true }
                        Log.d(TAG,"시작")
                    }
                    is VideoRecordEvent.Finalize -> {
                        if (!recordEvent.hasError()) {
                            val msg = "Video capture succeeded: " +
                                    "${recordEvent.outputResults.outputUri}"
                            Toast.makeText(this.context as Context, msg, Toast.LENGTH_SHORT)
                                .show()
                            Log.d(TAG, msg)
                        } else {
                            recording?.close()
                            recording = null
                            Log.e(
                                TAG, "Video capture ends with error: " +
                                        "${recordEvent.error}")
                        }
                        imageButton.apply { isEnabled=true }
                    }
                }
            }
        Log.d(TAG, "captureVideo실행 끝")
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