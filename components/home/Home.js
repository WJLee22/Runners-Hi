import React, { useState, useEffect, useCallback } from 'react';
import { View, Button, BackHandler, Alert, TouchableOpacity, Image, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RunningBlock from './RunningBlock';

export default function Home({ navigation, route }) {
	const [runningList, setRunningList] = useState([]);
	const [refreshing, setRefreshing] = useState(false);

	const loadRunningList = useCallback(async () => {
		try {
			const storedRunningList = await AsyncStorage.getItem('runningList');
			if (storedRunningList) {
				const parsedList = JSON.parse(storedRunningList);
				//console.log('Loaded running list:', parsedList);
				setRunningList(parsedList);
			} else {
				console.log('No running list found in storage.');
			}
		} catch (error) {
			console.error('Failed to load running list from storage:', error);
		}
	}, []);

	useEffect(() => {
		loadRunningList();
		const unsubscribe = navigation.addListener('focus', loadRunningList);
		return unsubscribe;
	}, [loadRunningList, navigation]);

	useEffect(() => {
		const updateRunningList = async () => {
			if (route.params?.runningData) {
				const newRunningData = route.params.runningData;

				try {
					const storedRunningList = await AsyncStorage.getItem('runningList');
					const parsedList = storedRunningList ? JSON.parse(storedRunningList) : [];
					const updatedList = [...parsedList, newRunningData];

					console.log('Updated running list:', updatedList);
					await AsyncStorage.setItem('runningList', JSON.stringify(updatedList)); // 비동기 저장

					navigation.setParams({ runningData: null }); // 파라미터 초기화

					// 추가한 후에 다시 리스트를 로드
					loadRunningList();
				} catch (error) {
					console.error('Failed to update running list:', error);
				}
			}
		};

		updateRunningList();
	}, [route.params?.runningData, loadRunningList]);

	const handleAddRunning = () => {
		navigation.navigate('CreateRunning'); // CreateRunning 화면으로 이동
	};

	const handleClearStorage = async () => {
		try {
			await AsyncStorage.clear();
			setRunningList([]);
			console.log('AsyncStorage has been cleared.');
		} catch (error) {
			console.error('Failed to clear AsyncStorage:', error);
		}
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadRunningList();
		setRefreshing(false);
	}, [loadRunningList]);

	return (
		<View style={styles.container}>
			<Button
				title="Go Back to Login"
				onPress={() => navigation.navigate('Login')}
			/>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{runningList.map((item) => (
					<RunningBlock key={item.id} item={item} /> // key prop 수정
				))}
			</ScrollView>
			<TouchableOpacity style={styles.addButton} onPress={handleAddRunning}>
				<Image source={require('../../assets/plus.png')} style={styles.addButtonIcon} />
			</TouchableOpacity>
			<Button
				title="Clear Storage"
				onPress={handleClearStorage}
			/>
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
