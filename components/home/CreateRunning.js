import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import PlaceChoice from './course/PlaceChoice';
import CourseChoice from './course/CourseChoice';

import { NavigationContainer } from '@react-navigation/native';

const CreateRunning = ({ navigation }) => {
	//러닝방 제목
	const [title, setTitle] = useState('');
	//러닝 날짜
	const [date, setDate] = useState(new Date());
	//러닝 시간
	const [time, setTime] = useState(new Date());
	//러닝 시작 장소
	const [place, setPlace] = useState('한성대학교');
	//러닝 코스
	const [course, setCourse] = useState('2.4');
	//러닝 인원
	const [person, setPersons] = useState('');
	//러닝 내용
	const [content, setContent] = useState('');
	// Modal 컴포넌트 표시 여부
	const [isModalVisible, setIsModalVisible] = useState(false);
	// 러닝 참여 승인 여부
	const [isParticipationAccept, setIsParticipationAccept] = useState(false);
	// DatePicker 컴포넌트를 보여줄지 여부
	const [showDatePicker, setShowDatePicker] = useState(false);
	// TimePicker 컴포넌트를 보여줄지 여부
	const [showTimePicker, setShowTimePicker] = useState(false);

	const [showPlaceChoice, setShowPlaceChoice] = useState(false);
	const [showCourseChoice, setShowCourseChoice] = useState(false);

	// 날짜 형식 변환 함수 (예: 2024.11.28 -> 2024.11.28 화요일)
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
		return `${year}.${month}.${day} ${dayOfWeek}요일`;
	};

	// DateTimePicker를 통해서 날짜선택 or 닫기 시 이벤트 처리
	// selectedDate => 선택한 날짜값
	const dateChangeHandler = (event, selectedDate) => {
		const currentDate = selectedDate || date; // 날짜를 선택했으면 그 값으로, 선택안했으면 현재값으로 설정.유지
		setShowDatePicker(false); //DatePicker 닫기
		setDate(currentDate); //선택한 날짜값으로 설정 -> 재렌더링 -> 선택한 날짜값이 디바이스에 표시됨
	};

	const timeChangeHandler = (event, selectedTime) => {
		const currentTime = selectedTime || time;
		setShowTimePicker(false);
		setTime(currentTime);
	};

	const handlePlaceChoice = () => {
		setShowPlaceChoice(true); // 장소 선택 화면을 보여준다
	};

	const handleCourseChoice = () => {
		setShowCourseChoice(true); // 코스 선택 화면을 보여준다
	};

	const placeChoiceHandler = () => {
		// 러닝을 시작할 장소를 선택하는 페이지로 이동.(PlaceChoice.js 정의)
		navigation.navigate(`PlaceChoice`);
	};

	const courseChoiceHandler = () => {
		// 선택한 장소를 기반으로 코스 경로를 선택하는 페이지로 이동.( CourseChoice.js 정의)
		navigation.navigate('CourseChoice', { place });
	};

	// 러닝방 생성 버튼 클릭 시 호출되는 함수
	const createRunningHandler = () => {
		Alert.alert('모집 글을 등록하시겠습니까?', '', [
			{
				text: '취소',
				onPress: () => {},
				style: 'cancel',
			},
			{
				text: '확인',
				onPress: () => {
					// 고유한 ID 생성 (예: 현재 시간 + 랜덤 숫자)
					const id = Date.now() + Math.floor(Math.random() * 1000);
					const runningData = {
						id, // runningData에 id 추가
						title,
						date: formatDate(date),
						time: time.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						}),
						place,
						course,
						person,
						content,
					};
					navigation.navigate('HomeScreen', { runningData });
				},
			},
		]);
	};

	return (
		// 러닝방을 구성하는 화면의 UI

		<View style={styles.container}>
			<Text>제목</Text>
			<TextInput
				style={styles.input}
				value={title}
				onChangeText={setTitle}
				placeholder="러닝방 제목을 입력하세요"
			/>

			<Text>날짜</Text>

			{/* TextInput를 감싸는 TouchableOpacity => TextInput 클릭을 통해 ShowDatePicker = true -> 재렌더링 -> DatePicker 컴포넌트 화면에 출력됨 */}
			<TouchableOpacity onPress={() => setShowDatePicker(true)}>
				<TextInput
					style={styles.input}
					value={date.toLocaleDateString()}
					editable={false}
				/>
			</TouchableOpacity>
			{/*showDatePicker === true, 날짜선택피커 화면에 렌더링 */}
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
					value={course}
					editable={false}
					placeholder="코스 경로를 선택하세요"
				/>
			</TouchableOpacity>

			{/* 조건부로 PlaceChoice 또는 CourseChoice 화면 렌더링 */}
			{showPlaceChoice && (
				<View style={styles.modal}>
					<PlaceChoice
						setPlace={setPlace} // 장소 선택 후 place 상태 변경
						onClose={() => setShowPlaceChoice(false)} // 화면 닫기
					/>
				</View>
			)}

			{showCourseChoice && (
				<View style={styles.modal}>
					<CourseChoice
						navigation={navigation}
						setCourse={setCourse} // 코스 선택 후 course 상태 변경
						onClose={() => setShowCourseChoice(false)} // 화면 닫기
					/>
				</View>
			)}

			<Text>러닝인원</Text>
			<TextInput
				style={styles.input}
				value={person}
				onChangeText={setPersons}
				keyboardType="numeric"
				placeholder="러닝 최대인원을 입력하세요"
			/>

			<Text>러닝 참여 관리</Text>
			{/*Switch 컴포넌트(토글)를 통해 러닝 참여 승인여부를 결정할 수 있음*/}
			<Switch
				value={isParticipationAccept}
				onValueChange={() => {
					setIsParticipationAccept(!isParticipationAccept);
					setIsModalVisible(true);
				}}
			/>

			<Modal
				visible={isModalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text>러닝 참여시 주최자의 승인과정을 거칩니다</Text>
						<Button title="확인" onPress={() => setIsModalVisible(false)} />
					</View>
				</View>
			</Modal>

			<Text>내용을 입력하세요</Text>
			<TextInput
				style={styles.input}
				value={content}
				onChangeText={setContent}
				multiline
			/>

			<Button title="완료" onPress={createRunningHandler} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
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
	input: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		paddingHorizontal: 8,
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

export default CreateRunning;
