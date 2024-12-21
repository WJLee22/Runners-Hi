import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
	TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Firestore 연결
import Icon from 'react-native-vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native'; // 추가한 부분

export default function MyPage({ navigation }) {
	const [profile, setProfile] = useState({
		name: '러너스하이',
		statusMessage: '안녕하세요, Runners-Hi입니다!',
	});

	const [selectedDate, setSelectedDate] = useState(null);
	const [memo, setMemo] = useState('');
	const [memoData, setMemoData] = useState({});
	const [isModalVisible, setModalVisible] = useState(false);
	const [participationCount, setParticipationCount] = useState(0);
	const [totalDistance, setTotalDistance] = useState(0);
	const [loading, setLoading] = useState(true);
	const STORAGE_KEY = 'MEMO_DATA';

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const auth = getAuth();
				const userId = auth.currentUser?.uid;

				if (!userId) {
					console.error('로그인된 유저가 없습니다.');
					return;
				}

				const userDocRef = doc(db, 'users', userId);
				const userDocSnap = await getDoc(userDocRef);
				if (userDocSnap.exists()) {
					const userData = userDocSnap.data();
					setParticipationCount(userData.participationCount || 0);
					setTotalDistance(userData.totalDistance || 0);
					setProfile((prevProfile) => ({
						...prevProfile,
						name: userData.name || prevProfile.name, // name 필드 사용
						statusMessage: userData.statusMessage || prevProfile.statusMessage,
						pace: userData.pace || prevProfile.pace,
						places: userData.places || prevProfile.places,
						style: userData.places || prevProfile.style,
					}));
				} else {
					//console.error('사용자 문서가 없습니다.');
				}
			} catch (error) {
				console.error('유저 프로필 가져오기 실패:', error);
			}
		};

		fetchUserProfile();
	}, []); // 빈 배열로 실행 시점 명시

	useEffect(() => {
		console.log('프로필 업데이트:', profile);
	}, [profile]);

	// AsyncStorage에서 메모 데이터 로드
	useEffect(() => {
		const loadMemoData = async () => {
			try {
				const savedData = await AsyncStorage.getItem(STORAGE_KEY);
				if (savedData) {
					setMemoData(JSON.parse(savedData));
				}
			} catch (error) {
				console.error('Failed to load memo data:', error);
			}
		};

		loadMemoData();
	}, []);

	// 화면 포커스 시 데이터 새로고침 추가 부분
	useFocusEffect(
		useCallback(() => {
			const refreshUserData = async () => {
				try {
					const auth = getAuth();
					const userId = auth.currentUser?.uid;

					if (!userId) {
						console.error('로그인된 유저가 없습니다.');
						return;
					}

					const userDocRef = doc(db, 'users', userId);
					const userDocSnap = await getDoc(userDocRef);
					if (userDocSnap.exists()) {
						const userData = userDocSnap.data();
						setParticipationCount(userData.participationCount || 0);
						setTotalDistance(userData.totalDistance || 0);
						setProfile((prevProfile) => ({
							...prevProfile,
							name: userData.name || prevProfile.name,
							statusMessage:
								userData.statusMessage || prevProfile.statusMessage,
							pace: userData.pace || prevProfile.pace,
							places: userData.places || prevProfile.places,
							style: userData.places || prevProfile.style,
						}));
					} else {
						//console.error('사용자 문서가 없습니다.');
					}
				} catch (error) {
					console.error('유저 프로필 가져오기 실패:', error);
				}
			};

			refreshUserData();
		}, [])
	);

	// 메모 저장
	const saveMemo = async () => {
		const updatedMemoData = { ...memoData, [selectedDate]: memo };
		setMemoData(updatedMemoData);

		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemoData));
			alert('메모가 저장되었습니다!');
			setModalVisible(false);
		} catch (error) {
			console.error('Failed to save memo:', error);
		}
	};

	//로그아웃 핸들러
	const handleLogout = async () => {
		const auth = getAuth();
		try {
			await signOut(auth);
			navigation.replace('Login');
		} catch (error) {
			console.error('로그아웃 실패:', error);
			alert('로그아웃 중 오류가 발생했습니다.');
		}
	};

	// 현재 날짜 가져오기
	const currentDate = new Date();
	const today = currentDate.getDate();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();

	// 한국어 요일 배열
	const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

	// 오늘이 포함된 주의 일요일부터 날짜 가져오기
	const getCurrentWeek = () => {
		const currentDayOfWeek = currentDate.getDay(); // 0(일요일)부터 6(토요일)
		const startOfWeek = new Date(currentDate);
		startOfWeek.setDate(today - currentDayOfWeek); // 해당 주의 일요일 날짜 계산

		const weekDays = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startOfWeek);
			day.setDate(startOfWeek.getDate() + i);
			weekDays.push({
				year: day.getFullYear(),
				month: day.getMonth() + 1,
				day: day.getDate(),
				weekDay: daysOfWeek[day.getDay()],
			});
		}
		return weekDays;
	};

	const currentWeek = getCurrentWeek();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{/* 헤더 */}
			<View style={styles.header}>
				<Text style={styles.title}>Runners Hi</Text>
				<Icon
					onPress={handleLogout}
					name="log-out"
					size={32}
					style={styles.logoutIcon}
				/>
			</View>

			{/* 프로필 섹션 */}
			<View style={styles.profileSection}>
				<TouchableOpacity
					style={styles.profileCircle}
					onPress={() =>
						navigation.navigate('ProfileEdit', { profile, setProfile })
					}
				>
					<Text style={styles.profileEditText}>프로필 수정</Text>
				</TouchableOpacity>
				<Text style={styles.profileName}>{profile.name}</Text>
				<Text style={styles.profileStatus}>{profile.statusMessage}</Text>
			</View>

			{/* My Run 섹션 */}
			<View style={styles.runSection}>
				<Text style={styles.runTitle}>My Run</Text>
				<View style={styles.runStats}>
					<View style={styles.stat}>
						<Text style={styles.statValue}> {totalDistance.toFixed(2)} km</Text>
						<Text style={styles.statLabel}>거리</Text>
					</View>
					<View style={styles.stat}>
						<Text style={styles.statValue}>{participationCount}회</Text>
						<Text style={styles.statLabel}>횟수</Text>
					</View>
				</View>
			</View>

			{/* 달력 섹션 */}
			<View style={styles.calendarSection}>
				<Text
					style={styles.calendarTitle}
				>{`${currentYear}년 ${currentMonth}월`}</Text>
				<View style={styles.calendar}>
					{currentWeek.map((date, index) => (
						<TouchableOpacity
							key={index}
							style={[
								styles.dateBox,
								date.day === today &&
								date.month === currentMonth &&
								styles.selectedDate,
							]}
							onPress={() => {
								const fullDate = `${date.year}-${date.month}-${date.day}`;
								setSelectedDate(fullDate);
								setMemo(memoData[fullDate] || '');
								setModalVisible(true);
							}}
						>
							<Text
								style={[
									styles.dateText,
									date.day === today &&
									date.month === currentMonth &&
									styles.selectedDateText,
								]}
							>
								{date.day}
							</Text>
							<Text style={styles.weekDay}>{date.weekDay}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* 메모 모달 */}
			<Modal isVisible={isModalVisible}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>{selectedDate}</Text>
					<TextInput
						style={styles.memoInput}
						placeholder="메모를 입력하세요"
						value={memo}
						onChangeText={setMemo}
						multiline
					/>
					<View style={styles.modalButtons}>
						<TouchableOpacity style={styles.saveButton} onPress={saveMemo}>
							<Text style={styles.saveButtonText}>저장</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cancelButton}
							onPress={() => setModalVisible(false)}
						>
							<Text style={styles.cancelButtonText}>취소</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: '#EDE7F6',
		padding: 16,
		paddingTop: 30,
	},
	header: {
		flexDirection: 'column', // 세로로 배치
		alignItems: 'center', // "Runners Hi"를 중앙에 정렬
		marginBottom: 16,
		position: 'relative', // 로그아웃 아이콘을 절대 위치로 설정
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 8, // 프로필 이미지와의 간격을 조정
	},
	logoutIcon: {
		position: 'absolute', // 아이콘을 절대 위치로 설정
		right: 16, // 오른쪽 끝으로 위치
		top: 8, // 상단에서 살짝 아래로 위치
	},
	profileSection: {
		alignItems: 'center',
		marginBottom: 24,
	},
	profileCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#e0e0e0',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	profileEditText: {
		fontSize: 16,
		color: '#6200ea',
		fontWeight: 'bold',
	},
	profileName: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	profileStatus: {
		fontSize: 14,
		color: 'gray',
	},
	runSection: {
		padding: 16,
		backgroundColor: '#f8f8f8',
		borderRadius: 8,
		marginBottom: 24,
	},
	runTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	runStats: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	stat: {
		alignItems: 'center',
	},
	statValue: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	statLabel: {
		fontSize: 14,
		color: 'gray',
	},
	calendarSection: {
		padding: 16,
		backgroundColor: '#f8f8f8',
		borderRadius: 8,
	},
	calendarTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	calendar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	dateBox: {
		width: '13%',
		alignItems: 'center',
		marginVertical: 4,
		padding: 8,
		borderRadius: 4,
		backgroundColor: '#e0e0e0',
	},
	selectedDate: {
		backgroundColor: '#6200ea',
	},
	dateText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	selectedDateText: {
		color: '#fff',
	},
	weekDay: {
		fontSize: 12,
		color: 'gray',
	},
	modalContent: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 8,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	memoInput: {
		height: 100,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 8,
		marginBottom: 16,
		textAlignVertical: 'top',
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	saveButton: {
		backgroundColor: '#6200ea',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		flex: 1,
		marginRight: 8,
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 16,
	},
	cancelButton: {
		backgroundColor: '#ccc',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		flex: 1,
	},
	cancelButtonText: {
		color: '#000',
		fontSize: 16,
	},
});
