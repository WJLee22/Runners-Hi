import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('로그인 성공', '메인 화면으로 이동합니다.');
      navigation.replace('MainApp'); // 메인 화면으로 이동
    } catch (error) {
      Alert.alert('로그인 실패', error.message); // 로그인 실패 메시지 출력
    }
  };

  // 회원가입 화면으로 이동
  const handleNavigateToRegister = () => {
    navigation.navigate('Register'); // Register 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로고 섹션 */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/applogo.png')}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>With Runners Hi,</Text>
        <Text style={styles.logoText}>Let's experience runner's high.</Text>
      </View>

      {/* 로그인 섹션 */}
      <View style={styles.loginContainer}>
        <Text style={styles.header}>로그인</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />
        <View style={styles.buttonContainer}>
          <Button title="로그인" onPress={handleLogin} />
          <Button title="회원가입" onPress={handleNavigateToRegister} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20, // 전체 화면의 좌우 여백
  },
  // 로고 섹션 스타일
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  // 로그인 섹션 스타일
  loginContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
