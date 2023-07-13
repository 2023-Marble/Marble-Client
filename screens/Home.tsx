import React, {useEffect, useState, useRef, useCallback} from 'react';
import styled from '@emotion/native';
import {StyleSheet, Text, TouchableOpacity, NativeModules} from 'react-native';
import {
  Camera,
  CameraPermissionStatus as PermissionStatus,
  useCameraDevices,
  useCameraFormat,
} from 'react-native-vision-camera';
import colors from '../colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import CameraView from '../components/CameraView';

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

const Bottom = styled.View`
  position: absolute;
  bottom: 0;
  left: 0%;
  width: 100%;
  height: 10%;
  background-color: ${colors.white};
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
const BottomImage = styled.Image`
  width: 60px;
  height: 60px;
`;
const TopImage = styled.Image`
  width: 30px;
  height: 25px;
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
  const camera = useRef<Camera | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<string | null>(null);
  //const {CameraView}=NativeModules;

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
  useEffect(() => {
    (async () => {
      if (cameraPermission === 'not-determined') {
        setCameraPermission(await Camera.requestCameraPermission());
      }
      if (microphonePermissionsion === 'not-determined') {
        setMicrophonePermission(await Camera.requestMicrophonePermission());
      }
    })();
  }, [cameraPermission, microphonePermissionsion]);

  useEffect(() => {
    let intervalId: number;
    if (isRecording) {
      setDuration('00:00');
      intervalId = setInterval(() => {
        const now = new Date().getTime();
        const duration = now - startTime;
        if (duration >= 3600000) {
          setDuration(
            `${String(Math.floor((duration / (1000 * 60 * 60)) % 24))}:${String(
              Math.floor((duration / (1000 * 60)) % 60),
            ).padStart(2, '0')}`,
          );
        } else {
          setDuration(
            `${String(Math.floor((duration / (1000 * 60)) % 60)).padStart(
              2,
              '0',
            )}:${String(Math.floor((duration / 1000) % 60)).padStart(2, '0')}`,
          );
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  // 녹화 시작, 중단
  const handleRecordingButton = async () => {
    // if (isRecording) {
    //   setDuration(null);
    //   await camera.current?.stopRecording();
    // } else {
    //   setStartTime(new Date().getTime());
    //   await camera.current?.startRecording({
    //     flash: 'on',
    //     onRecordingFinished: (video: any) =>
    //       CameraRoll.save(video.path, {type: 'video', album: 'Marble'}),
    //     onRecordingError: (error: any) =>
    //       console.error('startRecording:', error),
    //   });
    // }
    // setIsRecording(!isRecording);
    //CameraView.captureVideo();
  };

  //화면 전환
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);

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
      <TouchableOpacity
        onPress={onFlipCameraPressed}
        style={{position: 'absolute', top: 20, right: 20, zIndex: 9999}}>
        <TopImage source={require('../assets/images/camera_flip.png')} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRecordingButton}
        style={{zIndex: 9999, position: 'absolute', bottom: 20, left: 30}}>
        <BottomImage
          source={require('../assets/images/camera_gallery.png')}
          style={{width: 45, height: 45, marginLeft: 15}}
        />
      </TouchableOpacity>
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
