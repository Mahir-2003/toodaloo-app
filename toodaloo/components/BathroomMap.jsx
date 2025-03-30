import React, { useEffect, useState } from "react";
import { Alert, Text, View, ScrollView } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet } from 'react-native';
import ENV from "../.env.js";

export default function BathroomMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324
  });
  const [bathrooms, setBathrooms] = useState([]);

  const requestLocationPermission = async () => {
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
  };

  const getUserLocation = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) return;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    setLocation(location);
    
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

    getBathrooms(location.coords.latitude, location.coords.longitude);
  };

  const getBathrooms = (latitude, longitude) => {
    fetch(`https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${latitude}&lng=${longitude}&radius=10&page=1&per_page=10`, {
      headers: {
        "x-rapidapi-host": ENV.RAPID_API_HOST,
        "x-rapidapi-key": ENV.RAPID_API_KEY
      }
    })
    .then(res => res.json())
    .then(data => {
        // console.log(data);
        const id = data.map(bathroom => bathroom.id);
        const getAllData = id.map(id => {
        return fetch(`https://public-bathrooms.p.rapidapi.com/api/getById?id=${id}`, {
            headers: {
            "x-rapidapi-host": ENV.RAPID_API_HOST,
            "x-rapidapi-key": ENV.RAPID_API_KEY
            }
        })
        .then(res => res.json());
        });
        Promise.all(getAllData)
        .then(results => {
        const selectBathroomData = results.map(bathroom => ({
            id: bathroom.id,
            name: bathroom.name,
            accessible: bathroom.accessible === 1,
            unisex: bathroom.unisex === 1,
            changingTable: bathroom.changing_table === 1,
            directions: bathroom.directions
        }));
        console.log(selectBathroomData);
        setBathrooms(selectBathroomData);
        });
        });
        };

        React.useEffect(() => {
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
    },
    cardsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30%', 
      backgroundColor: 'white',
      zIndex: 2,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    //   shadowColor: '#000',
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   shadowRadius: 4,
    //   elevation: 5,
    //   padding: 10
    },
    cardsScroll: {
      width: '100%',
    },
    cardsContentContainer: {
      padding: 5
    },
    card: {
      backgroundColor: '#f8f8f8',
      width: '100%',
      marginBottom: 10,
      padding: 4,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    cardTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 5,
      color: "#1338CF"
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 34,
        // marginBottom: 15,
        color: "#FFFFFF"
      }
    // button: {
    //   position: 'absolute',
    //   bottom: 20,
    //   backgroundColor: '#1a30d9',
    //   paddingVertical: 12,
    //   paddingHorizontal: 20,
    //   borderRadius: 25,
    // }
  });

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
      <View style={styles.cardsContainer}>
        <Text style={styles.headerTitle}>Closest Bathrooms to You</Text>
        <ScrollView 
          style={styles.cardsScroll}
          contentContainerStyle={styles.cardsContentContainer}
        >
          {bathrooms.slice(0, 6).map((bathroom, index) => (
            <View 
                key={bathroom.id ? bathroom.id : `bathroom-${index}`} 
                style={styles.card}
            >
                <Text style={styles.cardTitle}>{bathroom.name}</Text>
            </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );
}

// import React, { useEffect, useState } from "react";
// import { Alert, Button, Image, Pressable, Text, View, TouchableOpacity } from "react-native";
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { StyleSheet } from 'react-native';

// export default function BathroomMap() {
//   const [location, setLocation] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [region, setRegion] = useState({
//     latitude: 37.78825,
//     longitude: -122.4324
//   });

//   const requestLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
      
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         Alert.alert(
//           'Location Permission Denied',
//           'Please enable location services to find bathrooms near you.',
//           [{ text: 'OK' }]
//         );
//         return false;
//       }
//       return true;
//     } catch (err) {
//       console.warn(err);
//       return false;
//     }
//   };

//   const getUserLocation = async () => {
//     const hasPermission = await requestLocationPermission();
    
//     if (!hasPermission) return;
    
//     try {
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
      
//       setLocation(location);
      
//       setRegion({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude
//       });
      
//       console.log('User location:', location.coords.latitude, location.coords.longitude);
//     } catch (err) {
//       setErrorMsg('Error getting location');
//       console.warn(err);
//     }
//   };

//   useEffect(() => {
//     getUserLocation();
//   }, []);
    
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     map: {
//       width: '100%',
//       height: '100%',
//     }
//   });
  
//   function getBathrooms() {
//     const [id, setId] = useState({
//         id: 12345
//     });

//     const [bathrooms, setBathrooms] = useState({
//         bathrooms: {}
//     })

//     useEffect(() => {
//         fetch(`https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${latitude}&lng=${longitude}&radius=10&page=1&per_page=10`) ({
//             headers: {
//                 "x-rapidapi-host": ENV.RAPID_API_HOST,
//                 "x-rapidapi-key": ENV.RAPID_API_KEY
//             }
//         })
//         .then(res => res.json())
//         .then(data => setId((data.map(bathroom => bathroom.id))))
//         getBathroomDetails()
//     }, []);

//     function getBathroomDetails() {
//         useEffect(() => {
//             data = {}
//             fetch(`https://public-bathrooms.p.rapidapi.com/api/getById?id=${id}`) ({
//                 headers: {
//                     "x-rapidapi-host": ENV.RAPID_API_HOST,
//                     "x-rapidapi-key": ENV.RAPID_API_KEY
//                 }
//             })
//             .then(res => res.json())
//             .then(data => data)

//             const bathroomInfo = data.map(bathroom => ({
//                 id: bathroom.id,
//                 name: bathroom.name,
//                 accessible: bathroom.accessible === 1, 
//                 unisex: bathroom.unisex === 1, 
//                 changingTable: bathroom.changing_table === 1, 
//                 directions: bathroom.directions,
//               }));
            
//             setBathrooms(bathroomInfo);

//         }, []);
//     }

//   return (
//     <View style={styles.container}>
//       {errorMsg ? (
//         <Text style={styles.errorText}>{errorMsg}</Text>
//       ) : null}
      
//       <MapView
//         style={styles.map}
//         region={region}
//         mapType="standard"
//         userInterfaceStyle="dark"
//         showsUserLocation={true}
//         followsUserLocation={true}
//       >
//         {location && (
//           <Marker
//             coordinate={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             }}
//             title="You are here"
//           />
//         )}
//       </MapView>
      
//       <View style={styles.cardsContainer}>
//       {bathrooms.slice(0, 6).map((bathroom) => (
//         <View 
//           key={bathroom.id} 
//           style={styles.card}
//         >
//           <Text style={styles.cardTitle}>{bathroom.name}</Text>
//         </View>
//       ))}
//         </View>
        
//         <View 
//         style={styles.button}
//         >
//         </View>
//     </View>
//     );
//     }
// }




// // import { useEffect, useState } from "react";
// // import { Alert, Button, Image, Pressable, Text, View } from "react-native";
// // import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// // import React from 'react';
// // import { StyleSheet } from 'react-native';

// // export default function BathroomMap() {
    
// //     const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //     },
// //     map: {
// //         width: '100%',
// //         height: '100%',
// //     },
// //     });

// //     return (
// //         <MapView style={styles.map} 
// //             mapType="standard" 
// //             userInterfaceStyle="dark"
// //         />
// //     );
// //     }
