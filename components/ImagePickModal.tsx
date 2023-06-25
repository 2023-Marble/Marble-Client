import React, {useState} from 'react';
import {Modal, View} from 'react-native';
import styled from '@emotion/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import colors from '../colors';
import axios from 'axios';
import {API_URL} from '../api';
import {useQueryClient, useMutation} from 'react-query';

type props = {
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
};
const ImagePickModal = ({toggle, setToggle, mode}: props) => {
  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Implb25nZXVuQGdtYWlsLmNvbSIsImlhdCI6MTY4NzcwNDM4NywiZXhwIjoxNjg3NzA3OTg3fQ.NMsgLH4jvnsA8q8RWd4d3KksvdIqRyw_81C9LPs0Vmc';
  const queryClient = useQueryClient();
  //api 호출
  const addUserData = async (url: string) => {
    const res = await axios.post(
      `${API_URL}${mode}`,
      {
        url: url,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
    return res.data;
  };

  const {mutate} = useMutation((url: string) => addUserData(url), {
    onSuccess: () => {
      queryClient.invalidateQueries('userData');
    },
    onError: error => console.log(error),
  });

  const handleImagePicker = async (type: string) => {
    if (type === 'library')
      await launchImageLibrary({mediaType: 'photo'}, async (res: any) => {
        res?.assets && mutate(res?.assets[0]?.uri);
      });
    else {
      await launchCamera({mediaType: 'photo'}, async (res: any) => {
        res?.assets && mutate(res?.assets[0]?.uri);
      });
    }
  };

  const Container = styled.Pressable`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  `;

  const Box = styled.Pressable`
    width: 80%;
    height: 200px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: ${colors.white};
    border-radius: 20px;
    padding: 20px;
  `;
  const Button = styled.Pressable`
    width: 80%;
    height: 60px;
    background-color: ${colors.purple_20};
    display: flex;
    align-items: center;
    justify-content: center;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    border-color: ${colors.purple_20};
  `;

  const Text = styled.Text`
    font-family: 'PretendardVariable';
    font-weight: 900;
    color: ${colors.white};
    font-size: 18px;
  `;
  return (
    <Modal visible={toggle} transparent={true}>
      <Container onPress={() => setToggle(!toggle)}>
        <Box onPress={e => e.defaultPrevented}>
          <Button onPress={() => handleImagePicker('library')}>
            <Text>갤러리</Text>
          </Button>
          <Button onPress={() => handleImagePicker('capture')}>
            <Text>카메라</Text>
          </Button>
        </Box>
      </Container>
    </Modal>
  );
};

export default ImagePickModal;
