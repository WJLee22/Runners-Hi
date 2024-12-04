import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
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
      navigation.replace('MainApp'); // 메인 화면으로 이동
    } catch (error) {
      Alert.alert('아이디, 비밀번호를 확인해주세요.'); // 로그인 실패 메시지 출력
    }
  };

  // 회원가입 화면으로 이동
  const handleNavigateToRegister = () => {
    navigation.navigate('Register'); // Register 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로고 섹션 */}
      <View style={styles.login_logo}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/applogo.png')}
            style={styles.image}
          ></Image>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={styles.logo_text}>With Runners Hi,</Text>
          <Text style={styles.logo_text}>Let's experience runner's high.</Text>
        </View>
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

        {/* 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#6C63FF' }]} // 회원가입 버튼 색상
            onPress={handleNavigateToRegister}
          >
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20, // 화면 좌우 여백
  },
  // 로고 섹션 스타일
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  // 로그인 섹션 스타일
  loginContainer: {
    flex: 3,
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
  // 버튼 섹션 스타일
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    gap: 15, // 버튼 간격
  },
  button: {
    backgroundColor: '#7C4DFF', // 보라색 버튼
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
