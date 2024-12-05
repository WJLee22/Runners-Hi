import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'; // Firestore 추가
import { getAuth } from 'firebase/auth'; // Firebase Auth 추가
import { db } from '../firebase/firebase'; // Firestore 연결

import PlaceChoice from './course/PlaceChoice';
import CourseChoice from './course/CourseChoice';

export default function CreateRunning({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [place, setPlace] = useState('');
  const [course, setCourse] = useState('');
  const [person, setPersons] = useState('');
  const [content, setContent] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParticipationAccept, setIsParticipationAccept] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPlaceChoice, setShowPlaceChoice] = useState(false);
  const [showCourseChoice, setShowCourseChoice] = useState(false);
  const [markers, setMarkers] = useState();

  // 날짜 형식 변환 함수 (예: 2024.11.28 -> 2024.11.28 화요일)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}.${month}.${day} ${dayOfWeek}요일`;
  };

  const dateChangeHandler = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const timeChangeHandler = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const handlePlaceChoice = () => {
    setShowPlaceChoice(true);
  };

  const handleCourseChoice = () => {
    if (markers) {
      setShowCourseChoice(true);
    }
  };

  const createRunningHandler = async () => {
    if (!title || !place || !course || !person || !content) {
      Alert.alert('필수 입력 항목을 모두 입력해주세요!');
      return;
    }

    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const runningData = {
        title,
        date: formatDate(date),
        time: time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        place,
        course: `${course}km`,
        person: parseInt(person, 10),
        content,
        participationAccept: isParticipationAccept,
        markers, // 추가된 마커 데이터 저장
        creatorId: userId, // 생성한 사용자 ID
      };

      // 러닝방 추가
      const runningDocRef = await addDoc(
        collection(db, 'runnings'),
        runningData
      );

      // 해당 사용자의 데이터에 생성된 러닝방 ID 추가
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        createdRunnings: arrayUnion(runningDocRef.id), // 생성된 방 ID를 배열로 추가
      });

      Alert.alert('러닝방이 성공적으로 생성되었습니다!');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('러닝방 생성 중 오류:', error);
      Alert.alert('러닝방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    console.log('Markers:', markers);
    console.log('Course:', course);
  }, [markers]);

  return (
    <View style={styles.container}>
      <Text>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="러닝방 제목을 입력하세요"
      />

      <Text>날짜</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={date.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={dateChangeHandler}
        />
      )}

      <Text>시간</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <TextInput
          style={styles.input}
          value={time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          editable={false}
        />
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={timeChangeHandler}
        />
      )}

      <Text>장소</Text>
      <TouchableOpacity onPress={handlePlaceChoice}>
        <TextInput
          style={styles.input}
          value={place}
          editable={false}
          placeholder="러닝 시작 장소를 선택하세요"
        />
      </TouchableOpacity>

      <Text>러닝코스</Text>
      <TouchableOpacity onPress={handleCourseChoice}>
        <TextInput
          style={styles.input}
          value={`${String(course)}km`}
          editable={false}
          placeholder="코스 경로를 선택하세요"
        />
      </TouchableOpacity>

      {showPlaceChoice && (
        <View style={styles.modal}>
          <PlaceChoice
            setPlace={setPlace}
            onClose={() => setShowPlaceChoice(false)}
            setMarkers={setMarkers}
          />
        </View>
      )}

      {showCourseChoice &&
        (markers ? (
          <View style={styles.modal}>
            <CourseChoice
              markers={markers}
              navigation={navigation}
              setCourse={setCourse}
              onClose={() => setShowCourseChoice(false)}
              setMarkers={setMarkers}
            />
          </View>
        ) : (
          alert('중심 좌표를 설정해야합니다.')
        ))}

      <Text>러닝인원</Text>
      <TextInput
        style={styles.input}
        value={person}
        onChangeText={setPersons}
        keyboardType="numeric"
        placeholder="러닝 최대인원을 입력하세요"
      />

      <Text>내용을 입력하세요</Text>
      <TextInput
        style={styles.longinput}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="러닝방 내용을 입력하세요"
        onSubmitEditing={Keyboard.dismiss}
        returnKeyType="done"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={createRunningHandler}
      >
        <Text style={styles.submitButtonText}>완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6D9FF', // 연보라색 배경
    padding: 16,
    paddingBottom: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#5C3D8D', // 보라색 텍스트
  },
  input: {
    height: 40,
    borderColor: '#D1B3FF', // 라이트 보라색
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  longinput: {
    height: 120,
    borderColor: '#D1B3FF', // 라이트 보라색
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  textArea: {
    height: 120,
  },
  button: {
    backgroundColor: '#9B4DFF', // 보라색
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#7A42F4', // 다크 보라색
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '120%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10, // 기존 화면 위로 렌더링
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
