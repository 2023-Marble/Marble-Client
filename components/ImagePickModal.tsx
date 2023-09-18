import React, {useContext, useState} from 'react';
import {Modal, View} from 'react-native';
import styled from '@emotion/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import colors from '../colors';
import axios from 'axios';
import {API_URL} from '../api';
import {useQueryClient, useMutation} from 'react-query';
import {TokenContext} from '../App';
type props = {
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
};
const ImagePickModal = ({toggle, setToggle, mode}: props) => {
  const {token} = useContext(TokenContext);
  const queryClient = useQueryClient();
  //api 호출
  const addUserData = async (file: Object) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_URL}${mode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const {mutate} = useMutation((file: Object) => addUserData(file), {
    onSuccess: () => {
      queryClient.invalidateQueries('userData');
    },
    onError: error => console.log(error),
  });

  const handleImagePicker = async (type: string) => {
    if (type === 'library')
      await launchImageLibrary({mediaType: 'photo'}, async (res: any) => {
        res?.assets &&
          mutate({
            name: res.assets[0].fileName,
            type: res.assets[0].type,
            uri: res.assets[0].uri,
          });
      });
    else {
      await launchCamera({mediaType: 'photo'}, async (res: any) => {
        res?.assets &&
          mutate({
            name: res.assets[0].fileName,
            type: res.assets[0].type,
            uri: res.assets[0].uri,
          });
      });
    }
    setToggle(!toggle);
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
