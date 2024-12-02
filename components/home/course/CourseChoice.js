import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// Haversine 공식을 사용하여 두 지점 사이의 거리 계산
const haversineDistance = (lat1, lon1, lat2, lon2) => {
	const toRadians = (degree) => (degree * Math.PI) / 180;
	const R = 6371; // 지구 반지름 (킬로미터)

	const lat1Rad = toRadians(lat1);
	const lon1Rad = toRadians(lon1);
	const lat2Rad = toRadians(lat2);
	const lon2Rad = toRadians(lon2);

	const dlat = lat2Rad - lat1Rad;
	const dlon = lon2Rad - lon1Rad;

	const a =
		Math.sin(dlat / 2) * Math.sin(dlat / 2) +
		Math.cos(lat1Rad) *
			Math.cos(lat2Rad) *
			Math.sin(dlon / 2) *
			Math.sin(dlon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // 결과는 킬로미터 단위
	return distance;
};

export default function CourseChoice(props) {
	// center가 배열로 전달되므로 첫 번째 항목을 사용
	const initialCenter =
		props.markers && props.markers.length > 0
			? {
					latitude: props.markers[0].latitude,
					longitude: props.markers[0].longitude,
			  }
			: { latitude: 37.5665, longitude: 126.978 }; // 기본값 설정

	//마커 로딩 시 거리 계산하는 훅
	// 마커 로딩 시 거리 계산하는 훅
	useEffect(() => {
		// 초기 상태에서도 거리 계산을 수행
		if (markers && markers.length > 1) {
			const calculateTotalDistance = (markers) => {
				return markers.reduce((total, marker, index) => {
					if (index === 0) return total; // 첫 마커는 이전 마커가 없으므로 거리 계산 제외
					const prev = markers[index - 1];
					const dist = haversineDistance(
						prev.latitude,
						prev.longitude,
						marker.latitude,
						marker.longitude
					);
					return total + dist;
				}, 0);
			};

			const calculatedDistance = calculateTotalDistance(markers);
			setTotalDistance(calculatedDistance || 0); // 거리 계산 실패 시 0으로 설정
		}
	}, [markers]); // markers 상태가 업데이트될 때마다 실행

	// 초기 마커 설정 및 거리 계산
	useEffect(() => {
		if (props.markers && props.markers.length > 1) {
			setMarkers(props.markers);

			// 거리 계산 수행
			const calculateTotalDistance = (markers) => {
				return markers.reduce((total, marker, index) => {
					if (index === 0) return total; // 첫 마커는 이전 마커가 없으므로 거리 계산 제외
					const prev = markers[index - 1];
					const dist = haversineDistance(
						prev.latitude,
						prev.longitude,
						marker.latitude,
						marker.longitude
					);
					return total + dist;
				}, 0);
			};

			const initialDistance = calculateTotalDistance(props.markers);
			setTotalDistance(initialDistance || 0);
		}
	}, []); // 초기 로딩 시 한 번만 실행

	const [markers, setMarkers] = useState(
		props.markers && props.markers.length > 0 ? props.markers : []
	);

	// 누적 거리 상태
	const [totalDistance, setTotalDistance] = useState(0);

	const mapRef = useRef(null);
	const MAX_MARKERS = 20;

	// 지도 터치 시 마커 추가
	const handleMapPress = (event) => {
		if (markers.length >= MAX_MARKERS) {
			Alert.alert(
				'제한 초과',
				`마커는 최대 ${MAX_MARKERS}개까지만 추가할 수 있습니다.`
			);
			return;
		}

		const { latitude, longitude } = event.nativeEvent.coordinate;

		let newTotalDistance = totalDistance;

		// 마커가 추가되면 첫 번째 마커와의 거리를 계산
		if (markers.length > 0) {
			const lastMarker = markers[markers.length - 1]; // 마지막 마커와 새 마커의 거리 계산
			const newDistance = haversineDistance(
				lastMarker.latitude,
				lastMarker.longitude,
				latitude,
				longitude
			);
			newTotalDistance += newDistance; // 거리 누적
		}

		setMarkers((prevMarkers) => [
			...prevMarkers,
			{ latitude, longitude }, // 새 마커 추가
		]);
		setTotalDistance(newTotalDistance); // 거리 상태 업데이트
	};

	// 마커 클릭 이벤트
	const handleMarkerPress = (index) => {
		if (index === 0) {
			// 시작 마커 클릭 시 알림
			Alert.alert('안내', '시작 위치를 변경하려면 장소를 변경해주세요.');
			return;
		}

		Alert.alert(
			'삭제 확인',
			`선택한 마커 이후의 모든 마커를 삭제하시겠습니까?`,
			[
				{
					text: '취소',
					style: 'cancel',
				},
				{
					text: '삭제',
					onPress: () => {
						// 선택한 마커 이후의 마커를 삭제하고 거리 갱신
						const newMarkers = markers.slice(0, index + 1);
						let newTotalDistance = 0;

						// 첫 마커와 이후 마커 간의 거리 다시 계산
						for (let i = 1; i < newMarkers.length; i++) {
							const lastMarker = newMarkers[i - 1];
							const currentMarker = newMarkers[i];
							newTotalDistance += haversineDistance(
								lastMarker.latitude,
								lastMarker.longitude,
								currentMarker.latitude,
								currentMarker.longitude
							);
						}

						setMarkers(newMarkers); // 남은 마커 업데이트
						setTotalDistance(newTotalDistance); // 거리 갱신
					},
				},
			]
		);
	};

	// 마커 저장 함수
	const handleSaveMarkers = async () => {
		if (markers.length <= 1) {
			Alert.alert('저장 불가', '저장할 마커가 없습니다.');
			return;
		}

		// 부모 컴포넌트에 전달하거나 Firebase에 저장하는 로직
		props.setMarkers(markers);
		const formattedValue = parseFloat(totalDistance).toFixed(2); // 소수점 둘째 자리까지만
		props.setCourse(String(formattedValue)); // 문자열로 변환 후 저장

		Alert.alert('저장 완료', '마커가 성공적으로 저장되었습니다!');
		props.onClose();
	};

	return (
		<View style={styles.container}>
			{/* 지도 */}
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={{
					latitude: initialCenter ? initialCenter.latitude : 37.5665, // 기본 서울 좌표
					longitude: initialCenter ? initialCenter.longitude : 126.978,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				}}
				onPress={handleMapPress}
			>
				{/* 마커 렌더링 */}
				{markers.map((marker, index) => (
					<Marker
						key={index}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude,
						}}
						pinColor={index === 0 ? '#FF5733' : '#AC58FA'} // 첫 번째 마커 색상 다르게 설정
						onPress={() => handleMarkerPress(index)} // 마커 클릭 이벤트
						title={index === 0 ? '시작 위치' : `${index + 1}`} // 시작 마커는 "시작 위치"로 제목 설정
					/>
				))}
				{/* 경로(Polyline) 그리기 */}
				{markers.length > 1 && (
					<Polyline
						coordinates={markers}
						strokeColor="#AC58FA"
						strokeWidth={5}
					/>
				)}
			</MapView>

			{/* 누적 거리 표시 */}
			<View style={styles.distanceContainer}>
				<Text style={styles.distanceText}>
					총 거리:{' '}
					{totalDistance !== undefined ? totalDistance.toFixed(2) : '0'} km
				</Text>
			</View>

			{/* 마커 저장 버튼 */}
			<TouchableOpacity style={styles.saveButton} onPress={handleSaveMarkers}>
				<Text style={styles.saveButtonText}>저장</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	map: {
		width: '100%',
		height: '80%',
	},
	saveButton: {
		width: '100%',
		backgroundColor: '#AC58FA',
		paddingVertical: 10,
		paddingHorizontal: 20,
		alignItems: 'center',
	},
	saveButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
	distanceContainer: {
		position: 'absolute', // 지도 상단 중앙에 위치하도록 설정
		top: 10,
		marginLeft: '55%',
		transform: [{ translateX: -100 }], // 텍스트가 중앙에 오도록 왼쪽에서 100px 이동
		zIndex: 1, // 지도 위에 표시되도록
		backgroundColor: 'rgba(255, 255, 255, 0.7)', // 배경을 투명 흰색으로 설정
		paddingHorizontal: 15,
		paddingVertical: 5,
		borderRadius: 20,
	},
	distanceText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
});
