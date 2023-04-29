import React, {useEffect, useState, useRef, useCallback} from 'react';
import styled from '@emotion/native';
import {StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Camera,
  CameraPermissionStatus as PermissionStatus,
  CameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';
import colors from '../colors';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const Top = styled.View`
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  height: 10%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;
  padding-left: 20px;
  padding-right: 20px;
  Text {
    color: ${colors.white};
  }
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

const Home = () => {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>();
  const [microphonePermissionsion, setMicrophonePermission] =
    useState<PermissionStatus>();
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const camera = useRef<Camera | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number | null>(null);

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
      intervalId = setInterval(() => {
        const now = new Date().getTime();
        setDuration(Math.round((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [startTime]);

  const handleRecordingButton = async () => {
    if (isRecording) {
      setDuration(null);
      await camera.current?.stopRecording();
    } else {
      setStartTime(new Date().getTime());
      await camera.current?.startRecording({
        flash: 'on',
        onRecordingFinished: video => console.log(video),
        onRecordingError: error => console.error('startRecording:', error),
      });
    }
    setIsRecording(!isRecording);
  };

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);

  console.log(device?.devices);
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
      <Top>
        <Text>{duration}</Text>
        <TouchableOpacity onPress={onFlipCameraPressed}>
          <TopImage source={require('../assets/images/camera_flip.png')} />
        </TouchableOpacity>
      </Top>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />
      <Bottom>
        <TouchableOpacity onPress={handleRecordingButton}>
          <BottomImage source={require('../assets/images/mypage_btn.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRecordingButton}>
          <BottomImage source={require('../assets/images/camera_btn.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRecordingButton}>
          <BottomImage source={require('../assets/images/mypage_btn.png')} />
        </TouchableOpacity>
      </Bottom>
    </Container>
  );
};

export default Home;
