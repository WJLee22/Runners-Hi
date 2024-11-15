import { View, Text, Button, BackHandler, Alert } from 'react-native';
import { useEffect } from 'react';

export default function Home({ navigation }) {

  //뒤로가기용 useEffect
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

	return (
		<View>
			<Text>Home Screen</Text>
			<Button
				title="Go Back to Login"
				onPress={() => navigation.navigate('Login')}
			/>
		</View>
	);
}
