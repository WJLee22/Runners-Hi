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
    backgroundColor: '#673AB7',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
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
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: '#673AB7',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
});
