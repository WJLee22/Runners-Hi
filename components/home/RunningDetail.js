import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getAuth } from 'firebase/auth';
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const RunningDetail = ({ route, navigation }) => {
  const { item } = route.params;
  const [showContent, setShowContent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantDetails, setParticipantDetails] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    setCurrentUserId(userId);

    if (userId && item.creatorId === userId) {
      setIsCreator(true);
    }

    // 최신 참가자 정보 가져오기
    const fetchParticipants = async () => {
      try {
        const docRef = doc(db, 'runnings', item.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const participantsList = data.participants || [];
          setParticipants(participantsList);

          if (participantsList.includes(userId)) {
            setHasJoined(true);
          } else {
            setHasJoined(false);
          }

          if (
            participantsList.length >= data.person &&
            !participantsList.includes(userId)
          ) {
            setIsFull(true);
          } else {
            setIsFull(false);
          }

          // 참가자 상세 정보 가져오기
          const userPromises = participantsList.map(async (participantId) => {
            const userDocRef = doc(db, 'users', participantId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              return { uid: participantId, ...userDocSnap.data() };
            } else {
              return { uid: participantId, name: 'Unknown User' };
            }
          });

          const participantsDetails = await Promise.all(userPromises);
          setParticipantDetails(participantsDetails);
        }
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    };

    fetchParticipants();
  }, [item.id, item.creatorId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `러닝 참여해요! ${item.title} - ${item.date} ${item.time} ${item.place}`,
        url: 'https://app-link.com', // 앱 링크로 변경해주자.
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert('러닝 정보를 삭제하시겠습니까?', '', [
      {
        text: '취소',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: async () => {
          try {
            // 러닝 방 삭제
            const docRef = doc(db, 'runnings', item.id);
            await deleteDoc(docRef);

            Alert.alert('삭제 성공', '러닝방이 삭제되었습니다.');
            navigation.goBack(); // 이전 화면으로 이동
          } catch (error) {
            console.error('delete failed:', error);
            Alert.alert('삭제 실패', '러닝방 삭제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleJoin = async () => {
    if (isFull) {
      Alert.alert('참가할 수 없습니다', '이미 참가 인원이 가득 찼습니다.');
      return;
    }

    if (hasJoined) {
      Alert.alert('이미 참가하셨습니다', '이미 이 러닝에 참가하셨습니다.');
      return;
    }

    try {
      const docRef = doc(db, 'runnings', item.id);
      await updateDoc(docRef, {
        participants: arrayUnion(currentUserId),
      });

      // 사용자의 joinedRunning 배열에 러닝 ID 추가
      const userDocRef = doc(db, 'users', currentUserId);
      await updateDoc(userDocRef, {
        joinedRunning: arrayUnion(item.id),
      });

      setHasJoined(true);
      Alert.alert('참가 성공', '러닝에 참가하셨습니다.');

      // 업데이트된 참가자 목록 다시 가져오기
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        currentUserId,
      ]);

      // 참가자 상세 정보 업데이트
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setParticipantDetails((prevDetails) => [
          ...prevDetails,
          { uid: currentUserId, ...userDocSnap.data() },
        ]);
      }
    } catch (error) {
      console.error('Failed to join running:', error);
      Alert.alert('참가 실패', '러닝에 참가하는 데 실패했습니다.');
    }
  };

  const handleCancelParticipation = async () => {
    try {
      setIsCancelling(true);
      const docRef = doc(db, 'runnings', item.id);
      await updateDoc(docRef, {
        participants: arrayRemove(currentUserId),
      });

      // 사용자의 joinedRunning 배열에서 러닝 ID 제거
      const userDocRef = doc(db, 'users', currentUserId);
      await updateDoc(userDocRef, {
        joinedRunning: arrayRemove(item.id),
      });

      setHasJoined(false);
      setParticipants((prevParticipants) =>
        prevParticipants.filter((uid) => uid !== currentUserId)
      );
      setParticipantDetails((prevDetails) =>
        prevDetails.filter((participant) => participant.uid !== currentUserId)
      );
      Alert.alert('참가 취소', '러닝 참가가 취소되었습니다.');
    } catch (error) {
      console.error('Failed to cancel participation:', error);
      Alert.alert('오류', '참가 취소 중 오류가 발생했습니다.');
    } finally {
      setIsCancelling(false);
    }
  };

  // 지도 초기 위치 설정
  const initialRegion = {
    latitude:
      item.markers && item.markers.length > 0
        ? item.markers[0].latitude
        : 37.5665, // 기본 위치 설정
    longitude:
      item.markers && item.markers.length > 0
        ? item.markers[0].longitude
        : 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {item.markers &&
          item.markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
            />
          ))}
        {item.markers && item.markers.length > 1 && (
          <Polyline
            coordinates={item.markers.map((marker) => ({
              latitude: marker.latitude,
              longitude: marker.longitude,
            }))}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>
          {item.date} {item.time}
        </Text>
        <Text>{item.place}</Text>
        <Text>{item.course}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={() => setShowContent(!showContent)}>
          <Text style={styles.sectionTitle}>소개</Text>
        </TouchableOpacity>
        {showContent && <Text>{item.content}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>러너</Text>
        {/* 참가자 목록 표시 */}
        {participantDetails.length > 0 ? (
          participantDetails.map((participant, index) => (
            <Text key={index}>{participant.name || '이름 없음'}</Text>
          ))
        ) : (
          <Text>아직 참가자가 없습니다.</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>공유</Text>
        </TouchableOpacity>
        {isCreator ? (
          <TouchableOpacity style={styles.button} onPress={handleDelete}>
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        ) : hasJoined ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleCancelParticipation}
            disabled={isCancelling}
          >
            <Text style={styles.buttonText}>참가 취소</Text>
          </TouchableOpacity>
        ) : isFull ? (
          <TouchableOpacity style={styles.disabledButton} disabled={true}>
            <Text style={styles.buttonText}>마감</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleJoin}>
            <Text style={styles.buttonText}>참가</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RunningDetail;
