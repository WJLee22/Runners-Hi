import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function ProfileEdit({ navigation, route }) {
  // MyPage에서 전달받은 데이터
  const { profile, setProfile } = route.params;

  // 닉네임과 상태 메시지 상태
  const [nickname, setNickname] = React.useState(profile.nickname);
  const [statusMessage, setStatusMessage] = React.useState(profile.statusMessage);

  // 저장 버튼 클릭 시 동작
  const handleSave = () => {
    // MyPage의 프로필 데이터 업데이트
    setProfile({ ...profile, nickname, statusMessage });
    navigation.goBack(); // 저장 후 이전 화면으로 돌아가기
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>프로필 수정</Text>
      </View>

      {/* 프로필 이미지 섹션 */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.addPhotoText}>+</Text>
        </View>
        <Text style={styles.genderText}>남성</Text>
        <Text style={styles.birthYearText}>2000년생</Text>
      </View>

      {/* 닉네임 입력 */}
      <View style={styles.inputSection}>
        <Text>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임 입력"
          value={nickname}
          onChangeText={setNickname}
        />
      </View>

      {/* 상태 메시지 입력 */}
      <View style={styles.inputSection}>
        <Text>상태 메시지</Text>
        <TextInput
          style={styles.input}
          placeholder="상태 메시지 입력"
          value={statusMessage}
          onChangeText={setStatusMessage}
        />
      </View>

      <View style={styles.runningStyleSection}>
        <Text>러닝 스타일</Text>
        <View style={styles.options}>
          <TouchableOpacity style={styles.option}>
            <Text>5.0 분/km</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Text>5.5 분/km</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Text>6.0 분/km</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 24,
    color: '#6200ea',
  },
  genderText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 4,
  },
  birthYearText: {
    fontSize: 16,
    color: 'gray',
  },
  inputSection: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  runningStyleSection: {
    marginBottom: 24,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6200ea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
