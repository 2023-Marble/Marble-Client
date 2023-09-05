import android.Manifest
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.graphics.Rect
import android.graphics.YuvImage
import android.hardware.camera2.CameraCharacteristics
import android.media.Image
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.telecom.Call
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.ExperimentalCamera2Interop
import androidx.camera.core.CameraSelector
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat.startActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import com.marble.GraphicOverlay
import com.marble.R
import com.marble.VisionImageProcessor
import com.marble.api.ApiObject
import com.marble.api.FaceId
import com.marble.databinding.CameraViewBinding
import com.marble.facedetector.FaceGraphic
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.tasks.Tasks
import com.google.gson.JsonObject
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.otaliastudios.cameraview.CameraListener
import com.otaliastudios.cameraview.CameraView
import com.otaliastudios.cameraview.VideoResult
import com.otaliastudios.cameraview.controls.Facing
import com.otaliastudios.cameraview.controls.Mode
import com.otaliastudios.cameraview.frame.Frame
import com.otaliastudios.cameraview.frame.FrameProcessor
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Callback
import retrofit2.Response
import java.io.ByteArrayOutputStream
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Objects


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
    private var imageProcessor: VisionImageProcessor? = null
    private var faceGraphic :FaceGraphic? =null
    private var newBitmap: Bitmap? = null

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
            var targetUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI
            val intent = Intent(Intent.ACTION_VIEW,targetUri)
            (context.currentActivity)?.startActivityForResult(intent, 200)

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


        lifecycleRegistry = LifecycleRegistry(this)
        camera.setLifecycleOwner(this)
        camera.setMode(Mode.VIDEO)
        camera.open()
        camera.addCameraListener(Listener())
        val faceDetectorOptions = FaceDetectorOptions.Builder()
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .enableTracking()
            .build()
        val detector = FaceDetection.getClient(faceDetectorOptions)
        var faceIdList = listOf<Number>()
        var testedFaceId = listOf<Number>()
        camera.addFrameProcessor(object :FrameProcessor{
            private var lastTime = System.currentTimeMillis()
            @RequiresApi(Build.VERSION_CODES.Q)
            override fun process(frame: Frame) {
                val newTime = frame.time

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

                    val rotationDegrees = frame.rotationToView

                    val image = InputImage.fromBitmap(bitmap,rotationDegrees)
                    val isImageFlipped = lensFacing == Facing.FRONT
                    var matrix = Matrix()

                    if (rotationDegrees == 90 || rotationDegrees == 270) {
                        if(isImageFlipped){
                            matrix.setScale(-1f,1f,bitmap.width/2f,bitmap.height/2f)
                        }
                            matrix.postRotate(90f)

                        graphicOverlay!!.setImageSourceInfo(frame.size.height, frame.size.width, isImageFlipped)
                    } else {
                        graphicOverlay!!.setImageSourceInfo(frame.size.width, frame.size.height, isImageFlipped)
                   }
                    try{

                            Tasks.await(detector.process(image)
                            .addOnSuccessListener { faces ->
                                graphicOverlay!!.clear()
                                //var faceList = arrayListOf<Map<String, Any>>()
                                var faceList = JSONArray()
                                var faceBitmapList = mutableMapOf<Number,Bitmap>()
                                for(face in faces){
                                    newBitmap = Bitmap.createBitmap(bitmap,0,0,bitmap.width,bitmap.height,matrix,true)
                                    var left = face.boundingBox.left
                                    var top = face.boundingBox.top
                                    val width = face.boundingBox.width()
                                    val height = face.boundingBox.height()
                                    if( left< 0){
                                        left=0
                                    }
                                    if( top< 0){
                                        top = 0
                                    }
                                    var w = width
                                    var h = height
                                    if(left+width>newBitmap!!.width){
                                        w = width-(left+width-newBitmap!!.width)
                                    }
                                    if(top+height>newBitmap!!.height){
                                        h = height-(top+height-newBitmap!!.height)
                                    }
                                    if(w>0 && h>0){
                                        val faceBitmap = Bitmap.createBitmap(newBitmap!!,left,top,w,h)
//                                        graphicOverlay?.add(FaceGraphic(graphicOverlay,
//                                            face,
//                                            faceBitmap,context))
                                        val image = getBase64String(faceBitmap)

                                        //Log.d(TAG,"testedFaceId,${testedFaceId}")
                                        //if(!testedFaceId.contains(face.trackingId!!.toInt())){
                                            val jsonObject = JSONObject()
                                            jsonObject.put("id",face.trackingId)
                                            jsonObject.put("image",image)
                                            faceList.put(jsonObject)
                                            //jsonObject.put("y",face.
                                            //testedFaceId=testedFaceId+listOf(face.trackingId!!.toInt())
                                        //}

                                        faceBitmapList[face.trackingId!!]= faceBitmap

                                    }else{
                                        Log.d(TAG,"마이너스$w,$h")
                                    }

                                }

                                //api 호출
                                if(faceList.length()!=0){
                                    Log.d(TAG,"$faceList")
                                    val call = ApiObject.getRetrofitService.getFaceId(faceList)
                                    call.enqueue(object : Callback<FaceId> {
                                        override fun onResponse(
                                            call: retrofit2.Call<FaceId>,
                                            response: Response<FaceId>
                                        ) {
                                            if(response.isSuccessful) {
                                                var result= response.body()!!.id_list ?: listOf()
                                                result = result.mapNotNull { it.toString().toIntOrNull() }
                                                faceIdList=faceIdList+result

                                                Log.d(TAG,"list: $faceIdList")
                                                Log.d(TAG,"response: ${response.body()}")

                                            }else{
                                                Log.d(TAG,"리스폰스: ${response.errorBody()}")
                                                Log.d(TAG,"리스폰스: ${response.code()}")
                                                Log.d(TAG,"리스폰스: ${response}")
                                            }
                                        }
                                        override fun onFailure(call: retrofit2.Call<FaceId>, t: Throwable) {
                                            Log.e(TAG,"${t.printStackTrace()}")
                                        }
                                    })
                                }
                                val elementType = if (faceIdList.isNotEmpty()) {
                                    faceIdList[0]::class.simpleName // 첫 번째 요소의 타입 이름을 가져옵니다.
                                }else{

                                }
                                Log.d(TAG,"${elementType}")
                                //얼굴 모자이크 하기
                                for(face in faces){
                                    Log.d(TAG,"그리기:${faceIdList},${face.trackingId!!},${faceIdList.contains(face.trackingId!!.toInt())}")
                                    if(!faceIdList.contains(face.trackingId!!.toInt())){
                                        try{
                                            graphicOverlay?.add(FaceGraphic(graphicOverlay,
                                                face,
                                                faceBitmapList[face.trackingId!!]!!,context))
                                        }catch(e:Exception){
                                            Log.d(TAG,"$e")
                                        }


                                    }else{
                                        Log.d(TAG,"제외,${face.trackingId}")
                                    }
                              }

                            }
                            .addOnFailureListener{
                                graphicOverlay!!.clear()
                                    Log.e(TAG,"$it")
                            })
                    }catch (e:Exception){
                        Log.e(TAG,"error $e")
                    }


                }else if(frame.dataClass === Image::class.java){
                    val data: Image = frame.getData()
                    val jpegStream = ByteArrayOutputStream()
                    val jpegByteArray = jpegStream.toByteArray()
                    val bitmap = BitmapFactory.decodeByteArray(jpegByteArray,
                        0, jpegByteArray.size)
                    bitmap.toString()
                    val rotationDegrees = frame.rotationToUser
                    val image = InputImage.fromBitmap(bitmap,rotationDegrees)
                    val isImageFlipped = lensFacing == Facing.FRONT


                    if (rotationDegrees == 90 || rotationDegrees == 270) {
                        var matrix = Matrix()
                        matrix.postRotate(rotationDegrees.toFloat())
                        graphicOverlay!!.setImageSourceInfo(frame.size.height, frame.size.width, isImageFlipped)

                    } else {
                        graphicOverlay!!.setImageSourceInfo(frame.size.width, frame.size.height, isImageFlipped)
                    }
                    try{
                        Tasks.await(detector.process(image)
                            .addOnSuccessListener { faces ->
                                graphicOverlay!!.clear()
                                //Log.d(TAG,"${faces.size}")
                                for (face in faces) {
                                    Log.d(TAG,"face:$face")
                                    newBitmap = Bitmap.createBitmap(bitmap,0,0,bitmap.width,bitmap.height,matrix,true)
                                    var left = face.boundingBox.left
                                    var top = face.boundingBox.top
                                    val width = face.boundingBox.width()
                                    val height = face.boundingBox.height()
                                    if( left< 0){
                                        left=0
                                    }
                                    if( top< 0){
                                        top = 0
                                    }
                                    var w = width
                                    var h = height
                                    if(left+width>newBitmap!!.width){
                                        w = width-(left+width-newBitmap!!.width)
                                    }
                                    if(top+height>newBitmap!!.height){
                                        h = height-(top+height-newBitmap!!.height)
                                    }
                                    if(w>0 && h>0){
                                        val faceBitmap = Bitmap.createBitmap(newBitmap!!,left,top,w,h)

                                        Log.d(TAG,"faceBitmap : ${getBase64String(faceBitmap)}")
                                        graphicOverlay?.add(FaceGraphic(graphicOverlay, face,faceBitmap,context))
                                    }else{
                                        Log.d(TAG,"마이너스$w,$h")
                                    }

                                }

                            }
                            .addOnFailureListener{

                            })
                }catch (e:Exception){
                        Log.e(TAG,"error $e")
                }
                }
                frame.release()
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
    fun ReactContext.currentActivity(): Activity? {
        return currentActivity
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
                Toast.makeText(context, "동영상이 저장되었습니다.", Toast.LENGTH_SHORT).show()
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


    private fun getBase64String(bitmap: Bitmap): String? {
        val byteArrayOutputStream = ByteArrayOutputStream()
        val matrix = Matrix()
        var newBitmap = bitmap
        if(bitmap.width>112 || bitmap.height>112){
            newBitmap=Bitmap.createScaledBitmap(bitmap,112,112,true)
        }

        newBitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream)
        val imageBytes = byteArrayOutputStream.toByteArray()
        return Base64.encodeToString(imageBytes, Base64.NO_WRAP)
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
