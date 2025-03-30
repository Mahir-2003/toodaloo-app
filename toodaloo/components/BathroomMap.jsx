import React, { useEffect, useState } from "react";
import { Alert, Text, View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import ENV from "../.env.js";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function BathroomMap() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
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
            const coordsUrl = `https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${latitude}&lng=${longitude}&radius=10&page=1&per_page=10`;
            const responseByCoords = await fetch(coordsUrl, { headers });

            if (!responseByCoords.ok) {
                throw new Error(`Failed to fetch bathroom list: ${responseByCoords.status}`);
            }

            const data = await responseByCoords.json();

            if (!Array.isArray(data)) {
                throw new Error("Unexpected data format from nearby bathrooms API.");
            }

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
                    const bathroomData = await response.json();
                    if (bathroomData && typeof bathroomData === 'object' && bathroomData.id && bathroomData.name) {
                        successfullyFetchedBathrooms.push({
                           id: bathroomData.id,
                           name: bathroomData.name,
                           accessible: bathroomData.accessible === 1,
                           unisex: bathroomData.unisex === 1,
                           changingTable: bathroomData.changing_table === 1,
                           directions: bathroomData.directions || 'N/A'
                        });
                    }
                }
                await delay(REQUEST_DELAY);
            }

            setBathrooms(successfullyFetchedBathrooms);

            if (successfullyFetchedBathrooms.length === 0 && ids.length > 0) {
                 setFetchError("Could not fetch details for any nearby bathrooms.");
            }

        } catch (error) { 
            setFetchError(`Failed to load bathrooms: ${error.message}`);
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
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            zIndex: 2,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 10,
            paddingHorizontal: 10
            // shadowColor: '#000',
            // shadowOffset: { width: 0, height: -2 },
            // shadowOpacity: 0.1,
            // shadowRadius: 4,
            // elevation: 8,
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
        cardText: {
            fontSize: 14,
            color: '#555',
            // lineHeight: 20,
        },
        titleText: {
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 10,
            color: "#1338CF",
            textAlign: 'center',
        },
        // loadingContainer: {
        //     position: 'absolute',
        //     top: 0,
        //     left: 0,
        //     right: 0,
        //     bottom: 0,
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     backgroundColor: 'rgba(0,0,0,0.3)',
        //     zIndex: 10,
        // },
        infoText: {
             textAlign: 'center',
             marginTop: 25,
             paddingHorizontal: 15,
            //  fontStyle: 'italic',
             fontSize: 15,
             color: '#666',
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
                        {bathrooms.slice(0, 6).map((bathroom) => (
                            <View
                                key={bathroom.id}
                                style={styles.card}
                            >
                                <Text style={styles.cardTitle}>{bathroom.name} </Text>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}