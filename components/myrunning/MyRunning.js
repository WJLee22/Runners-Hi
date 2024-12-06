import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native'; // 추가

const screenWidth = Dimensions.get('window').width;

const MyRunning = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    nickname: '',
    statusMessage: '',
    totalDistance: 0,
    participationCount: 0,
  });
  const [runHistory, setRunHistory] = useState([]); // {date, courseNum} 형태의 객체 배열

  const fetchData = async () => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 유저 프로필 데이터 가져오기
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error('유저 정보 없음');
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      setProfile((prev) => ({
        ...prev,
        nickname: userData.nickname || '',
        statusMessage: userData.statusMessage || '',
        totalDistance: userData.totalDistance || 0,
        participationCount: userData.participationCount || 0,
      }));

      // participationHistory 가져오기
      const historyRef = collection(
        db,
        'users',
        userId,
        'participationHistory'
      );
      const historySnap = await getDocs(historyRef);

      const historyData = [];
      historySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.date && typeof data.courseNum === 'number') {
          historyData.push({
            date: data.date,
            courseNum: data.courseNum,
          });
        }
      });

      setRunHistory(historyData);
      setLoading(false);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      setLoading(false);
    }
  };

  // 화면에 포커스될 때마다 fetchData 재실행
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // 차트용 데이터 구성
  const labels = runHistory.map((item) => item.date);
  const dataPoints = runHistory.map((item) => item.courseNum);

  const graphData = {
    labels,
    datasets: [
      {
        data: dataPoints,
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(67, 162, 233, ${opacity})`,
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673AB7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>내 러닝 정보</Text>

      <View style={styles.statContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 달린 거리</Text>
          <Text style={styles.statValue}>{profile.totalDistance} km</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>러닝 참여 횟수</Text>
          <Text style={styles.statValue}>{profile.participationCount} 회</Text>
        </View>
      </View>

      {runHistory.length > 0 ? (
        <>
          <Text style={styles.graphTitle}>런닝 기록 (각 러닝별 거리)</Text>
          <LineChart
            data={graphData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#f0f0f0',
              backgroundGradientFrom: '#D1C4E9',
              backgroundGradientTo: '#673AB7',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={styles.graph}
          />
        </>
      ) : (
        <Text style={styles.noDataText}>아직 런닝 기록이 없습니다.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#673AB7',
    textAlign: 'center',
  },
  statContainer: {
    marginBottom: 20,
  },
  statItem: {
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#673AB7',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 18,
    color: '#333',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#673AB7',
    textAlign: 'center',
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyRunning;
