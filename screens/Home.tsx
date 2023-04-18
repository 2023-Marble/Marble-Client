import React, {useEffect, useState, useRef} from 'react';
import styled, {css} from '@emotion/native';
import {View, Text} from 'react-native';
import {
  Camera,
  CameraPermissionStatus as PermissionStatus,
  CameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';

const Container = styled.View`
  flex: 1;
  height: 500px;
`;

const CameraButton = styled.TouchableOpacity`
  width: 100px;
  background-color: purple;
  border-radius: 50px;
`;

const Home = () => {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>();
  const [microphonePermissionsion, setMicrophonePermission] =
    useState<PermissionStatus>();
  const [device, setDevice] = useState<CameraDevice | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const devices = useCameraDevices();
  const camera = useRef<Camera | null>(null);

  //카메라, 마이크 권한 부여 여부 확인
  useEffect(() => {
    (async () => {
      const camera: PermissionStatus = await Camera.getCameraPermissionStatus();
      const microphone: PermissionStatus =
        await Camera.getMicrophonePermissionStatus();
      setCameraPermission(camera);
      setMicrophonePermission(microphone);
      console.log(camera);
    })();
  }, []);

  // 카메라, 마이크 권한 상태가 not-determined 일 경우 권한 요청, 카메라 autorized알 경우 기기설정
  useEffect(() => {
    (async () => {
      if (cameraPermission === 'not-determined') {
        setCameraPermission(await Camera.requestCameraPermission());
      } else if (cameraPermission === 'authorized') {
        console.log('back', devices);
        if (devices.back !== null) {
          setDevice(devices.back!);
        }
      }
      if (microphonePermissionsion === 'not-determined') {
        setMicrophonePermission(await Camera.requestMicrophonePermission());
      }
    })();
  }, [cameraPermission, microphonePermissionsion, devices.back]);

  const startRecording = async () => {
    setIsRecording(!isRecording);
    await camera.current?.startRecording({
      flash: 'on',
      onRecordingFinished: video => console.log(video),
      onRecordingError: error => console.error('startRecording:', error),
    });
  };

  if (device == null) {
    return (
      <Container>
        <Text>카메라 권한이 없습니다.</Text>
      </Container>
    );
  }
  return (
    <>
      <Container>
        <Camera
          ref={camera}
          style={{width: '100%', height: '90%'}}
          device={device}
          isActive={isRecording}
          video={true}
          audio={true}
        />
        <CameraButton onPress={startRecording}>
          <Text>시작</Text>
        </CameraButton>
      </Container>
    </>
  );
};

export default Home;
