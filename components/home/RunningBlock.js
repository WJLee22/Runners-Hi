import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const RunningBlock = ({ item }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>
                {item.date} {item.time}
            </Text>
            <View style={styles.infoContainer}>
                <Image source={require('../../assets/plus.png')} style={styles.icon} />
                <Text style={styles.place}>{item.place}</Text>
                <Image source={require('../../assets/plus.png')} style={styles.icon} />
                <Text style={styles.course}>{item.course}km</Text>
                <View style={styles.personContainer}>
                    <Image source={require('../../assets/plus.png')} style={styles.personIcon} />
                    <Text style={styles.person}>1/{item.person}명</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#708090', // 배경색 설정
        padding: 16,
        marginBottom: 10,
        borderRadius: 10, // 모서리 둥글게
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'white' // 제목 텍스트 색상
    },
    date: {
        fontSize: 16,
        marginBottom: 8,
        color: 'white' // 날짜 텍스트 색상
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    place: {
        marginRight: 10,
        color: 'white' // 장소 텍스트 색상
    },
    course: {
        marginRight: 10,
        color: 'white' // 코스 텍스트 색상
    },
    personContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto', // 오른쪽 정렬
    },
    personIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    person: {
        color: 'white' // 인원 텍스트 색상
    },
});

export default RunningBlock;