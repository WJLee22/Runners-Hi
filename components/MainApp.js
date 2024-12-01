import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { StyleSheet, Image } from 'react-native';

import HomeStack from './stacks/HomeStack';
import MyPageStack from './stacks/MyPageStack';

import MyRunning from './MyRunning';
import RunningHomeStack from './stacks/RunningHomeStack';

const Tab = createBottomTabNavigator();

export default function MainApp() {
	return (
		<Tab.Navigator>
			<Tab.Screen
				name="Home"
				component={HomeStack}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('../assets/home.png')}
							style={{
								width: 30,
								height: 30,
								tintColor: focused ? '#6039ea' : '#ccc',
							}}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="RunningHome"
				component={RunningHomeStack}
				options={{ headerShown: false }}
			/>
			<Tab.Screen name="MyRunning" component={MyRunning} />
			{/* MyPageStack으로 MyPage와 ProfileEdit 포함 */}
			<Tab.Screen
				name="MyPage"
				component={MyPageStack}
				options={{ headerShown: false }}
			/>
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
