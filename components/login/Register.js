import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../firebase/firebase';

const Register = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleRegister = async () => {
		// 비밀번호 일치 여부 확인
		if (password !== confirmPassword) {
			Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
			return;
		}

		try {
			const auth = getAuth(app);
			// Firebase 회원가입 처리
			await createUserWithEmailAndPassword(auth, email, password);
			Alert.alert('회원가입 성공', '이제 로그인할 수 있습니다.');
			navigation.replace('Login'); // 회원가입 후 Login 화면으로 이동
		} catch (error) {
			Alert.alert('회원가입 실패', error.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.header}>회원가입</Text>
			<TextInput
				style={styles.input}
				placeholder="이메일"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				autoCapitalize="none"
			/>
			<TextInput
				style={styles.input}
				placeholder="비밀번호"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<TextInput
				style={styles.input}
				placeholder="비밀번호 확인"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>
			<Button title="회원가입" onPress={handleRegister} />
			<Button
				title="이미 계정이 있으신가요? 로그인"
				onPress={() => navigation.navigate('Login')}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		backgroundColor: 'white',
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
});

export default Register;
