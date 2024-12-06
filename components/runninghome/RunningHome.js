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
	updateDoc,
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

	// 러닝 완료 처리
	const handleComplete = async (runningId) => {
		try {
			Alert.alert(
				'러닝 완료',
				'이 러닝을 완료로 표시하시겠습니까?',
				[
					{
						text: '취소',
						style: 'cancel',
					},
					{
						text: '완료',
						onPress: async () => {
							// Firebase에 완료 상태 업데이트
							const runningRef = doc(db, 'runnings', runningId);
							await updateDoc(runningRef, { isCompleted: true });

							// UI 업데이트
							setRunnings((prevRunnings) =>
								prevRunnings.filter((running) => running.id !== runningId)
							);
							Alert.alert('완료되었습니다!');
						},
					},
				],
				{ cancelable: true }
			);
		} catch (error) {
			console.error('러닝 완료 처리 중 오류:', error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchRunnings();
		}, [fetchRunnings])
	);

	const renderItem = ({ item }) => (
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
						style={styles.completeButton}
						onPress={() => handleComplete(item.id)}
					>
						<Text style={styles.completeButtonText}>종료하기</Text>
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
