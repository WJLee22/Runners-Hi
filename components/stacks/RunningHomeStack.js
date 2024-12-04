import { Image, Button } from 'react-native';
import { StyleSheet } from 'react-native';

import RunningHome from '../runninghome/RunningHome';
import { createStackNavigator } from '@react-navigation/stack';

export default function RunningHomeStack() {
	const Stack = createStackNavigator();

	return (
		<Stack.Navigator>
			<Stack.Screen
				name="RunningHome"
				component={RunningHome}
				options={{
					headerShown: null,
				}}
			/>
		</Stack.Navigator>
	);
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
