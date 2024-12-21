import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  getDocs,
} from 'firebase/firestore';

export default function ParticipantListScreen({ route, navigation }) {
  const { runningId } = route.params; // 전달받은 러닝 ID
  const [participants, setParticipants] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        setCurrentUserId(userId);

        if (!userId) {
          Alert.alert('로그인이 필요합니다.');
          navigation.goBack();
          return;
        }

        // 러닝 정보 가져오기
        const runningDocRef = doc(db, 'runnings', runningId);
        const runningDoc = await getDoc(runningDocRef);

        if (runningDoc.exists()) {
          const runningData = runningDoc.data();
          const participantIds = runningData.participants || [];
          setIsCreator(runningData.creatorId === userId);

          // 참가자 상세 정보 가져오기
          const participantsData = [];
          for (const participantId of participantIds) {
            const userDocRef = doc(db, 'users', participantId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              participantsData.push({
                id: participantId,
                name: userData.name || '이름 없음',
                pace: userData.pace || '페이스 정보 없음',
                image: userData.profileImage || null, // 프로필 이미지 URL이 있다고 가정
              });
            }
          }
          setParticipants(participantsData);
        } else {
          Alert.alert('러닝 정보를 가져올 수 없습니다.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('크루 정보 가져오기 오류:', error);
        Alert.alert('오류', '크루 정보를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [runningId]);

  // 강퇴 함수
  const kickUser = (participantId, participantName) => {
    Alert.alert('강퇴 확인', `${participantName}님을 강퇴하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '강퇴',
        onPress: async () => {
          try {
            // 러닝 문서에서 참가자 제거
            const runningDocRef = doc(db, 'runnings', runningId);
            await updateDoc(runningDocRef, {
              participants: arrayRemove(participantId),
            });

            // 강퇴된 참가자의 joinedRunning에서 러닝 ID 제거
            const userDocRef = doc(db, 'users', participantId);
            await updateDoc(userDocRef, {
              joinedRunning: arrayRemove(runningId),
            });

            // 참가자 목록에서 제거
            setParticipants((prevParticipants) =>
              prevParticipants.filter((p) => p.id !== participantId)
            );

            Alert.alert('강퇴 완료', `${participantName}님을 강퇴했습니다.`);
          } catch (error) {
            console.error('강퇴 실패:', error);
            Alert.alert('오류', '강퇴 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.participantCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.profileImage} />
      ) : (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profilePlaceholderText}>
            {item.name.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.name}</Text>
        <Text style={styles.participantPace}>페이스: {item.pace}</Text>
      </View>

      {isCreator &&
        item.id !== currentUserId && ( // 방장만 강퇴 가능하며, 자기 자신은 강퇴 불가
          <TouchableOpacity
            style={styles.kickButton}
            onPress={() => kickUser(item.id, item.name)}
          >
            <Text style={styles.kickButtonText}>강퇴</Text>
          </TouchableOpacity>
        )}
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
    <View style={styles.container}>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1C4E9',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  listContainer: {
    paddingBottom: 10,
  },
  participantCard: {
    backgroundColor: '#B39DDB',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9575CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profilePlaceholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantPace: {
    color: 'white',
    fontSize: 12,
    marginVertical: 3,
  },
  kickButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  kickButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
