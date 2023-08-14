import React, {useState, useEffect} from 'react';
import styled from '@emotion/native';
import colors from '../colors';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Pressable,
  ScrollView,
  NativeModules,
  ImageSourcePropType,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import FaceImagePickModal from '../components/ImagePickModal';
import OptionImagePickModal from '../components/ImagePickModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_URL} from '../api';
import {useMutation, useQuery, useQueryClient} from 'react-query';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
`;

const Header = styled.View`
  width: 100%;
  height: 25%;
  background-color: ${colors.purple_20};
  border-style: solid;
  border-width: 1px;
  border-color: ${colors.purple_20};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  position: absolute;
  top: 0;
  left: 0;
`;

const Text = styled.Text`
  font-family: 'PretendardVariable';
`;

const WhiteBox = styled.View`
  width: 90%;
  padding: 20px;
  background-color: ${colors.white};
  border-style: solid;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${colors.white};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.Text`
  font-family: 'PretendardVariable';
  color: #000000;
  font-size: 17px;
  font-weight: 900;
  line-height: 23px;
`;

const OptionBox = styled.FlatList`
  width: 100%;
  background-color: ${colors.white};
  border-style: solid;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${colors.white};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const FaceImage = styled.Image`
  width: 100px;
  height: 100px;
  border-width: 1px;
  border-radius: 50px;
`;

const RowView = styled.View`
  display: flex;
  flex-direction: row;
`;

const DeleteCircle = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  background-color: #ff3868;
  border-style: solid;
  border-width: 1px;
  border-radius: 10px;
  border-color: #ff3868;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 5px;
  right: 5px;
`;

type OptionProps = {
  id: number;
  title: string;
  url: string;
  option: any;
  setOption: React.Dispatch<React.SetStateAction<any>>;
};
const Option = ({id, title, url, option, setOption}: OptionProps) => {
  const saveOptionImage = async (url: string) => {
    await AsyncStorage.setItem('@optionImage', url);
  };
  const clickOption = () => {
    setOption({id: id, title: title});
    if (title === '커스텀') {
      saveOptionImage(url);
    } else {
      saveOptionImage("");
    }
    console.log('ok');
  };

  return (
    <TouchableOpacity
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onPress={() => clickOption()}>
      <RowView>
        <Image
          source={title === '커스텀' ? {uri: url} : url}
          style={{width: 30, height: 30, marginRight: 10}}
        />
        <Text style={{fontSize: 20, lineHeight: 30, color: '#000000'}}>
          {title}
        </Text>
      </RowView>
      {option.id === id ? (
        <Image
          source={require(`../assets/images/check.png`)}
          style={{width: 30, height: 30}}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const Mypage = ({
  navigation: {navigate},
}: NativeStackScreenProps<any, 'Home'>) => {
  const queryClient = useQueryClient();
  const {CameraModule} = NativeModules;
  const [optionToggle, setOptionToggle] = useState<boolean>(false);
  const [faceEditToggle, setFaceEditToggle] = useState<boolean>(false);
  const [option, setOption] = useState<any>({id: -1, title: '기본'});
  const [faceModalToggle, setFaceModalToggle] = useState<boolean>(false);
  const [optionModalToggle, setOptionModalToggle] = useState<boolean>(false);
  const basicData = [
    {
      mosaicId: -1,
      title: '기본',
      url: require('../assets/images/mosaic.png'),
    },
    {
      mosaicId: -2,
      title: '블러',
      url: require('../assets/images/blur.png'),
    },
    {
      mosaicId: -3,
      title: '표정',
      url: require('../assets/images/smile.png'),
    },
  ];

  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Implb25nZXVuQGdtYWlsLmNvbSIsImlhdCI6MTY4NzcwNDM4NywiZXhwIjoxNjg3NzA3OTg3fQ.NMsgLH4jvnsA8q8RWd4d3KksvdIqRyw_81C9LPs0Vmc';

  //api
  const getUserData = async () => {
    const res = await axios.get(`${API_URL}user`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  };
  const deleteFaceData = async (id: number) => {
    const res = await axios.delete(`${API_URL}image/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  };

  const {isLoading, data} = useQuery('userData', getUserData, {
    refetchOnWindowFocus: false,
    onError: error => console.log(error),
  });

  const {mutate} = useMutation((id: number) => deleteFaceData(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('userData');
    },
    onError: error => console.log(error),
  });

  useEffect(() => {
    const getOption = async () => {
      const value = await AsyncStorage.getItem('@option');
      value !== null ? setOption(JSON.parse(value)) : null;
    };
    getOption();
  }, []);

  const getOptionImage = async () => {
    let value = await AsyncStorage.getItem('@optionImage');
    CameraModule.getImage(value);
  };

  useEffect(() => {
    const saveOption = async () => {
      await AsyncStorage.setItem('@option', JSON.stringify(option));
    };
    saveOption();
    CameraModule.getOption(option.id);
    if (option.id >= 0) {
      getOptionImage();
    }
  }, [option]);

  return (
    <Container>
      <FaceImagePickModal
        toggle={faceModalToggle}
        setToggle={setFaceModalToggle}
        mode={'image'}
      />
      <OptionImagePickModal
        toggle={optionModalToggle}
        setToggle={setOptionModalToggle}
        mode={'mosaic'}
      />
      {!isLoading ? (
        <>
          <Header>
            <RowView
              style={{
                alignItems: 'flex-start',
              }}>
              <TouchableOpacity onPress={() => navigate('Home')}>
                <Image
                  source={require('../assets/images/left_arrow.png')}
                  style={{width: 15, height: 30, marginRight: 10}}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: `${colors.white}`,
                  fontSize: 25,
                  fontWeight: '900',
                  lineHeight: 32,
                }}>
                마이페이지
              </Text>
            </RowView>
            <TouchableOpacity
              style={{
                width: 70,
                height: 30,
                borderStyle: 'solid',
                borderRadius: 20,
                backgroundColor: '#EEF1FF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: '900',
                  color: `${colors.purple_20}`,
                  lineHeight: 30,
                }}>
                로그아웃
              </Text>
            </TouchableOpacity>
          </Header>
          <WhiteBox style={{height: 200, marginTop: 80}}>
            <RowView
              style={{justifyContent: 'space-between', marginBottom: 20}}>
              <Title>등록된 얼굴</Title>
              <TouchableOpacity
                onPress={() => setFaceEditToggle(!faceEditToggle)}>
                {!faceEditToggle ? (
                  <Image
                    source={require('../assets/images/pencil.png')}
                    style={{width: 17, height: 17}}
                  />
                ) : (
                  <Image
                    source={require('../assets/images/check.png')}
                    style={{width: 25, height: 17}}
                  />
                )}
              </TouchableOpacity>
            </RowView>
            <RowView>
              <FlatList
                data={data.images}
                renderItem={({item, key}: any) => (
                  <View style={{position: 'relative'}}>
                    <FaceImage source={{uri: item.url}} />
                    {faceEditToggle ? (
                      <DeleteCircle onPress={() => mutate(item.imageId)}>
                        <Text
                          style={{color: `${colors.white}`, lineHeight: 17}}>
                          ㅡ
                        </Text>
                      </DeleteCircle>
                    ) : null}
                  </View>
                )}
                horizontal={true}
                ItemSeparatorComponent={() => <View style={{width: 10}} />}
                ListFooterComponent={() =>
                  faceEditToggle ? (
                    <Pressable
                      onPress={() => setFaceModalToggle(!faceModalToggle)}>
                      <Image
                        source={require('../assets/images/plus_circle.png')}
                        style={{marginLeft: 20}}
                      />
                    </Pressable>
                  ) : null
                }
              />
            </RowView>
          </WhiteBox>
          <WhiteBox
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 70,
            }}>
            <Title>모자이크 설정</Title>
            <TouchableOpacity
              style={{display: 'flex', flexDirection: 'row'}}
              onPress={() => setOptionToggle(!optionToggle)}>
              <Text
                style={{
                  color: `${colors.purple_40}`,
                  fontSize: 17,
                  lineHeight: 20,
                }}>
                {option.title}
              </Text>
              <Image
                source={require('../assets/images/right_arrow.png')}
                style={{width: 9, height: 18, marginLeft: 10}}
              />
            </TouchableOpacity>
          </WhiteBox>
          {optionToggle && (
            <WhiteBox style={{marginTop: 20, height: '40%'}}>
              <OptionBox
                data={data.mosaics}
                ListHeaderComponent={() =>
                  basicData.map(item => {
                    return (
                      <>
                        <Option
                          id={item.mosaicId}
                          title={item.title}
                          url={item.url}
                          option={option}
                          setOption={setOption}
                        />
                        <View style={{height: 10}} />
                      </>
                    );
                  })
                }
                renderItem={({item}: any) => (
                  <Option
                    id={item.mosaicId}
                    url={item.url}
                    title={'커스텀'}
                    option={option}
                    setOption={setOption}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{height: 10}} />}
              />
              <RowView style={{marginTop: 10}}>
                <Pressable
                  onPress={() => setOptionModalToggle(!optionModalToggle)}>
                  <Image
                    source={require('../assets/images/plus.png')}
                    style={{width: 30, height: 30, marginRight: 10}}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setOptionModalToggle(!optionModalToggle)}>
                  <Text style={{fontSize: 20, color: `${colors.purple_40}`}}>
                    추가하기
                  </Text>
                </Pressable>
              </RowView>
            </WhiteBox>
          )}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </Container>
  );
};

export default Mypage;
