import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
	FlatList,
	Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';

const GOOGLE_API_KEY = 'google-api-key'; // 구글 API 키

export default function PlaceChoice(props) {
	const [markers, setMarkers] = useState([]); // 마커 리스트
	const [selectedPlace, setSelectedPlace] = useState(null); // 선택된 장소
	const [searchResults, setSearchResults] = useState([]); // 검색 결과
	const [selectedItemIndex, setSelectedItemIndex] = useState(null); // 선택된 검색 결과 인덱스
	const mapRef = useRef(null); // 지도 참조

	// 검색창에서 입력된 결과 처리
	const handlePlaceSearch = (data) => {
		setSearchResults(data); // 검색 결과 저장
		setSelectedItemIndex(null); // 선택 초기화
	};

	// 검색 결과 아이템 선택
	const handleSelectItem = (item, index) => {
		setSelectedPlace({
			title: item.description,
			latitude: item.geometry.location.lat,
			longitude: item.geometry.location.lng,
		});
		setSelectedItemIndex(index); // 선택된 인덱스 저장
	};

	// "선택" 버튼 동작
	const handleAddMarker = () => {
		if (selectedPlace) {
			setMarkers((prevMarkers) => [...prevMarkers, selectedPlace]); // 마커 추가
			setSelectedPlace(null); // 선택 초기화

			// 지도 중심 이동
			mapRef.current.animateToRegion(
				{
					latitude: selectedPlace.latitude,
					longitude: selectedPlace.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				},
				1000 // 애니메이션 시간(ms)
			);
		}
	};

	useEffect(() => {
		if (markers) {
			props.setMarkers(markers);
		}
	}, [markers]);

	return (
		<View style={styles.container}>
			{/* 지도 */}
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={{
					latitude: 37.5665, // 서울 중심
					longitude: 126.978,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				}}
			>
				{/* 마커 렌더링 */}
				{markers.map((marker, index) => (
					<Marker
						key={index}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude,
						}}
						title={marker.title}
					/>
				))}
			</MapView>

			{/* 검색 바와 확인 버튼 */}
			<View style={styles.searchBarContainer}>
				<GooglePlacesAutocomplete
					placeholder="장소를 검색하세요"
					fetchDetails={true}
					onFail={(error) => console.error(error)}
					onPress={(data, details = null) => {
						// 주요 키워드 추출
						const mainText = data.structured_formatting.main_text;

						// 상위 컴포넌트로 데이터 전달
						props.setPlace(mainText);

						// 선택된 장소 처리
						handlePlaceSearch([
							{
								...data,
								geometry: details.geometry,
							},
						]);
					}}
					query={{
						key: GOOGLE_API_KEY,
						language: 'ko',
					}}
					styles={{
						textInput: styles.textInput,
						listView: styles.listView,
					}}
				/>

				{/* 확인 버튼 */}
				<TouchableOpacity
					style={styles.confirmButton}
					onPress={() => props.onClose()}
				>
					<Text style={styles.confirmButtonText}>확인</Text>
				</TouchableOpacity>
			</View>

			{/* 검색 결과 리스트 */}
			<FlatList
				data={searchResults}
				keyExtractor={(item, index) => index.toString()}
				style={styles.resultList}
				renderItem={({ item, index }) => (
					<View
						style={[
							styles.resultItem,
							selectedItemIndex === index && styles.selectedResultItem, // 선택된 아이템 배경색 변경
						]}
					>
						<TouchableOpacity
							onPress={() => handleSelectItem(item, index)}
							style={styles.resultTextContainer}
						>
							<Text style={styles.resultText}>{item.description}</Text>
						</TouchableOpacity>
						{/* 선택 버튼 */}
						{selectedItemIndex === index && (
							<TouchableOpacity
								style={styles.selectButton}
								onPress={handleAddMarker}
							>
								<Text style={styles.selectButtonText}>선택</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
			/>
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
		height: '60%', // 지도가 화면의 60% 차지
	},
	searchBarContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		backgroundColor: 'white',
	},
	textInput: {
		flex: 1,
		backgroundColor: '#f0f0f0',
		height: 40,
		borderRadius: 5,
		paddingHorizontal: 10,
	},
	confirmButton: {
		backgroundColor: '#AC58FA',
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 5,
		marginLeft: 10,
	},
	confirmButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
	resultList: {
		flex: 1,
		backgroundColor: 'white',
	},
	resultItem: {
		padding: 15,
		borderBottomColor: '#ddd',
		borderBottomWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	selectedResultItem: {
		backgroundColor: '#e9ecef', // 선택된 아이템 배경색
	},
	resultTextContainer: {
		flex: 1,
	},
	resultText: {
		fontSize: 16,
		color: '#333',
	},
	selectButton: {
		backgroundColor: '#AC58FA',
		paddingVertical: 5,
		paddingHorizontal: 15,
		borderRadius: 5,
	},
	selectButtonText: {
		color: 'white',
		fontSize: 14,
	},
});
