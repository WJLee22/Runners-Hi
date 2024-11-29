import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const RunningBlock = ({ item, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.date}>
                        {item.date} {item.time}
                    </Text>
                    <View style={styles.personContainer}>
                        <Image source={require('../../assets/person.png')} style={styles.personIcon} />
                        <Text style={styles.person}>1/{item.person}명</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <Image source={require('../../assets/place.png')} style={styles.icon} />
                    <Text style={styles.place}>{item.place}</Text>
                    <Image source={require('../../assets/course.png')} style={styles.icon} />
                    <Text style={styles.course}>{item.course}km</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: `rgb(255, 255, 255)`,
        padding: 16,
        marginTop: 10,
        borderRadius: 10,
        borderBottomWidth: 3,
        borderBottomColor: 'rgb(220, 220, 220)',
        borderTopWidth: 3,
        borderTopColor: 'rgb(220, 220, 220)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'rgb(50, 50, 50)', // Changed to dark grey
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    date: {
        fontSize: 16,
        color: `rgb(180, 150, 255)`,
        fontWeight: 'bold',
    },
    personContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    place: {
        marginRight: 10,
        color: 'rgb(50, 50, 50)', // Changed to dark grey
    },
    course: {
        marginRight: 10,
        color: 'rgb(50, 50, 50)', // Changed to dark grey
    },
    personIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    person: {
        color: 'rgb(50, 50, 50)', // Changed to dark grey
    },
});

export default RunningBlock;