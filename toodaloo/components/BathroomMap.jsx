import React, { useEffect, useState } from "react";
import { Alert, Button, Image, Pressable, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet } from 'react-native';

export default function BathroomMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324
  });

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location services to find bathrooms near you.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getUserLocation = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) return;
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(location);
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      });
      
      console.log('User location:', location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setErrorMsg('Error getting location');
      console.warn(err);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);
    
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    map: {
      width: '100%',
      height: '100%',
    }
  });

//   function checkCoordMatches() {
//     fetch()

//   }

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : null}
      
      <MapView
        style={styles.map}
        region={region}
        mapType="standard"
        userInterfaceStyle="dark"
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>
      
      <TouchableOpacity 
        style={styles.button}
      >
      </TouchableOpacity>
    </View>
  );
}

// import { useEffect, useState } from "react";
// import { Alert, Button, Image, Pressable, Text, View } from "react-native";
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import React from 'react';
// import { StyleSheet } from 'react-native';

// export default function BathroomMap() {
    
//     const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     map: {
//         width: '100%',
//         height: '100%',
//     },
//     });

//     return (
//         <MapView style={styles.map} 
//             mapType="standard" 
//             userInterfaceStyle="dark"
//         />
//     );
//     }
