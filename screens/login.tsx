import React, {useEffect, useState} from 'react';
import {Image, Pressable} from 'react-native';
import colors from '../colors';
import styled from '@emotion/native';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';

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
const Login = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '1089118701812-h138oegtitdjg555ve33oebtb7tp3ini.apps.googleusercontent.com',
    });
  }, []);

  const [token, setToken] = useState<string>();

  const handleClickGoogleBtn = async () => {
    console.log('--------------------------------');
    await GoogleSignin.hasPlayServices();
    const {idToken} = await GoogleSignin.signIn();
    console.log('idToekn : ', idToken);
    if (idToken) {
      setToken(idToken);
    }
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
