import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function CreateRunning({ navigation }) {
    return (
        <View style={styles.container}>
            <Text>Create Running Screen</Text>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});