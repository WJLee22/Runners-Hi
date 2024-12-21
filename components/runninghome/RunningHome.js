import React, { useState, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase';
import {
	doc,
	getDoc,
	collection,
	getDocs,
	query,
	where,
	deleteDoc,
	updateDoc,
	setDoc,
	increment,
} from 'firebase/firestore';
import ParticipantListScreen from './ParticipantListScreen';
import ChatScreen from './ChatScreen';

function RecruitingScreen({ navigation }) {
	const [runnings, setRunnings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState(null);

	// Firebase에서 러닝 데이터 가져오기
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

				const allRunningIds = [
					...new Set([...createdRunnings, ...joinedRunning]),
				];

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
						if (!data.isCompleted) {
							runningsData.push({
								id: doc.id,
								...data,
								isCreator,
							});
						}
					});
				}

				setRunnings(runningsData);
			}
		} catch (error) {
			console.error('러닝 정보 가져오기 오류:', error);
		} finally {
			setLoading(false);
		}
	}, []);
	const handleComplete = async (runningId) => {
		try {
			Alert.alert(
				'런닝이 끝났나요?',
				'이 런닝을 완료하고 삭제하시겠습니까?',
				[
					{
						text: '아니요',
						style: 'cancel',
					},
					{
						text: '네',
						onPress: async () => {
							try {
								const runningRef = doc(db, 'runnings', runningId);
								const runningSnap = await getDoc(runningRef);

								if (!runningSnap.exists()) {
									Alert.alert('오류', '런닝 정보를 찾을 수 없습니다.');
									return;
								}

								const runData = runningSnap.data();
								const creatorId = runData.creatorId;
								const participants = runData.participants || [];
								const courseStr = runData.course || '0km';
								const courseNum = parseFloat(
									courseStr.replace('km', '').trim()
								); // "3.14km" -> "3.14" -> parseFloat("3.14") -> 3.14

								const date = runData.date || ''; // 날짜 정보

								// 러닝에 참여한 모든 유저(방 생성자 + 참가자)
								const allUserIds = [creatorId, ...participants];

								// 모든 유저 정보 업데이트
								for (const userId of allUserIds) {
									// participationCount +1 증가, totalDistance에 course 더하기
									const userRef = doc(db, 'users', userId);
									await updateDoc(userRef, {
										participationCount: increment(1),
										totalDistance: increment(courseNum),
									});

									// 해당 유저의 participationHistory 컬렉션에 기록 추가
									const historyRef = doc(
										collection(db, 'users', userId, 'participationHistory')
									);
									await setDoc(
										historyRef,
										{ date, courseNum },
										{ merge: true }
									);
								}

								// 러닝 문서 삭제
								await deleteDoc(runningRef);

								// UI 업데이트: 삭제된 러닝을 목록에서 제거
								setRunnings((prevRunnings) =>
									prevRunnings.filter((running) => running.id !== runningId)
								);

								Alert.alert('런닝 완료', '런닝이 성공적으로 끝났습니다!');
							} catch (error) {
								console.error('러닝 삭제 처리 중 오류:', error);
								Alert.alert('오류', '런닝 삭제 중 문제가 발생했습니다.');
							}
						},
					},
				],
				{ cancelable: true }
			);
		} catch (error) {
			console.error('러닝 처리 중 오류:', error);
		}
	};
	useFocusEffect(
		useCallback(() => {
			fetchRunnings();
		}, [fetchRunnings])
	);

	function parseDateTime(date) {
		// date에서 년, 월, 일을 추출 (목요일 이후는 버린다)
		const first = date.split(' ');
		const [year, month, day] = first[0].split('.').map(Number);
		console.log(new Date());

		const currentDate = new Date();

		// 년, 월, 일 추출
		const year1 = currentDate.getFullYear();
		const month1 = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
		const day1 = currentDate.getDate();

		console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);
		console.log(`Year: ${year1}, Month: ${month1}, Day: ${day1}`);
		if (year > year1 || month > month1 || day > day1) {
			return true;
		} else {
			return false;
		}
	}

	const renderItem = ({ item }) => {
		const isPast = parseDateTime(item.date);

		return (
			<View style={styles.runningItem}>
				<View style={styles.runningHeader}>
					<View style={styles.textContainer}>
						<Text style={styles.title}>{item.title}</Text>
						<Text>
							{item.date} {item.time}
						</Text>
						<Text>{item.place}</Text>
					</View>
					{/* 완료 버튼을 오른쪽 끝으로 배치 */}
					{item.isCreator && (
						<TouchableOpacity
							style={[
								styles.completeButton,
								isPast ? styles.disabledButton : '',
							]}
							onPress={() => handleComplete(item.id)}
							disabled={isPast} // 미래 러닝일 경우 비활성화
						>
							<Text style={styles.completeButtonText}>
								{isPast ? '진행 전' : '종료하기'}
							</Text>
						</TouchableOpacity>
					)}
				</View>
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
						<Text style={styles.buttonText}>크루 관리</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

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
					title: '크루 관리',
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
		backgroundColor: '#7C4DFF',
		justifyContent: 'center',
		paddingHorizontal: 15,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	listContainer: {
		flexGrow: 1,
		padding: 16,
		backgroundColor: '#EDE7F6',
	},
	runningItem: {
		backgroundColor: '#fff',
		padding: 16,
		marginBottom: 12,
		borderRadius: 8,
		elevation: 2,
	},
	runningHeader: {
		flexDirection: 'row', // 텍스트와 버튼을 한 줄에 배치
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	textContainer: {
		flex: 1, // 텍스트가 가변적으로 공간을 차지하도록 설정
		marginRight: 8, // 버튼과 텍스트 사이의 간격
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	completeButton: {
		backgroundColor: '#1976D2', // 초록색 완료 버튼
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 4,
	},
	completeButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold',
	},
	buttonContainer: {
		flexDirection: 'row',
		marginTop: 12,
		justifyContent: 'space-between',
	},
	chatButton: {
		backgroundColor: '#9575CD',
		padding: 8,
		borderRadius: 5,
		flex: 1,
		marginRight: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	manageButton: {
		backgroundColor: '#7E57C2',
		padding: 8,
		borderRadius: 5,
		flex: 1,
		marginLeft: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	disabledButton: {
		backgroundColor: '#D1C4E9',
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#EDE7F6',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
