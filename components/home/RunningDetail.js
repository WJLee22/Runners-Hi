import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, Alert, Share, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RunningDetail = ({ route, navigation }) => {
    const { item } = route.params;
    const [showContent, setShowContent] = useState(false);

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `러닝 참여해요! ${item.title} - ${item.date} ${item.time} ${item.place}`,
                url: 'https://app-link.com', // 앱 링크로 변경해주자.
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // 공유 성공시 ~~
                } else {
                    // 공유 취소시 ~~
                }
            } else if (result.action === Share.dismissedAction) {
                // 공유 취소시
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "러닝 정보를 삭제하시겠습니까?",
            "",
            [
                {
                    text: "취소",
                    onPress: () => { },
                    style: "cancel"
                },
                {
                    text: "확인",
                    // 삭제 버튼 클릭 시 AsyncStorage에서 해당 러닝정보를 삭제하고 이전 화면인 홈화면으로 이동됨 -> 해당 러닝블록은 제거됨을 확인!
                    onPress: async () => {
                        try {
                            const storedRunningList = await AsyncStorage.getItem('runningList');
                            const parsedList = storedRunningList ? JSON.parse(storedRunningList) : [];
                            // 러닝정보의 id값을 통해 필터링하여 삭제할 러닝정보를 제외한 나머지 러닝정보들을 새로운 배열로 만들어서 AsyncStorage에 저장, 즉 해당 러닝정보를 삭제처리 and update.
                            const updatedList = parsedList.filter(running => running.id !== item.id);
                            await AsyncStorage.setItem('runningList', JSON.stringify(updatedList));
                            navigation.goBack(); // 이전 화면으로 이동
                        } catch (error) {
                            console.error('delete failed:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.5988, // 임시 위도 (실제 위치로 변경)
                    longitude: 127.0373, // 임시 경도 (실제 위치로 변경)
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: 37.5988, // 임시 위도 (실제 위치로 변경)
                        longitude: 127.0373, // 임시 경도 (실제 위치로 변경)
                    }}
                    title={item.place}
                />
            </MapView>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>{item.date} {item.time}</Text>
                <Text>{item.place}</Text>
                <Text>{item.course}km</Text>
            </View>

            <View style={styles.section}>
                <TouchableOpacity onPress={() => setShowContent(!showContent)}>
                    <Text style={styles.sectionTitle}>소개</Text>
                </TouchableOpacity>
                {showContent && <Text>{item.content}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>러너</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>공유</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleDelete}>
                    <Text style={styles.buttonText}>수정/삭제</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: 300,
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    section: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default RunningDetail;