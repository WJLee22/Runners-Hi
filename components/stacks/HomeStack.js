import React, { useEffect } from 'react';
import { Image } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { BackHandler } from 'react-native'; // BackHandler를 사용하여 뒤로가기 이벤트 처리
import Home from '../home/Home';
import CreateRunning from '../../components/home/CreateRunning';
import RunningDetail from '../../components/home/RunningDetail';

const Stack = createStackNavigator();

export default function HomeStack({ navigation }) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 'HomeScreen'으로 돌아가게 설정
        if (navigation.canGoBack()) {
          return true; // 기본 뒤로가기 동작을 막음
        }
        return false; // 기본 뒤로가기 동작을 허용
      }
    );

    return () => backHandler.remove(); // 컴포넌트가 unmount되면 event listener 제거
  }, [navigation]);

  return (
    <Stack.Navigator>
      {/* Home Screen */}
      <Stack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          headerTitle: () => (
            <Image
              source={require('../../assets/applogo.png')} // 로고 이미지 경로
              style={{ width: 129, height: 50 }} // 로고 크기 조정
            />
          ),
        }}
      />

      {/* Create Running Screen */}
      <Stack.Screen
        name="CreateRunning"
        component={CreateRunning}
        options={{
          headerTitle: () => (
            <Image
              source={require('../../assets/applogo.png')} // 로고 이미지 경로
              style={{ width: 129, height: 50 }} // 로고 크기 조정
            />
          ),
          headerBackTitleVisible: false, // 뒤로가기 버튼 텍스트 숨김
          headerTintColor: '#7C4DFF', // 뒤로가기 버튼 색상 (연보라색)
        }}
      />

      {/* Running Detail Screen */}
      <Stack.Screen
        name="RunningDetail"
        component={RunningDetail}
        options={{
          headerTitle: () => (
            <Image
              source={require('../../assets/applogo.png')} // 로고 이미지 경로
              style={{ width: 129, height: 50 }} // 로고 크기 조정
            />
          ),
          headerBackTitleVisible: false, // 뒤로가기 버튼 텍스트 숨김
          headerTintColor: '#7C4DFF', // 뒤로가기 버튼 색상 (연보라색)
        }}
      />
    </Stack.Navigator>
  );
}
