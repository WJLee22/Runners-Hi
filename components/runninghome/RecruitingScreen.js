import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Button,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecruitingScreen() {
	const [runningList, setRunningList] = useState([]);

	useEffect(() => {
		console.log(runningList);
	}, [runningList]);

	// useEffect로 AsyncStorage에서 runningList 데이터를 불러옴
	useEffect(() => {
		const fetchRunningList = async () => {
			try {
				// AsyncStorage에서 runningList 데이터 가져오기
				const storedRunningList = await AsyncStorage.getItem('runningList');

				// 데이터가 있을 경우, JSON으로 파싱하여 상태에 저장
				if (storedRunningList !== null) {
					setRunningList(JSON.parse(storedRunningList));
				}
			} catch (error) {
				console.error('Error fetching running list from AsyncStorage', error);
			}
		};

		fetchRunningList();
	}, []);

	const renderParticipants = () => {
		// 참가자 목록이 있을 때
		if (runningList.length > 0) {
			return (
				<View style={{ width: '95%' }}>
					<FlatList
						data={runningList}
						keyExtractor={(item) => item.id.toString()} // id를 문자열로 변환하여 고유 키로 사용
						renderItem={({ item }) => (
							<>
								{console.log(item)}
								<View style={styles.container}>
									{/* 이벤트 제목 */}
									<Text style={styles.title}>{item.title}</Text>

									{/* 날짜와 시간 */}
									<View style={styles.infoContainer}>
										<Text style={styles.infoText}>{item.time}</Text>
									</View>

									{/* 장소와 거리 */}
									<View style={styles.infoContainer}>
										<Text style={styles.infoText}>{item.place}</Text>
										<Text style={styles.infoText}>{item.course}</Text>
									</View>

									{/* 구분선 */}
									<View style={styles.separator} />

									{/* 참가자 관리 버튼 */}
									<View style={styles.buttonContainer}>
										<TouchableOpacity
											style={styles.button}
											onPress={() => alert('참가자 관리')}
										>
											<Text style={styles.buttonText}>참가자 관리</Text>
										</TouchableOpacity>

										{/* 취소 버튼 */}
										<TouchableOpacity
											style={styles.cancelButton}
											onPress={() => alert('러닝챗')}
										>
											<Text style={styles.cancelButtonText}>러닝챗</Text>
										</TouchableOpacity>
									</View>
								</View>
							</>
						)}
					/>
				</View>
			);
		} else {
			return (
				<View style={styles.noParticipantsContainer}>
					<Text>모집 중입니다. 참가자를 관리하려면 버튼을 클릭하세요.</Text>
					<Button
						title="참가자 관리"
						onPress={() => alert('참가자 관리 버튼')}
					/>
				</View>
			);
		}
	};

	return <View style={styles.center}>{renderParticipants()}</View>;
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		alignItems: 'center',
		padding: 10,
	},
	container: {
		width: '100%',
		padding: 20,
		backgroundColor: '#fff',
		borderRadius: 10, // 모서리 둥글게 처리
		marginBottom: 15, // 컴포넌트 간 간격
		shadowColor: '#000', // 음영 효과
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.5,
		elevation: 5, // 안드로이드 음영 효과
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#333',
	},
	infoContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	infoText: {
		fontSize: 16,
		color: '#555',
	},
	separator: {
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
		marginVertical: 20,
	},
	buttonContainer: {
		flexDirection: 'row', // 버튼을 가로로 나열
		justifyContent: 'space-between', // 버튼 사이에 공간을 넣음
		width: '100%', // 전체 너비를 차지하도록 설정
	},
	cancelButton: {
		flex: 1, // 각 버튼을 같은 크기로 설정
		backgroundColor: '#6039ea', // 보라색 배경
		padding: 12,
		borderRadius: 5,
		marginLeft: 5, // 왼쪽 버튼과 간격을 두기 위해 margin 설정

		alignItems: 'center', // 텍스트 중앙 정렬
	},
	cancelButtonText: {
		color: '#fff', // 흰색 텍스트
		fontSize: 16,
	},
	button: {
		flex: 1, // 각 버튼을 같은 크기로 설정
		backgroundColor: '#fff', // 흰색 배경
		padding: 12,
		borderRadius: 5,
		alignItems: 'center', // 텍스트 중앙 정렬
		borderWidth: 1, // 테두리 추가
		marginRight: 5, // 오른쪽 버튼과 간격을 두기 위해 margin 설정

		borderColor: '#6039ea', // 보라색 테두리
	},
	buttonText: {
		color: '#6039ea', // 보라색 텍스트
		fontSize: 16,
	},
	noParticipantsContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
});
