import React, {useState} from 'react';
import styled from '@emotion/native';
import colors from '../colors';
import {View, Image, TouchableOpacity, FlatList} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

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
  top: 0;
  right: 0;
`;

type OptionProps = {
  title: string;
  img: string;
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
        <Image
          source={{uri: img}}
          style={{width: 30, height: 30, marginRight: 10}}
        />
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
  const [optionToggle, setOptionToggle] = useState<boolean>(false);
  const [faceEditToggle, setFaceEditToggle] = useState<boolean>(false);
  const [option, setOption] = useState<string>('기본');

  const optionData = [
    {
      id: 1,
      title: '기본',
      img: 'https://img.freepik.com/free-vector/white-abstract-background_23-2147782582.jpg?w=740&t=st=1683524314~exp=1683524914~hmac=848da941776a19b444ba69e7cb81aa6b8e654005ce63b3ae95aab081c145c4ee',
    },
    {
      id: 2,
      title: '블러',
      img: 'https://img.freepik.com/free-vector/drop_53876-59938.jpg?w=740&t=st=1683524648~exp=1683525248~hmac=eaa3c5b0b07376c8ad569644cc7e890f0fcf741fc6593af3baa0edf5e4f1c16f',
    },
    {
      id: 3,
      title: '표정',
      img: 'https://cdn.icon-icons.com/icons2/2716/PNG/512/smiley_icon_172891.png',
    },
  ];

  const faceData = [
    {
      id: 1,
      img: 'https://img.freepik.com/free-psd/close-up-on-kid-expression-portrait_23-2150193262.jpg?w=740&t=st=1683521439~exp=1683522039~hmac=d13020e49927c1c88e9a189050509007f030aa99eeb7384cb362d1495b089785',
    },
    {
      id: 2,
      img: 'https://img.freepik.com/free-psd/close-up-on-kid-expression-portrait_23-2150193262.jpg?w=740&t=st=1683521439~exp=1683522039~hmac=d13020e49927c1c88e9a189050509007f030aa99eeb7384cb362d1495b089785',
    },
    {
      id: 3,
      img: 'https://img.freepik.com/free-psd/close-up-on-kid-expression-portrait_23-2150193262.jpg?w=740&t=st=1683521439~exp=1683522039~hmac=d13020e49927c1c88e9a189050509007f030aa99eeb7384cb362d1495b089785',
    },
    {
      id: 4,
      img: 'https://img.freepik.com/free-psd/close-up-on-kid-expression-portrait_23-2150193262.jpg?w=740&t=st=1683521439~exp=1683522039~hmac=d13020e49927c1c88e9a189050509007f030aa99eeb7384cb362d1495b089785',
    },
  ];

  return (
    <Container>
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
            renderItem={({item}: any) => (
              <View style={{position: 'relative'}}>
                <FaceImage source={{uri: item.img}} />
                {faceEditToggle ? (
                  <DeleteCircle>
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
                <Image
                  source={require('../assets/images/plus_circle.png')}
                  style={{marginLeft: 20}}
                />
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
