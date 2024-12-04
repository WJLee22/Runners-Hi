import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ChatScreen({ route, navigation }) {
  const { runningId } = route.params;
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    const checkParticipantAndFetchMessages = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('로그인이 필요합니다.');
        navigation.goBack();
        return;
      }

      setCurrentUserId(user.uid);

      // 사용자 이름 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUserName(userData.name || '이름 없음');
      } else {
        setCurrentUserName('이름 없음');
      }

      // 러닝 방 참가자 확인
      const runningDocRef = doc(db, 'runnings', runningId);
      const runningDoc = await getDoc(runningDocRef);
      if (runningDoc.exists()) {
        const runningData = runningDoc.data();
        const participants = runningData.participants || [];
        const creatorId = runningData.creatorId;

        // 현재 사용자가 참가자 목록에 없고, 방 생성자도 아닌 경우 접근 제한
        if (!participants.includes(user.uid) && creatorId !== user.uid) {
          Alert.alert('접근 불가', '이 채팅방에 접근 권한이 없습니다.');
          navigation.goBack();
          return;
        }
      } else {
        Alert.alert('오류', '러닝 방 정보를 가져올 수 없습니다.');
        navigation.goBack();
        return;
      }

      // 메시지 실시간 업데이트
      const messagesRef = collection(db, 'runnings', runningId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = [];
        snapshot.forEach((doc) => {
          messagesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setMessages(messagesData);
      });

      return () => unsubscribe();
    };

    checkParticipantAndFetchMessages();
  }, [runningId]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messagesRef = collection(db, 'runnings', runningId, 'messages');
        await addDoc(messagesRef, {
          text: newMessage,
          senderId: currentUserId,
          senderName: currentUserName,
          createdAt: serverTimestamp(),
        });
        setNewMessage('');
      } catch (error) {
        console.error('메시지 전송 오류:', error);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId
          ? styles.senderMessage
          : styles.receiverMessage,
      ]}
    >
      {item.senderId !== currentUserId && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
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
    </KeyboardAvoidingView>
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
    justifyContent: 'flex-start',
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  senderMessage: {
    backgroundColor: '#673AB7', // 보라색
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  receiverMessage: {
    backgroundColor: '#D1C4E9', // 연보라색
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  senderName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
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
    backgroundColor: '#F3E5F5',
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
