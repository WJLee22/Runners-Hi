import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons'; // 여러 아이콘 세트 추가

import { StyleSheet, Image } from 'react-native';

import HomeStack from './stacks/HomeStack';
import MyPageStack from './stacks/MyPageStack';

import MyRunning from './myrunning/MyRunning';
import RunningHomeStack from './stacks/RunningHomeStack';

const Tab = createBottomTabNavigator();

export default function MainApp() {
	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={{
				tabBarStyle: {
					height: 60, // 탭 바 높이 조정 (필요 시)
					paddingBottom: 8, // 아이콘과 텍스트 위치 조정
				},
				tabBarActiveTintColor: '#6039ea', // 활성 상태 색상
				tabBarInactiveTintColor: '#ccc', // 비활성 상태 색상
			}}
		>
			{/* Home 탭 */}
			<Tab.Screen
				name="Home"
				component={HomeStack}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('../assets/home.png')}
							style={{
								width: 30,
								height: 30,
								tintColor: focused ? '#6039ea' : '#ccc', // 색상 통일
							}}
						/>
					),
					headerShown: false,
				}}
			/>

			{/* RunningHome 탭 */}
			<Tab.Screen
				name="RunningHome"
				component={RunningHomeStack}
				options={{
					headerShown: false, // 헤더 숨김
					tabBarIcon: ({ focused }) => (
						<MaterialIcons
							name="directions-run" // 달리기 아이콘
							size={30}
							color={focused ? '#6039ea' : '#ccc'} // 색상 통일
						/>
					),
				}}
			/>

			{/* MyRunning 탭 */}
			<Tab.Screen
				name="MyRunning"
				component={MyRunning}
				options={{
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="stats-chart" // 러닝 통계 아이콘
							size={30}
							color={focused ? '#6039ea' : '#ccc'} // 색상 통일
						/>
					),
					headerShown: false, // 헤더 숨김
				}}
			/>

			{/* MyPage 탭 */}
			<Tab.Screen
				name="MyPage"
				component={MyPageStack}
				options={{
					tabBarIcon: ({ focused }) => (
						<FontAwesome
							name="user-circle" // 사용자 프로필 아이콘
							size={30}
							color={focused ? '#6039ea' : '#ccc'} // 색상 통일
						/>
					),
					headerShown: false, // 헤더 숨김
				}}
			/>
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
