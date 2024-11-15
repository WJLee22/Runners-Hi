import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import Home from './Home';
import MyPage from './MyPage';
import MyRunning from './MyRunning';
import RunningHome from './RunningHome';

const Tab = createBottomTabNavigator();

export default function MainApp() {
	return (
		<Tab.Navigator>
			<Tab.Screen name="Home" component={Home} />
			<Tab.Screen name="RunningHome" component={RunningHome} />
			<Tab.Screen name="MyRunning" component={MyRunning} />
			<Tab.Screen name="MyPage" component={MyPage} />
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
