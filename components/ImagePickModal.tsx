import React, {useState} from 'react';
import {Modal, View} from 'react-native';
import styled from '@emotion/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import colors from '../colors';

type props = {
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};
const ImagePickModal = ({toggle, setToggle}: props) => {
  const handleImagePicker = (type: string) => {
    if (type === 'library') {
      launchImageLibrary({mediaType: 'photo'});
    } else {
      launchCamera({mediaType: 'photo'});
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
