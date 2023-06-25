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

};
const ImagePickModal = ({toggle, setToggle}: props) => {
  const queryClient = useQueryClient();
  //api 호출
  const addFaceData = async (url: string) => {
    const res = await axios.post(
      `${API_URL}image`,
      {
        url: url,
      },
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Implb25nZXVuQGdtYWlsLmNvbSIsImlhdCI6MTY4NzY5MDA0MCwiZXhwIjoxNjg3NjkzNjQwfQ.XQR8whlPv7AkSxg42Wifj4GWwz99rtQw7gBm472ZHt8',
        },
      },
    );
    return res.data;
  };

  const {mutate} = useMutation((url: string) => addFaceData(url), {
    onSuccess: () => {
      queryClient.invalidateQueries('faceData');
    },
    onError: error => console.log(error),
  });

  const handleImagePicker = async (type: string) => {
    if (type === 'library') {
      await launchImageLibrary({mediaType: 'photo'}, async (res: any) => {
        res?.assets && mutate(res?.assets[0]?.uri);
      });
    } else {
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
