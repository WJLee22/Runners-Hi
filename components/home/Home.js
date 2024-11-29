import React, { useState, useEffect, useCallback } from 'react';
import { View, Button, BackHandler, Alert, TouchableOpacity, Image, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RunningBlock from './RunningBlock';

export default function Home({ navigation, route }) {
	const [runningList, setRunningList] = useState([]);
	const [refreshing, setRefreshing] = useState(false);// 새로고침

	// AsyncStorage에 저장된 러닝정보객체를 담아둔 배열를 불러와서 runningList 상태에 저장하는 함수 loadRunningList
	// useCallback을 사용하여 함수를 선언 -> 컴포넌트가 처음 렌더링될 때만 함수를 생성 & 이 함수의 불필요한 재렌더링 방지
	const loadRunningList = useCallback(async () => {
		try {
			console.log('Loading running list from storage...');
			// AsyncStorage에서 runningList 키에 해당하는 값인 러닝정보객체를 불러옴
			const storedRunningList = await AsyncStorage.getItem('runningList');
			if (storedRunningList) {
				// JSON.parse를 사용하여 ayncStorage의 저장형태인 JSON 문자열을 -> js객체로 변환
				const parsedList = JSON.parse(storedRunningList);
				// 저장소에서 얻어온 러닝정보객체배열을 runningList 상태값에 저장
				setRunningList(parsedList);
			} else {
				console.log('No running list found in storage.');
			}
		} catch (error) {
			console.error('Failed to load running list from storage:', error);
		}
	}, []);

	useEffect(() => {
		// 화면이 처음 렌더링될 때 loadRunningList 함수를 실행.
		loadRunningList();

		// 화면이 focus될 때마다 loadRunningList 함수를 실행. 즉, 화면이 focus될 때마다 AsyncStorage에서 러닝정보를 불러와서 runningList 상태에 저장.
		//포커스를 받는다는 것은 화면이 보여지는 상태를 의미. 즉, 사용자가 다른 화면으로 이동했다가 다시 이 화면으로 돌아올 때 최신상태의 러닝정보를 불러오기 위함
		// focus 이벤트헨들러는 컴포넌트가 처음 렌더링될 떄는 호출되지 않음. so, 위에서 loadRunningList(); 를 호출해준 것.
		//so, loadRunningList(); => 첫 렌더링시 호출, focus 이벤트핸들러 => 다시 화면으로 돌아올 때 호출
		const unsubscribe = navigation.addListener('focus', loadRunningList);
		return () => unsubscribe();
	}, [navigation]);

	useEffect(() => {
		const updateRunningList = async () => {
			if (route.params?.runningData) {
				const newRunningData = route.params.runningData;

				try {
					const storedRunningList = await AsyncStorage.getItem('runningList');
					const parsedList = storedRunningList ? JSON.parse(storedRunningList) : [];
					const updatedList = [...parsedList, newRunningData];

					//console.log('Updated running list:', updatedList);
					await AsyncStorage.setItem('runningList', JSON.stringify(updatedList)); // AsyncStorage는 비동기적임. await 사용해서 비동기 처리해주자

					navigation.setParams({ runningData: null }); // 파라미터 초기화

					// 추가한 후에 다시 리스트를 로드
					loadRunningList();
				} catch (error) {
					console.error('Failed to update running list:', error);
				}
			}
		};

		updateRunningList();
	}, [route.params?.runningData]);

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

	// 새로고침시 러닝 리스트 최신화  
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
					<RunningBlock key={item.id} item={item} onPress={() => navigation.navigate('RunningDetail', { item })} /> // key prop = 랜덤값, 러닝방 클릭시 RunningDetail로 이동
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
