import React, { useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Image,
} from 'react-native';

// 더미 참가자 데이터 (닉네임, 러닝 페이스 등 포함)
const participants = [
	{
		id: '1',
		name: 'User1',
		pace: '5:30/km',
		image: 'https://placekitten.com/50/50',
	},
	{
		id: '2',
		name: 'User2',
		pace: '6:00/km',
		image: 'https://placekitten.com/51/51',
	},
	{
		id: '3',
		name: 'User3',
		pace: '5:15/km',
		image: 'https://placekitten.com/52/52',
	},
	{
		id: '4',
		name: 'User4',
		pace: '6:30/km',
		image: 'https://placekitten.com/53/53',
	},
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
			<Image source={{ uri: item.image }} style={styles.profileImage} />
			<View style={styles.participantInfo}>
				<Text style={styles.participantName}>{item.name}</Text>
				<Text style={styles.participantPace}>페이스: {item.pace}</Text>
			</View>

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
		backgroundColor: '#D1C4E9', // 연한 보라색 배경
		paddingHorizontal: 15, // 좌우 여백 추가
		paddingTop: 20, // 상단 여백 추가 (유저 컴포넌트가 위에 붙지 않게)
	},
	listContainer: {
		paddingBottom: 10, // 리스트 아래 여백
	},
	participantCard: {
		backgroundColor: '#B39DDB', // 부드럽고 연한 보라색 카드 배경
		paddingVertical: 12, // 위아래 여백 줄임
		paddingHorizontal: 15, // 좌우 여백 추가
		marginBottom: 8, // 카드 간격 좁힘
		borderRadius: 10,
		flexDirection: 'row', // 가로 방향 정렬
		alignItems: 'center', // 세로 중앙 정렬
		justifyContent: 'space-between', // 아이템 간 간격 조정
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20, // 동그란 이미지
		marginRight: 15, // 이미지와 텍스트 간격
	},
	participantInfo: {
		flex: 1, // 텍스트 영역 확장
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
		backgroundColor: '#FF7043', // 부드러운 오렌지 색상으로 변경
		paddingVertical: 6, // 세로 크기 줄임
		paddingHorizontal: 12, // 좌우 크기 줄임
		borderRadius: 20,
		alignItems: 'center',
	},
	kickButtonText: {
		color: 'white',
		fontSize: 14, // 텍스트 크기 줄임
		fontWeight: 'bold',
	},
});
