import React, { useState, useEffect, useCallback, useRef } from 'react'; // useRef 추가
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Modal, // Modal 컴포넌트 추가
  Pressable, // Pressable 컴포넌트 추가 
  Animated,
  Image // Animated 추가
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Firestore 연결
import RunningBlock from './RunningBlock';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Vector Icons 사용
import { parse, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { CheckBox } from '@rneui/themed'; // CheckBox 컴포넌트 추가

import * as Location from 'expo-location'; //현재 위치 계산을 위해 추가

export default function Home({ navigation, route }) {
  const [runningList, setRunningList] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [modalVisible, setModalVisible] = useState(false); // Modal 표시 여부 상태
  const [selectedDateFilters, setSelectedDateFilters] = useState([]); // 선택된 날짜 필터 배열 상태
  const [filteredRunningList, setFilteredRunningList] = useState([]); // 필터링된 러닝 리스트 상태
  const modalY = useRef(new Animated.Value(1000)).current; // 모달 애니메이션을 위한 useRef 추가
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Firestore에서 러닝 리스트 가져오는 함수
  const loadRunningList = useCallback(async () => {
    try {
      console.log('Loading running list from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'runnings'));
      const fetchedRunningList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // 문서 ID 포함
        ...doc.data(), // 문서 데이터
      }));
      console.log('Fetched running list:', fetchedRunningList); // 러닝 리스트 출력
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

  // 날짜 필터링 Modal을 표시해주는 함수
  const showDateFilterModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(modalY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 날짜 필터 변경 시 호출되는 함수
  const handleDateFilterChange = (filter) => {
    const updatedFilters = selectedDateFilters.includes(filter)
      ? selectedDateFilters.filter((f) => f !== filter)
      : [...selectedDateFilters, filter]; // 선택되지 않은 필터 추가
    setSelectedDateFilters(updatedFilters);
  };

  // 모달 닫기 에니메이션 함수
  const hideDateFilterModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 300, // fade out 시간 조절
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // 확인 버튼 클릭 시 필터 적용
  const applyDateFilters = () => {
    hideDateFilterModal(); // 확인 버튼을 누르면 모달을 숨김
  };


  useEffect(() => {
    const today = new Date();
    let filteredList = runningList;

    const parseDate = (dateString) => {
      const [year, month, day] = dateString.split(' ')[0].split('.');
      return new Date(year, month - 1, day);
    };
    // 선택된 필터에 따라 러닝 리스트 필터링(if 오늘 + 내일 => 오늘진행하는 러닝 + 내일진행하는 러닝 같이 필터링)
    const filters = {
      '오늘': (item) => isToday(parseDate(item.date)),
      '내일': (item) => isTomorrow(parseDate(item.date)),
      '일주일': (item) => isWithinInterval(parseDate(item.date), { start: today, end: addDays(today, 7) }),
    };

    if (selectedDateFilters.length > 0) {
      filteredList = runningList.filter(item =>
        selectedDateFilters.some(filter => filters[filter](item))
      );
    }

    setFilteredRunningList(filteredList);
  }, [selectedDateFilters, runningList]);

  // 사용자의 현재 위치를 가져오는 함수
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync(); // 사용자에게 위치 정보 사용 권한을 요청("위치 권한을 허용해주세요")

    if (status !== 'granted') { // 권한허용 x인 경우 -> null 반환
      return null;
    }
    let location = await Location.getCurrentPositionAsync({}); // 현재 위치 가져오기.
    return location.coords; // 현재 위치 정보 반환(위도, 경도)
  };


  // 두 지점 간의 거리를 계산하는 함수 (Haversine 공식 사용 -> 두 지점 사이의 대원 거리를 계산하여 거리계산: 지구곡률 반영)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const radius = 6371; // 지구 반지름 (6371km)
    const difLat = (lat2 - lat1) * Math.PI / 180;
    const difLon = (lng2 - lng1) * Math.PI / 180;

    const a = 0.5 - Math.cos(difLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(difLon)) / 2;

    return radius * 2 * Math.asin(Math.sqrt(a)); // 두 지점 사이의 거리 반환
  };

  // 러닝방들을 사용자의 현재 위치와의 거리 순으로 정렬하는 함수
  const sortRunningListByDistance = async () => {
    const currentLocation = await getCurrentLocation();
    if (!currentLocation) return;
    // 선택한 옵션의 날짜 필터링이 적용된 상태에서 + 거리순으로 정렬
    const sortedList = [...filteredRunningList].sort((a, b) => {
      const distanceA = getDistance(currentLocation.latitude, currentLocation.longitude, a.markers[0].latitude, a.markers[0].longitude);
      const distanceB = getDistance(currentLocation.latitude, currentLocation.longitude, b.markers[0].latitude, b.markers[0].longitude);
      return distanceA - distanceB;
    });

    setFilteredRunningList(sortedList);
  };


  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* 필터 버튼 컨테이너 */}
        <View style={styles.buttonContainer}>

          {/* 날짜 필터 버튼 */}
          <TouchableOpacity style={styles.dateFilterButton} onPress={showDateFilterModal}>
            <Image source={require('../../assets/calendar.png')} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {selectedDateFilters.length > 0 ? selectedDateFilters.join(', ') : '날짜'}
            </Text>
            <Icon name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>



          <TouchableOpacity onPress={sortRunningListByDistance} style={styles.distanceSortButton}>
            <Image source={require('../../assets/distance.png')} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>거리순</Text>
          </TouchableOpacity>
          {/* 다른 필터 버튼들 추가될 예정 */}

        </View>
        {/* 날짜 필터 Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={hideDateFilterModal}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackground} onPress={hideDateFilterModal} />
            <Animated.View style={[styles.modalContainer, { opacity: modalOpacity }]}>
              <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}>
                <Text style={styles.modalTitle}>날짜 필터를 선택하세요!</Text>
                <CheckBox
                  title="오늘"
                  checked={selectedDateFilters.includes('오늘')}
                  onPress={() => handleDateFilterChange('오늘')}
                  containerStyle={styles.checkboxContainer}
                />
                <CheckBox
                  title="내일"
                  checked={selectedDateFilters.includes('내일')}
                  onPress={() => handleDateFilterChange('내일')}
                  containerStyle={styles.checkboxContainer}
                />
                <CheckBox
                  title="일주일"
                  checked={selectedDateFilters.includes('일주일')}
                  onPress={() => handleDateFilterChange('일주일')}
                  containerStyle={styles.checkboxContainer}
                />
                <TouchableOpacity style={styles.confirmButton} onPress={applyDateFilters}>
                  <Text style={styles.confirmButtonText}>확인</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </Modal>

        {/* 러닝 리스트 출력 (필터링 적용) */}
        {filteredRunningList.map((item) => (
          <RunningBlock
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('RunningDetail', { item })}
          />
        ))}
      </ScrollView>

      {/* 러닝 추가 버튼 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddRunning}>
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6', // 연보라색 배경
    paddingHorizontal: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7C4DFF', // 연보라 계열
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  runningblock: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderLeftColor: '#7C4DFF',
    borderRightColor: '#7C4DFF',
    shadowColor: '#000', // 그림자 색상
    shadowOffset: { width: 0, height: 2 }, // 그림자의 위치
    shadowOpacity: 0.2, // 그림자의 불투명도
    shadowRadius: 6, // 그림자의 퍼짐 정도
    elevation: 8, // 안드로이드에서의 그림자 효과
    marginVertical: 10, // 세로 여백 추가
  },
  runningblockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // 날짜 필터, 거리순 등 버튼 관련 스타일

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // 왼쪽 정렬
    marginBottom: 0,
  },
  buttonText: {
    fontSize: 14,
    marginRight: 5,
    fontWeight: 'bold',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    marginLeft: 4,
  },
  // 날짜 필터 버튼 스타일
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 0,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // 거리순 정렬 버튼 스타일
  distanceSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 0,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Modal 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }, modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  confirmButton: {
    backgroundColor: '#BA68C8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },

});