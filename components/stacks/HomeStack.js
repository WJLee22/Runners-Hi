import React, { useEffect } from 'react';
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
					navigation.popToTop(); // HomeScreen으로 이동
					return true; // 기본 뒤로가기 동작을 막음
				}
				return false; // 기본 뒤로가기 동작을 허용
			}
		);

		return () => backHandler.remove(); // 컴포넌트가 unmount되면 event listener 제거
	}, [navigation]);

	return (
		<Stack.Navigator>
			<Stack.Screen
				name="HomeScreen"
				component={Home}
				options={{
					headerShown: null, // 헤더 숨기기
					headerLeft: null, // 뒤로가기 버튼 숨기기
				}}
			/>
			<Stack.Screen
				name="CreateRunning"
				component={CreateRunning}
				options={{
					headerTitle: '새로운 모임 생성',
					headerShown: null, // 헤더 숨기기
				}}
			/>
			<Stack.Screen
				name="RunningDetail"
				component={RunningDetail}
				options={{
					headerTitle: 'Running Detail',
				}}
			/>
		</Stack.Navigator>
	);
}
