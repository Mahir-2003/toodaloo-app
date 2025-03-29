import { useEffect, useState } from "react";
import { Alert, Button, Image, Pressable, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function BathroomMap() {
    
    const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    });

    return (
        <MapView style={styles.map} />

    );
    }
