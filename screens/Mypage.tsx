import React, {useState, useEffect} from 'react';
import styled from '@emotion/native';
import colors from '../colors';
import {View, Image, TouchableOpacity, FlatList, Pressable} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ImagePickModal from '../components/ImagePickModal';
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
  title: string;
  img: any;
  option: string;
  setOption: React.Dispatch<React.SetStateAction<string>>;
};
const Option = ({title, img, option, setOption}: OptionProps) => {
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onPress={() => setOption(title)}>
      <RowView>
        <Image source={img} style={{width: 30, height: 30, marginRight: 10}} />
        <Text style={{fontSize: 20, lineHeight: 30, color: '#000000'}}>
          {title}
        </Text>
      </RowView>
      {option === title ? (
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

  const [optionToggle, setOptionToggle] = useState<boolean>(false);
  const [faceEditToggle, setFaceEditToggle] = useState<boolean>(false);
  const [option, setOption] = useState<string>('기본');
  const [modalToggle, setModalToggle] = useState<boolean>(false);

  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Implb25nZXVuQGdtYWlsLmNvbSIsImlhdCI6MTY4NzY5MDA0MCwiZXhwIjoxNjg3NjkzNjQwfQ.XQR8whlPv7AkSxg42Wifj4GWwz99rtQw7gBm472ZHt8';

  //api
  const getFaceData = async () => {
    const res = await axios.get(`${API_URL}user`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.images;
  };
  const deleteFaceData = async (id: number) => {
    const res = await axios.delete(`${API_URL}image/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  };

  const {data: faceData} = useQuery('faceData', getFaceData, {
    refetchOnWindowFocus: false,
    onError: error => console.log(error),
  });
  const {mutate} = useMutation((id: number) => deleteFaceData(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('faceData');
    },
    onError: error => console.log(error),
  });

  useEffect(() => {
    const getOption = async () => {
      const value = await AsyncStorage.getItem('@option');
      value !== null ? setOption(value) : null;
    };
    getOption();
  }, []);

  useEffect(() => {
    const saveOption = async () => {
      await AsyncStorage.setItem('@option', option);
    };
    saveOption();
  }, [option]);

  const optionData = [
    {
      id: 1,
      title: '기본',
      img: require('../assets/images/mozaic.png'),
    },
    {
      id: 2,
      title: '블러',
      img: require('../assets/images/blur.png'),
    },
    {
      id: 3,
      title: '표정',
      img: require('../assets/images/smile.png'),
    },
  ];

  return (
    <Container>
      <ImagePickModal toggle={modalToggle} setToggle={setModalToggle} />
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
        <RowView style={{justifyContent: 'space-between', marginBottom: 20}}>
          <Title>등록된 얼굴</Title>
          <TouchableOpacity onPress={() => setFaceEditToggle(!faceEditToggle)}>
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
            data={faceData}
            renderItem={({item, key}: any) => (
              <View style={{position: 'relative'}}>
                <FaceImage source={{uri: item.url}} />
                {faceEditToggle ? (
                  <DeleteCircle onPress={() => mutate(item.imageId)}>
                    <Text style={{color: `${colors.white}`, lineHeight: 17}}>
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
                <Pressable onPress={() => setModalToggle(!modalToggle)}>
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
            기본
          </Text>
          <Image
            source={require('../assets/images/right_arrow.png')}
            style={{width: 9, height: 18, marginLeft: 10}}
          />
        </TouchableOpacity>
      </WhiteBox>
      {optionToggle && (
        <WhiteBox style={{marginTop: 20}}>
          <OptionBox
            data={optionData}
            renderItem={({item}: any) => (
              <Option
                title={item.title}
                img={item.img}
                option={option}
                setOption={setOption}
              />
            )}
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
          />
          <RowView style={{marginTop: 10}}>
            <Image
              source={require('../assets/images/plus.png')}
              style={{width: 30, height: 30, marginRight: 10}}
            />
            <Text style={{fontSize: 20, color: `${colors.purple_40}`}}>
              추가하기
            </Text>
          </RowView>
        </WhiteBox>
      )}
    </Container>
  );
};

export default Mypage;
