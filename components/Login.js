import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login({ navigation }) {
	const handleLogin = () => {
		// 로그인 로직을 처리한 후 MainApp으로 이동
		navigation.replace('MainApp');
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.login_logo}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Image
						source={require('../assets/applogo.png')}
						style={styles.image}
					></Image>
				</View>
				<View style={{ textAlign: 'center' }}>
					<Text style={styles.logo_text}>With Runners Hi,</Text>
					<Text style={styles.logo_text}>Let's experience runner's high.</Text>
				</View>
			</View>

			<View style={styles.login_section}>
				<View
					style={{
						marginTop: '5%',
						marginHorizontal: '5%',
						gap: 10,
					}}
				>
					<Button title="간편 로그인" onPress={handleLogin} />
					<Button title="소셜 로그인" onPress={handleLogin} />
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	login_logo: {
		flex: 2,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		gap: 50,
	},
	logo_text: {
		fontSize: 18,
		fontWeight: 500,
		textAlign: 'center',
	},
	login_section: {
		flex: 1,
	},
});
