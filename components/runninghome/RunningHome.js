// RunningHome.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
// 각 화면 컴포넌트
import ParticipantListScreen from './ParticipantListScreen';
import ChatScreen from './ChatScreen';

import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

function RecruitingScreen({ navigation }) {
  const [runnings, setRunnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchRunnings = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      setCurrentUserId(userId);

      if (!userId) return;

      // 사용자 문서 가져오기
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const createdRunnings = userData.createdRunnings || [];
        const joinedRunning = userData.joinedRunning || [];

        console.log('createdRunnings:', createdRunnings);
        console.log('joinedRunning:', joinedRunning);

        const allRunningIds = [
          ...new Set([...createdRunnings, ...joinedRunning]),
        ];

        console.log('allRunningIds:', allRunningIds);

        if (allRunningIds.length === 0) {
          setRunnings([]);
          setLoading(false);
          return;
        }

        const runningsCollection = collection(db, 'runnings');

        const batchSize = 10;
        const runningsData = [];

        for (let i = 0; i < allRunningIds.length; i += batchSize) {
          const batchIds = allRunningIds.slice(i, i + batchSize);

          if (batchIds.length === 0) continue;

          const runningsQuery = query(
            runningsCollection,
            where('__name__', 'in', batchIds)
          );
          const runningsSnapshot = await getDocs(runningsQuery);

          runningsSnapshot.forEach((doc) => {
            const data = doc.data();
            const isCreator = data.creatorId === userId;
            runningsData.push({
              id: doc.id,
              ...data,
              isCreator,
            });
          });
        }

        console.log('runningsData:', runningsData);
        setRunnings(runningsData);
      }
    } catch (error) {
      console.error('러닝 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRunnings();
    }, [fetchRunnings])
  );
  //완료 핸들러
  const handleFinish = async () => {
    Alert.alert('런닝이 끝났나요?', '', [
      {
        text: '아니요',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: '네',
        onPress: async () => {
          try {
            // 러닝 방 완료
            const docRef = doc(db, 'runnings', item.id);
            await deleteDoc(docRef);

            Alert.alert('런닝 완료', '런닝이 성공적으로 끝났습니다!');
            navigation.goBack(); // 이전 화면으로 이동
          } catch (error) {
            console.error('delete failed:', error);
            Alert.alert('오류', '런닝 완료 처리 도중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.runningItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>
        {item.date} {item.time}
      </Text>
      <Text>{item.place}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', { runningId: item.id })}
        >
          <Text style={styles.buttonText}>채팅</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.manageButton,
            !item.isCreator && styles.disabledButton,
          ]}
          onPress={() => {
            if (item.isCreator) {
              navigation.navigate('Participants', { runningId: item.id });
            }
          }}
          disabled={!item.isCreator}
        >
          <Text style={styles.buttonText}>참가자 관리</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673AB7" />
      </View>
    );
  }

  return (
    <FlatList
      data={runnings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>참여 중인 러닝이 없습니다.</Text>
        </View>
      }
    />
  );
}

const Stack = createStackNavigator();

export default function RunningHome() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: '#fff',
        headerTitleStyle: styles.headerTitle,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="Recruiting"
        component={RecruitingScreen}
        options={{
          title: '참여 중인 러닝',
        }}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantListScreen}
        options={{
          title: '참가자 관리',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: '채팅방',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#7C4DFF', // 연보라 계열로 변경
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1, // 화면을 꽉 채우기 위해 flex 사용
    padding: 16,
    backgroundColor: '#EDE7F6', // 연한 보라색 배경
  },
  runningItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  chatButton: {
    backgroundColor: '#9575CD', // 부드러운 보라색 버튼
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: '#7E57C2', // 조금 더 진한 보라색 버튼
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1C4E9', // 흐릿한 연보라 (비활성화 상태)
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1, // 화면을 꽉 채우기 위해 flex 사용
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE7F6', // 연한 보라색 배경
  },
  emptyContainer: {
    flex: 1, // 빈 화면도 꽉 차도록 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
});
