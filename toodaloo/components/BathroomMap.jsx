import React, { useEffect, useState } from "react";
import { Alert, Text, View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import ENV from "../.env.js";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function BathroomMap() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    //dont worry these are random coordinates
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [bathrooms, setBathrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            Alert.alert(
                'Location Permission Denied',
                'Please enable location services to find bathrooms near you.',
                [{ text: 'OK' }]
            );
            setIsLoading(false);
            return false;
        }
        return true;
    };

    const getUserLocation = async () => {
        setIsLoading(true);
        setFetchError(null);
        setErrorMsg(null);
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        setLocation(currentLocation);

        const newRegion = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        };
        setRegion(newRegion);

        await getBathrooms(currentLocation.coords.latitude, currentLocation.coords.longitude);
    };

    const distanceFromUser = (lat1, lon1, lat2, lon2) => {
        const R = 3958.8; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance.toFixed(1); 
    };

    const getBathrooms = async (latitude, longitude) => {
        setIsLoading(true);
        setFetchError(null);
        setBathrooms([]);

        if (!ENV.RAPID_API_HOST || !ENV.RAPID_API_KEY) {
             setFetchError("API configuration is missing.");
             setIsLoading(false);
             return;
        }

        const headers = {
            "x-rapidapi-host": ENV.RAPID_API_HOST,
            "x-rapidapi-key": ENV.RAPID_API_KEY
        };

        try { 
            const coordinates = `https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${latitude}&lng=${longitude}&radius=10&page=1&per_page=10`;
            const coordinates_resp = await fetch(coordinates, { headers });
            const data = await coordinates_resp.json();

            if (data.length === 0) {
                setBathrooms([]);
                setIsLoading(false);
                return;
            }

            const ids = data.map(bathroom => bathroom?.id).filter(id => id != null);

            if (ids.length === 0) {
                setBathrooms([]);
                setIsLoading(false);
                return;
            }

            const successfullyFetchedBathrooms = [];
            const REQUEST_DELAY = 250;

            for (const id of ids) {
                const detailUrl = `https://public-bathrooms.p.rapidapi.com/api/getById?id=${id}`;
                const response = await fetch(detailUrl, { headers });

                if (response.ok) {
                    const bathroomDetail = await response.json();
                    if (bathroomDetail && typeof bathroomDetail === 'object' && bathroomDetail.id && bathroomDetail.name) {
                        let dist = null;
                        if (location && bathroomDetail.latitude && bathroomDetail.longitude) {
                            const bathLat = parseFloat(bathroomDetail.latitude);
                            const bathLon = parseFloat(bathroomDetail.longitude);
                            
                            if (!isNaN(bathLat) && !isNaN(bathLon)) {
                                dist = distanceFromUser(
                                    location.coords.latitude, 
                                    location.coords.longitude, 
                                    bathLat, 
                                    bathLon
                                );
                            }
                        }
                        
                        successfullyFetchedBathrooms.push({
                            id: bathroomDetail.id,
                            name: bathroomDetail.name,
                            accessible: bathroomDetail.accessible === 1,
                            unisex: bathroomDetail.unisex === 1,
                            changingTable: bathroomDetail.changing_table === 1,
                            directions: bathroomDetail.directions || 'N/A',
                            distance: dist,
                            latitude: parseFloat(bathroomDetail.latitude), 
                            longitude: parseFloat(bathroomDetail.longitude), 
                        });
                    }
                }
                await delay(REQUEST_DELAY);
            }
            
            const sortedBathrooms = [...successfullyFetchedBathrooms].sort((a, b) => {
                if (a.distance && b.distance) {
                    return parseFloat(a.distance) - parseFloat(b.distance);
                }});
            
            setBathrooms(sortedBathrooms);
            
            // if (sortedBathrooms.length === 0 && ids.length > 0) {
            //      setFetchError("Could not fetch details for any nearby bathrooms.");
            // }

        } catch (error) { 
            // setFetchError(`Failed to load bathrooms: ${error.message}`);
            setBathrooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        map: {
            flex: 1,
        },
        cardsContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35%',
            backgroundColor: '#f7f7f7',
            zIndex: 2,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 10,
            paddingHorizontal: 10
        },
        cardsScroll: {
            flex: 1,
        },
        cardsContentContainer: {
            paddingBottom: 15,
            paddingHorizontal: 5,
        },
        card: {
            backgroundColor: '#ffffff',
            width: '100%',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            borderWidth: 1,
            borderColor: '#eee'
        },
        cardTitle: {
            fontWeight: 'bold',
            fontSize: 16,
            color: "#333",
            marginBottom: 4,
        },
        infoText: {
            fontSize: 14,
            color: "#1338CF",
            marginBottom: 5,
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0000004D', 
            zIndex: 10, 
        }, 
        cardText: {
            fontSize: 14,
            color: '#555'
        },
        titleText: {
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 10,
            color: "#1338CF",
            textAlign: 'center',
        },
        errorText: {
            color: 'red',
            textAlign: 'center',
            marginTop: 15
        }
    });

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                mapType="standard"
                userInterfaceStyle="light"
                showsUserLocation={true}
                onRegionChangeComplete={setRegion}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="You are here"
                        pinColor="blue"
                    />
                )}

                {bathrooms.map((bathroom) => {
                    if (bathroom.latitude && bathroom.longitude) {
                        const lat = parseFloat(bathroom.latitude);
                        const lon = parseFloat(bathroom.longitude);
                        
                        if (!isNaN(lat) && !isNaN(lon)) {
                            return (
                                <Marker
                                    key={`marker-${bathroom.id}`}
                                    coordinate={{
                                        latitude: lat,
                                        longitude: lon
                                    }}
                                    title={bathroom.name}
                                    description={bathroom.distance ? `${bathroom.distance} miles away` : ''}
                                    pinColor="red" 
                                />
                            );
                        }
                    }
        return null;
    })}
            </MapView>

            <View style={styles.cardsContainer}>
                <Text style={styles.titleText}>Nearby Bathrooms</Text>

                 {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                 {fetchError && !isLoading && <Text style={styles.errorText}>{fetchError}</Text>}

                {isLoading ? (
                     <ActivityIndicator size="large" color="#1338CF" style={{ marginTop: 30 }}/>
                ) : !fetchError && bathrooms.length === 0 ? (
                    <Text style={styles.infoText}>No bathrooms found nearby or details could not be retrieved.</Text>
                ) : (
                    <ScrollView
                        style={styles.cardsScroll}
                        contentContainerStyle={styles.cardsContentContainer}
                        showsVerticalScrollIndicator={true}
                    >
                        {bathrooms.slice(0, 8).map((bathroom) => (
                            <View
                                key={bathroom.id}
                                style={styles.card}
                            >
                                <Text style={styles.cardTitle}>{bathroom.name}</Text>
                                {bathroom.distance && (
                                    <Text style={styles.infoText}>{bathroom.distance} miles away</Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}