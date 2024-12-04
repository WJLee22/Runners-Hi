import React, { useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from 'react-native';

// 더미 참가자 데이터 (닉네임, 러닝 페이스 등 포함)
const participants = [
	{ id: '1', name: 'User1', pace: '5:30/km' },
	{ id: '2', name: 'User2', pace: '6:00/km' },
	{ id: '3', name: 'User3', pace: '5:15/km' },
	{ id: '4', name: 'User4', pace: '6:30/km' },
];

export default function ParticipantListScreen() {
	const [currentUser, setCurrentUser] = useState('User1'); // 방장

	// 강퇴 함수
	const kickUser = (userName) => {
		Alert.alert('강퇴 확인', `${userName}을 강퇴하시겠습니까?`, [
			{
				text: '취소',
				style: 'cancel',
			},
			{
				text: '강퇴',
				onPress: () => {
					// 강퇴 로직 (여기서는 간단히 콘솔로 출력)
					console.log(`${userName}이 강퇴되었습니다.`);
					// 실제 구현 시, 참가자 목록에서 해당 유저를 삭제하는 코드가 필요합니다.
				},
			},
		]);
	};

	const renderItem = ({ item }) => (
		<View style={styles.participantCard}>
			<Text style={styles.participantName}>{item.name}</Text>
			<Text style={styles.participantPace}>페이스: {item.pace}</Text>

			{currentUser === 'User1' && ( // 방장만 강퇴 가능
				<TouchableOpacity
					style={styles.kickButton}
					onPress={() => kickUser(item.name)}
				>
					<Text style={styles.kickButtonText}>강퇴</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>참가자 목록</Text>
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
		backgroundColor: '#EDE7F6', // 연한 보라색 배경
		paddingHorizontal: 15, // 좌우 여백 추가
	},
	title: {
		fontSize: 22, // 제목 크기 약간 축소
		fontWeight: 'bold',
		color: '#673AB7', // 보라색 텍스트
		marginBottom: 15, // 제목 아래 여백 줄임
		textAlign: 'center',
	},
	listContainer: {
		paddingBottom: 10, // 리스트 아래 여백
	},
	participantCard: {
		backgroundColor: '#673AB7', // 보라색 카드 배경
		paddingVertical: 12, // 위아래 여백 줄임
		paddingHorizontal: 15, // 좌우 여백 추가
		marginBottom: 8, // 카드 간격 좁힘
		borderRadius: 10,
		alignItems: 'center',
	},
	participantName: {
		color: 'white',
		fontSize: 16, // 폰트 크기 적당히 축소
		fontWeight: 'bold',
	},
	participantPace: {
		color: 'white',
		fontSize: 12, // 텍스트 크기 축소
		marginVertical: 3, // 여백 줄임
	},
	kickButton: {
		marginTop: 8, // 위 여백 줄임
		backgroundColor: '#FF5722', // 강퇴 버튼 색상 (빨간색)
		paddingVertical: 4, // 세로 크기 줄임
		paddingHorizontal: 12, // 좌우 크기 줄임
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	kickButtonText: {
		color: 'white',
		fontSize: 14, // 텍스트 크기 줄임
		fontWeight: 'bold',
	},
});
