import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const MyRunning = () => {
	const [runningData, setRunningData] = useState({
		totalDistance: 0,
		totalTime: 0,
		participationCount: 0,
		weeklyRunningTimes: [0, 0, 0, 0], // 각 주간 달린 시간 (예시 데이터)
	});

	// 실제 날짜를 기준으로 최근 4주간의 데이터를 계산하는 함수
	const getLastFourWeeksRunningData = () => {
		// 예시: 데이터를 가져오는 방법
		// 실제로는 API나 데이터베이스에서 불러와야 하지만, 여기서는 예시로 주별 데이터 업데이트
		const currentDate = new Date();
		const weeklyData = [5, 7, 6, 8]; // 주별 러닝 시간 (시간 단위, 예시로 4주치)

		// 총 거리, 총 시간, 참여 횟수 업데이트
		const totalDistance = 50; // 예시: 50km
		const totalTime = weeklyData.reduce((acc, time) => acc + time, 0); // 주간 시간 합산
		const participationCount = 15; // 예시: 참여 횟수

		setRunningData({
			totalDistance,
			totalTime,
			participationCount,
			weeklyRunningTimes: weeklyData,
		});
	};

	useEffect(() => {
		getLastFourWeeksRunningData(); // 컴포넌트가 마운트될 때 실제 데이터 불러오기
	}, []);

	// 그래프 데이터 (최근 4주 간 달린 시간 - 24시간 기준)
	const graphData = {
		labels: ['11월 2주', '11월 3주', '11월 4주', '12월 1주'], // X축: 최근 4주
		datasets: [
			{
				data: runningData.weeklyRunningTimes, // Y축: 각 주별 달린 시간
				strokeWidth: 2,
				color: (opacity = 1) => `rgba(67, 162, 233, ${opacity})`, // 선 색상
			},
		],
	};

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.header}>내 러닝 정보</Text>

			<View style={styles.statContainer}>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>총 달린 거리</Text>
					<Text style={styles.statValue}>{runningData.totalDistance} km</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>총 시간</Text>
					<Text style={styles.statValue}>{runningData.totalTime} 분</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>러닝 참여 횟수</Text>
					<Text style={styles.statValue}>
						{runningData.participationCount} 회
					</Text>
				</View>
			</View>

			<Text style={styles.graphTitle}>
				최근 4주간의 달린 시간 (24시간 기준)
			</Text>

			<LineChart
				data={graphData}
				width={screenWidth - 40} // 화면 너비에 맞게 설정
				height={220}
				chartConfig={{
					backgroundColor: '#f0f0f0',
					backgroundGradientFrom: '#D1C4E9',
					backgroundGradientTo: '#673AB7',
					decimalPlaces: 2,
					color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
					labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
					style: {
						borderRadius: 16,
					},
					yAxisLabel: '', // Y축 레이블을 24시간 단위로 표시
					yAxisInterval: 1, // Y축 간격 설정 (1시간 단위로)
					propsForDots: {
						r: '4', // 점의 크기
						strokeWidth: '2',
						stroke: '#ffa726',
					},
				}}
				bezier
				style={styles.graph}
			/>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#EDE7F6', // 연보라색 배경
		padding: 20,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#673AB7', // 보라색
		textAlign: 'center',
	},
	statContainer: {
		marginBottom: 20,
	},
	statItem: {
		marginBottom: 10,
	},
	statLabel: {
		fontSize: 16,
		color: '#673AB7', // 보라색
		fontWeight: 'bold',
	},
	statValue: {
		fontSize: 18,
		color: '#333',
	},
	graphTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#673AB7',
		textAlign: 'center',
	},
	graph: {
		marginVertical: 8,
		borderRadius: 16,
	},
});

export default MyRunning;
