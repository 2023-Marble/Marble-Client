import React from 'react';
import {Image} from 'react-native';
import colors from '../colors';
import styled from '@emotion/native';

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
        <Text
          style={{
            color: `${colors.white}`,
            fontSize: 18,
            fontWeight: 900,
            lineHeight: 50,
          }}>
          시작하기
        </Text>
      </Button>
    </Container>
  );
};

export default Login;
