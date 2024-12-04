import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// 각 화면 컴포넌트
import RecruitingScreen from './RecruitingScreen';
import ParticipantListScreen from './ParticipantListScreen';
import ChatScreen from './ChatScreen';

export default function RunningHome() {
  const Stack = createStackNavigator(); // Stack Navigator 생성

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header, // 상단바 스타일
        headerTintColor: '#fff', // 상단바 텍스트 색상
        headerTitleStyle: styles.headerTitle, // 상단바 제목 스타일
        headerTitleAlign: 'center', // 제목 중앙 정렬
      }}
    >
      <Stack.Screen
        name="Recruiting"
        component={RecruitingScreen}
        options={{
          title: '참가중',
        }}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantListScreen}
        options={{
          title: '참가자 관리',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: '채팅방',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50, // 상단 바 높이를 얇게 설정
    backgroundColor: '#673AB7', // 보라색 배경
    justifyContent: 'center', // 세로 중앙 정렬
    paddingHorizontal: 15, // 좌우 패딩 추가
  },
  headerTitle: {
    fontSize: 18, // 제목 폰트 크기
    fontWeight: 'bold',
  },
});
