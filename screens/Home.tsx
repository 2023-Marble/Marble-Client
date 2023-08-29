import React, {useEffect, useState, useRef, useCallback} from 'react';
import styled from '@emotion/native';
import {Text, TouchableOpacity, NativeModules} from 'react-native';
import {
  Camera,
  CameraPermissionStatus as PermissionStatus,
  useCameraDevices,
  useCameraFormat,
} from 'react-native-vision-camera';
import colors from '../colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import CameraView from '../components/CameraView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
  position: relative;
`;

const Duration = styled.Text`
  position: absolute;
  top: 20px;
  left: 20px;
  color: ${colors.white};
  width: 50px;
  height: 30px;
  background-color: ${colors.purple_40};
  padding: 5px;
  display: flex;
  text-align: center;
  align-items: center;
  border-style: solid;
  border-color: ${colors.purple_40};
  border-width: 1px;
  border-radius: 10px;
  z-index: 9999;
`;

const BottomImage = styled.Image`
  width: 60px;
  height: 60px;
`;

const Home = ({
  navigation: {navigate},
}: NativeStackScreenProps<any, 'Mypage'>) => {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>();
  const [microphonePermissionsion, setMicrophonePermission] =
    useState<PermissionStatus>();
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'front',
  );
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const format = useCameraFormat(device);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<string | null>(null);
  const {CameraModule} = NativeModules;

  const getOptionImage = async () => {
    let value = await AsyncStorage.getItem('@optionImage');
    CameraModule.getImage(value);
  };
  //설정되어있는 옵션 가져오기
  useEffect(() => {
    const getOption = async () => {
      const value = await AsyncStorage.getItem('@option');
      if (value !== null) {
        CameraModule.getOption(JSON.parse(value).id);
        if (JSON.parse(value).id >= 0) {
          getOptionImage();
      }
      }
    };
    getOption();
  }, []);

  //카메라, 마이크 권한 부여 여부 확인
  useEffect(() => {
    (async () => {
      const camera: PermissionStatus = await Camera.getCameraPermissionStatus();
      const microphone: PermissionStatus =
        await Camera.getMicrophonePermissionStatus();
      setCameraPermission(camera);
      setMicrophonePermission(microphone);
    })();
  }, []);

  // 카메라, 마이크 권한 상태가 not-determined 일 경우 권한 요청
  // useEffect(() => {
  //   (async () => {
  //     if (cameraPermission === 'not-determined') {
  //       setCameraPermission(await Camera.requestCameraPermission());
  //     }
  //     if (microphonePermissionsion === 'not-determined') {
  //       setMicrophonePermission(await Camera.requestMicrophonePermission());
  //     }
  //   })();
  // }, [cameraPermission, microphonePermissionsion]);

  // useEffect(() => {
  //   let intervalId: number;
  //   if (isRecording) {
  //     setDuration('00:00');
  //     intervalId = setInterval(() => {
  //       const now = new Date().getTime();
  //       const duration = now - startTime;
  //       if (duration >= 3600000) {
  //         setDuration(
  //           `${String(Math.floor((duration / (1000 * 60 * 60)) % 24))}:${String(
  //             Math.floor((duration / (1000 * 60)) % 60),
  //           ).padStart(2, '0')}`,
  //         );
  //       } else {
  //         setDuration(
  //           `${String(Math.floor((duration / (1000 * 60)) % 60)).padStart(
  //             2,
  //             '0',
  //           )}:${String(Math.floor((duration / 1000) % 60)).padStart(2, '0')}`,
  //         );
  //       }
  //     }, 1000);
  //   }
  //   return () => clearInterval(intervalId);
  // }, [isRecording]);

  console.log(device?.supportsParallelVideoProcessing);
  if (cameraPermission !== 'authorized') {
    return (
      <Container>
        <Text>카메라 권한이 없습니다.</Text>
      </Container>
    );
  }
  if (microphonePermissionsion !== 'authorized') {
    return (
      <Container>
        <Text>마이크 권한이 없습니다.</Text>
      </Container>
    );
  }
  if (device === null || device === undefined) {
    return (
      <Container>
        <Text>기기를 찾을 수 없습니다.</Text>
      </Container>
    );
  }
  return (
    <Container>
      {isRecording && <Duration>{duration}</Duration>}
      <CameraView style={{width: '100%', height: '100%'}} />
      <TouchableOpacity
        onPress={() => navigate('Mypage')}
        style={{zIndex: 9999, position: 'absolute', bottom: 12, right: 40}}>
        <BottomImage source={require('../assets/images/mypage_btn.png')} />
      </TouchableOpacity>
    </Container>
  );
};

export default Home;
