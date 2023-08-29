import React, {useContext, useEffect, useState} from 'react';
import {Image, Pressable} from 'react-native';
import colors from '../colors';
import styled from '@emotion/native';
import {GoogleSignin, User} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import {oauth} from '../config/oauth';
import {API_URL} from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TokenContext} from '../App';

const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.white};
  padding-top: 100px;
`;

const Text = styled.Text`
  font-family: 'PretendardVariable';
`;

const Button = styled.Pressable`
  width: 80%;
  height: 50px;
  border-radius: 25px;
  border-style: solid;
  background-color: ${colors.purple_20};
  margin-top: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Login = ({
  navigation: {navigate},
}: NativeStackScreenProps<any, 'Home'>) => {
  const {setToken} = useContext(TokenContext);

  useEffect(() => {
    const socialGoogleConfigure = async () => {
      await GoogleSignin.configure({
        webClientId: oauth.GOOGLE_CLIENT_ID,
      });
    };
    socialGoogleConfigure();
  }, []);

  const handleClickGoogleBtn = async () => {
    console.log('클릭');
    await GoogleSignin.hasPlayServices();
    try {
      const userInfo = await GoogleSignin.signIn();

      if (userInfo) {
        const token = await GoogleSignin.getTokens();
        googleSignin(token.accessToken);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const googleSignin = async (accessToken: string) => {
    const res = await axios.post(`${API_URL}auth/google/signin`, {
      accessToken: accessToken,
    });
    await AsyncStorage.setItem('@refreshToken', JSON.stringify(res.data.token));
    setToken(res.data.token);
    navigate('Home');
  };

  return (
    <Container>
      <Image
        source={require('../assets/images/logo.png')}
        style={{width: 155, height: 150, marginBottom: 20}}
      />
      <Image
        source={require('../assets/images/marble.png')}
        style={{width: 303, marginBottom: 10}}
      />
      <Text style={{color: `${colors.purple_30}`, textAlign: 'center'}}>
        당신의 카메라{'\n'} 아름다운 순간을 기록하세요.
      </Text>
      <Button>
        <Pressable onPress={handleClickGoogleBtn}>
          <Text
            style={{
              color: `${colors.white}`,
              fontSize: 18,
              fontWeight: '900',
              lineHeight: 50,
            }}>
            시작하기
          </Text>
        </Pressable>
      </Button>
    </Container>
  );
};

export default Login;
