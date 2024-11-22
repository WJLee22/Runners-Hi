import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';

import Home from './Home';
import MyPage from './MyPage';
import MyRunning from './MyRunning';
import RunningHome from './RunningHome';
import ProfileEdit from './ProfileEdit'; // ProfileEdit 화면 가져오기

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MyPageStack() {
  return (
    <Stack.Navigator>
      {/* MyPage 기본 화면 */}
      <Stack.Screen
        name="MyPage"
        component={MyPage}
        options={{ headerShown: false }} // MyPage의 헤더 숨기기
      />
      {/* ProfileEdit 화면 */}
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEdit}
        options={{
          headerTitle: '프로필 수정', // 헤더 제목 설정
          headerStyle: { backgroundColor: '#6200ea' },
          headerTintColor: '#fff', // 헤더 텍스트 색상
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainApp() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="RunningHome" component={RunningHome} />
      <Tab.Screen name="MyRunning" component={MyRunning} />
      {/* MyPageStack으로 MyPage와 ProfileEdit 포함 */}
      <Tab.Screen name="MyPage" component={MyPageStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
