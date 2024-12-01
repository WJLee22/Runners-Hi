import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

import RecruitingScreen from './RecruitingScreen';
import ParticipantsScreen from './ParticipantScreen';

export default function RunningHome() {
	const TopTab = createMaterialTopTabNavigator();

	const [isRecruiting, setIsRecruiting] = useState(true); // 모집 상태
	const [participants, setParticipants] = useState(['User1', 'User2', 'User3']); // 참가자 목록

	// 상태 전환 핸들러
	const toggleRecruiting = () => setIsRecruiting(!isRecruiting);

	return (
		<TopTab.Navigator
			screenOptions={{
				tabBarStyle: {
					backgroundColor: '#6200ea', // 탭 바의 배경색
				},
				tabBarActiveTintColor: '#fff', // 선택된 탭의 텍스트 색상
				tabBarInactiveTintColor: '#ccc', // 비선택된 탭의 텍스트 색상
				tabBarLabelStyle: {
					fontSize: 14, // 탭 라벨의 폰트 크기
					fontWeight: 'bold', // 탭 라벨의 폰트 두께
				},
				tabBarIndicatorStyle: {
					backgroundColor: '#fff', // 선택된 탭 아래의 인디케이터 색상
				},
				tabBarIconStyle: {
					width: 20, // 아이콘의 크기
					height: 20, // 아이콘의 크기
				},
			}}
		>
			<TopTab.Screen name="모집중" component={RecruitingScreen} />
			<TopTab.Screen name="참가중" component={ParticipantsScreen} />
		</TopTab.Navigator>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 80,
		backgroundColor: '#6200ea', // 상단 바 배경색
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 100,
		height: 40,
		resizeMode: 'contain',
	},
	screen: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f9f9f9',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	section: {
		alignItems: 'center',
		marginVertical: 20,
	},
	statusText: {
		fontSize: 18,
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		marginTop: 10,
		marginBottom: 5,
	},
	participant: {
		fontSize: 14,
		marginVertical: 2,
	},
});
