import React, { useState, useEffect } from 'react';
import { View, Text, Button, BackHandler, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import RunningBlock from './RunningBlock';

export default function Home({ navigation }) {
	const [runningList, setRunningList] = useState([]);

	// 뒤로가기용 useEffect
	useEffect(() => {
		const backAction = () => {
			Alert.alert('Hold on!', 'Do you want to go back to the login screen?', [
				{
					text: 'Cancel',
					onPress: () => null,
					style: 'cancel',
				},
				{
					text: 'YES',
					onPress: () => navigation.navigate('Login'),
				},
			]);
			return true; // 기본 뒤로가기 동작 취소
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction
		);

		return () => backHandler.remove();
	}, [navigation]);

	// 러닝 모집 컴포넌트 블럭 추가
	const handleAddRunning = () => {
		setRunningList([
			...runningList,
			{
				title: '새로운 러닝',
				date: '2024.10.15',
				time: '19:30',
				location: '이촌1동',
				distance: '9.30',
				participants: '1/5명',
			},
		]);
	};

	return (
		<View style={styles.container}>
			<Text>Home Screen</Text>
			<Button
				title="Go Back to Login"
				onPress={() => navigation.navigate('Login')}
			/>
			{runningList.map((item, index) => (
				<RunningBlock key={index} item={item} />
			))}
			{/*버튼에 이미지 삽입을 위해 Button -> TouchableOpacity*/}
			<TouchableOpacity style={styles.addButton} onPress={handleAddRunning}>
				<Image source={require('../assets/plus.png')} style={styles.addButtonIcon} />
			</TouchableOpacity>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	addButton: {
		position: 'absolute',
		bottom: 30,
		right: 30,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		padding: 0,
	},
	addButtonIcon: {
		width: '100%',
		height: '100%',
	},
});