import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// 각 화면 컴포넌트 import
import ChatScreen from './ChatScreen';
import ParticipantListScreen from './ParticipantListScreen';

export default function RecruitingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [runningList, setRunningList] = useState([]);
  const navigation = useNavigation(); // 네비게이션 훅 사용

  // useEffect로 AsyncStorage에서 runningList 데이터를 불러옴
  useFocusEffect(
    React.useCallback(() => {
      const fetchRunningList = async () => {
        try {
          const storedRunningList = await AsyncStorage.getItem('runningList');
          if (storedRunningList !== null) {
            const parsedList = JSON.parse(storedRunningList);
            setRunningList(parsedList);
          }
        } catch (error) {
          console.error('Error fetching running list from AsyncStorage', error);
        } finally {
          setIsLoading(false); // 로딩 상태 변경
        }
      };

      fetchRunningList();
    }, [])
  );

  // 참가자 목록 렌더링
  const renderParticipants = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    if (runningList.length > 0) {
      return (
        <ScrollView
          style={{ flex: 1, width: '100%', backgroundColor: '#EDE7F6' }}
        >
          <FlatList
            data={runningList}
            keyExtractor={(item) => item.id.toString()} // id를 문자열로 변환하여 고유 키로 사용
            renderItem={({ item }) => (
              <View style={styles.container}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{item.time}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{item.place}</Text>
                  <Text style={styles.infoText}>{item.course}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.buttonContainer}>
                  {/* 참가자 관리 버튼 */}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Participants')} // 'Participants'로 이동
                  >
                    <Text style={styles.buttonText}>참가자 관리</Text>
                  </TouchableOpacity>
                  {/* 러닝챗 버튼 */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.navigate('Chat')} // 'Chat'으로 이동
                  >
                    <Text style={styles.cancelButtonText}>러닝챗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </ScrollView>
      );
    } else {
      return (
        <View style={styles.noParticipantsContainer}>
          <Text>모집 중입니다. 참가자를 관리하려면 버튼을 클릭하세요.</Text>
          <Button
            title="참가자 관리"
            onPress={() => navigation.navigate('Participants')} // 'Participants'로 이동
          />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {' '}
      {/* 전체 배경색을 변경 */}
      <View style={styles.center}>{renderParticipants()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 전체 화면 중앙에 맞추기 위한 스타일
  center: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f1f1f1', // 중앙 컨테이너 배경색 변경
  },

  // 각 항목을 담을 컨테이너 스타일
  container: {
    flex: 1,
    width: '90%',
    padding: 20,
    backgroundColor: '#fff', // 항목의 배경색을 흰색으로 설정
    borderRadius: 10, // 모서리 둥글게 처리
    marginTop: 15,
    marginBottom: 15, // 각 항목 간의 간격
    shadowColor: '#000', // 음영 효과
    shadowOffset: { width: 0, height: 2 },
    margin: 'auto',
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // 안드로이드 음영 효과
  },

  // 타이틀 스타일
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  // 정보 텍스트를 나열할 컨테이너
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // 정보 텍스트 스타일
  infoText: {
    fontSize: 16,
    color: '#555',
  },

  // 구분선 스타일
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 20,
  },

  // 버튼 컨테이너 스타일
  buttonContainer: {
    flexDirection: 'row', // 버튼을 가로로 배치
    justifyContent: 'space-between', // 버튼 사이의 간격
    width: '100%', // 전체 너비 사용
  },

  // "참가자 관리" 버튼 스타일
  button: {
    flex: 1, // 버튼을 동일 크기로 설정
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center', // 텍스트 중앙 정렬
    borderWidth: 1, // 테두리 추가
    borderColor: '#6039ea', // 보라색 테두리
    marginRight: 5, // 오른쪽 버튼과 간격 추가
  },

  // 버튼 텍스트 스타일 (참가자 관리 버튼)
  buttonText: {
    color: '#6039ea',
    fontSize: 16,
  },

  // "러닝챗" 버튼 스타일
  cancelButton: {
    flex: 1, // 버튼을 동일 크기로 설정
    backgroundColor: '#6039ea', // 보라색 배경
    padding: 12,
    borderRadius: 5,
    marginLeft: 5, // 왼쪽 버튼과 간격 추가
    alignItems: 'center', // 텍스트 중앙 정렬
  },

  // "러닝챗" 버튼 텍스트 스타일
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  // 참가자가 없을 때 메시지를 담을 컨테이너
  noParticipantsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  // 로딩 중 표시
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});
