import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';


export default function TopNavbar() {

    const styles = StyleSheet.create({
        navbar: {
            height: 100,
            width: '100%',
            position: 'absolute',
            justifyContent: 'center',
            // backgroundColor: '#1338cf',
            // alignItems: 'center',
            // paddingHorizontal: 15,
            // paddingTop: 10 
        }
    })
    return (
        <View style={styles.navbar}>
            <Image style={styles.navbar} source={require('../assets/cat.jpg')} />
        </View>
    );
}