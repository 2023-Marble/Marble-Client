import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import styled from '@emotion/native';
import colors from '../colors';
import {Text} from 'react-native';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const Mypage = () => {
  return (
    <Container>
      <Text>마이페이지</Text>
    </Container>
  );
};

export default Mypage;
