import { View, Text, Button } from 'react-native';

export default function PlaceChoice(props) {
	return (
		<View>
			<Text>hi</Text>
			<Button
				title="장소선택 닫기"
				onPress={() => {
					props.onClose();
				}}
			></Button>
		</View>
	);
}
