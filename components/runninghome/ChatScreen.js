import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from 'react-native';

export default function ChatScreen() {
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState([
		{ id: '1', text: '안녕하세요!', sender: 'User1' },
		{ id: '2', text: '안녕하세요, 어떻게 도와드릴까요?', sender: 'User2' },
	]);
	const [currentUser, setCurrentUser] = useState('User1'); // 초기 사용자 'User1'

	// 메시지 전송 함수
	const sendMessage = () => {
		if (newMessage.trim()) {
			const newMessageData = {
				id: (messages.length + 1).toString(),
				text: newMessage,
				sender: currentUser,
			};

			// 메시지 배열에 새 메시지 추가
			setMessages((prevMessages) => [...prevMessages, newMessageData]);

			// 메시지 전송 후 입력창 초기화
			setNewMessage('');

			// 사용자 번갈아가며 전환
			setCurrentUser((prevUser) => (prevUser === 'User1' ? 'User2' : 'User1'));
		}
	};

	// FlatList에 메시지 렌더링
	const renderItem = ({ item }) => (
		<View
			style={[
				styles.messageContainer,
				item.sender === 'User1' ? styles.senderMessage : styles.receiverMessage,
			]}
		>
			<Text style={styles.messageText}>{item.text}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={styles.messageListContainer}
			/>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					value={newMessage}
					onChangeText={setNewMessage}
					placeholder="메시지를 입력하세요"
					placeholderTextColor="#D1C4E9"
				/>
				<TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
					<Text style={styles.sendButtonText}>보내기</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#EDE7F6', // 배경색 (연한 보라색)
		justifyContent: 'flex-end',
	},
	messageListContainer: {
		flexGrow: 1,
		justifyContent: 'flex-start', // 메시지가 위에서부터 아래로 추가됨
		paddingBottom: 10, // 아래에 여백 추가
	},
	messageContainer: {
		padding: 10,
		marginVertical: 5,
		borderRadius: 10,
		maxWidth: '70%',
	},
	senderMessage: {
		backgroundColor: '#673AB7', // 보라색
		alignSelf: 'flex-end', // 오른쪽 정렬
		marginRight: 10,
	},
	receiverMessage: {
		backgroundColor: '#D1C4E9', // 연보라색
		alignSelf: 'flex-start', // 왼쪽 정렬
		marginLeft: 10,
	},
	messageText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	inputContainer: {
		flexDirection: 'row',
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: '#D1C4E9',
		backgroundColor: '#FFFFFF',
	},
	input: {
		flex: 1,
		padding: 10,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#D1C4E9',
		backgroundColor: '#F3E5F5', // 연보라색 배경
	},
	sendButton: {
		marginLeft: 10,
		backgroundColor: '#673AB7',
		padding: 10,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	sendButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
