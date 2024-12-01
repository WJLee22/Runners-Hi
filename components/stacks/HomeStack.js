import Home from '../home/Home.js';
import { createStackNavigator } from '@react-navigation/stack';

import CreateRunning from '../../components/home/CreateRunning';
import RunningDetail from '../../components/home/RunningDetail';

import { Image } from 'react-native';

const Stack = createStackNavigator();

export default function HomeStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="HomeScreen"
				component={Home}
				options={{
					headerTitle: () => (
						<Image
							source={require('../../assets/applogo.png')} // logo.png 이미지 경로
							style={{ width: 129, height: 50 }} // 이미지 크기 조절
						/>
					),
					headerLeft: null, // 뒤로가기 버튼 숨기기
				}}
			/>
			<Stack.Screen
				name="CreateRunning"
				component={CreateRunning}
				options={{
					headerTitle: 'Create Running',
				}}
			/>
			<Stack.Screen
				name="RunningDetail"
				component={RunningDetail}
				options={{
					headerTitle: 'Running Detail',
				}}
			/>
		</Stack.Navigator>
	);
}
