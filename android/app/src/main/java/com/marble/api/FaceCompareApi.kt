package com.marble.api

import com.google.gson.JsonObject
import org.json.JSONArray
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

interface FaceCompareApi {
    @Headers("Content-Type: application/json")  // Set the desired headers
    @POST("process_frame")
    fun getFaceId(@Body req: JSONArray): Call<FaceId>
}

