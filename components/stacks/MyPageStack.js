import MyPage from '../mypage/MyPage';
import ProfileEdit from '../mypage/ProfileEdit';
import { createStackNavigator } from '@react-navigation/stack';

export default function MyPageStack() {
	const Stack = createStackNavigator();
	return (
		<Stack.Navigator>
			{/* MyPage 기본 화면 */}
			<Stack.Screen
				name="MyPage"
				component={MyPage}
				options={{ headerShown: false }} // MyPage의 헤더 숨기기
			/>
			{/* ProfileEdit 화면 */}
			<Stack.Screen
				name="ProfileEdit"
				component={ProfileEdit}
				options={{
					headerTitle: '프로필 수정', // 헤더 제목 설정
					headerStyle: { backgroundColor: '#6200ea' },
					headerTintColor: '#fff', // 헤더 텍스트 색상
				}}
			/>
		</Stack.Navigator>
	);
}
