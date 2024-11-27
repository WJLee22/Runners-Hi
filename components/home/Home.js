import React, { useState, useEffect } from 'react';
import { View, Text, Button, BackHandler, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import RunningBlock from './RunningBlock';


export default function Home({ navigation, route }) {
	const [runningList, setRunningList] = useState([]);

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
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction
		);

		if (route.params?.runningData) {
			setRunningList([...runningList, route.params.runningData]);
		}

		return () => backHandler.remove();
	}, [navigation, route.params]);

	const handleAddRunning = () => {
		navigation.navigate('CreateRunning'); // CreateRunning 화면으로 이동
	};

	return (
		<View style={styles.container}>

			<Button
				title="Go Back to Login"
				onPress={() => navigation.navigate('Login')}
			/>
			{runningList.map((item, index) => (
				<RunningBlock key={index} item={item} />
			))}
			<TouchableOpacity style={styles.addButton} onPress={handleAddRunning}>
				<Image source={require('../../assets/plus.png')} style={styles.addButtonIcon} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	logo: {
		width: 100,
		height: 100,
		alignSelf: 'center',
		marginVertical: 20,
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