import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RunningBlock = ({ item }) => (
    <View style={styles.container}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.infoContainer}>
            <View style={styles.info}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.distance}>{item.distance}km</Text>
            </View>
            <View style={styles.participants}>
                <Text>{item.participants}</Text>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        marginRight: 5,
    },
    time: {
        marginRight: 10,
    },
    location: {
        marginRight: 5,
    },
    distance: {
        marginLeft: 5,
    },
    participants: {
        alignItems: 'flex-end',
    },
});

export default RunningBlock;