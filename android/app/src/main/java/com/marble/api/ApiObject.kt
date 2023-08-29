package com.marble.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiObject {
    private val BASE_URL = "https://5c4b92d73cf13da4.ngrok.app/"

    private val getRetrofit by lazy{
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val getRetrofitService : FaceCompareApi by lazy { getRetrofit.create(FaceCompareApi::class.java) }
}