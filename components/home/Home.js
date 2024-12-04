import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Firestore 연결
import RunningBlock from './RunningBlock';

export default function Home({ navigation, route }) {
  const [runningList, setRunningList] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태

  // Firestore에서 러닝 리스트 가져오는 함수
  const loadRunningList = useCallback(async () => {
    try {
      console.log('Loading running list from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'runnings'));
      const fetchedRunningList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // 문서 ID 포함
        ...doc.data(), // 문서 데이터
      }));
      setRunningList(fetchedRunningList); // 상태 업데이트
    } catch (error) {
      console.error('Failed to load running list from Firestore:', error);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때 러닝 리스트 불러오기
    loadRunningList();

    // 화면이 focus될 때마다 러닝 리스트 갱신
    const unsubscribe = navigation.addListener('focus', loadRunningList);
    return () => unsubscribe();
  }, [navigation, loadRunningList]);

  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRunningList();
    setRefreshing(false);
  }, [loadRunningList]);

  const handleAddRunning = () => {
    navigation.navigate('CreateRunning'); // CreateRunning 화면으로 이동
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 러닝 리스트 출력 */}
        {runningList.map((item) => (
          <RunningBlock
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('RunningDetail', { item })}
          />
        ))}
      </ScrollView>
      {/* 러닝 추가 버튼 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddRunning}>
        <Image
          source={require('../../assets/plus.png')}
          style={styles.addButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
