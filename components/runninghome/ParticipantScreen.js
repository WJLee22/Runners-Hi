import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';

export default function ParticipantsScreen() {
	return (
		<View style={styles.center}>
			<Text>모집이 완료되었습니다.</Text>
			<Text>참가자 목록:</Text>
			{/* 참가자 목록을 여기에 동적으로 추가할 수 있음 */}
			<Text>User1</Text>
			<Text>User2</Text>
			<Text>User3</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
