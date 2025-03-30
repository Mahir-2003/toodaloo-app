import React, { useEffect, useState } from "react";
import { T } from "react-native";
import { Alert, Text, View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import ENV from "../.env.js";
import { getUserPreferences } from "../utils/userPreferences";

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
  const [filteredBathrooms, setFilteredBathrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [filters, setFilters] = useState({
    accessible: false,
    changing_table: false,
    unisex: false
  });

  // get user preferences at start
  useEffect(() => {
    const initializeFilters = async () => {
      try {
        const userPreferences = await getUserPreferences();
        setFilters(userPreferences);
      } catch (error) {
        console.log("Error initializing filters:", error);
      }
    };

    initializeFilters();
  }, []);

  // apply filters whenever filters or bathrooms change
  useEffect(() => {
    if (bathrooms.length > 0) {
      applyFilters();
    }
  }, [filters, bathrooms]);

  const applyFilters = () => {
    const filtered = bathrooms.filter(bathroom => {
      // only apply a filter if it's turned on!!!!
      if (filters.accessible && !bathroom.accessible) return false;
      if (filters.changing_table && !bathroom.changingTable) return false;
      if (filters.unisex && !bathroom.unisex) return false;

      return true;
    });

    setFilteredBathrooms(filtered);
  };

  const toggleFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
      const userCoords = currentLocation.coords;

      const newRegion = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      };
      setRegion(newRegion);

      await getBathrooms(userCoords); // pass coords directly

    } catch (error) {
      setErrorMsg(`Failed to get location: ${error.message}`);
      setFetchError(`Failed to get location: ${error.message}`);
      setIsLoading(false);
    }
  };

  const distanceFromUser = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const getBathrooms = async (userCoords) => {
    if (!userCoords || userCoords.latitude == null || userCoords.longitude == null) {
      setFetchError("User location is not available to find nearby bathrooms.");
      setIsLoading(false);
      setBathrooms([]);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    setBathrooms([]);

    if (!ENV || !ENV.RAPID_API_HOST || !ENV.RAPID_API_KEY) {
      setFetchError("API configuration is missing.");
      setIsLoading(false);
      return;
    }

    const headers = {
      "x-rapidapi-host": ENV.RAPID_API_HOST,
      "x-rapidapi-key": ENV.RAPID_API_KEY
    };

    try {
      const coordinatesUrl = `https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=10&page=1&per_page=10`;
      const coordinates_resp = await fetch(coordinatesUrl, { headers });

      if (!coordinates_resp.ok) {
        throw new Error(`API request failed with status ${coordinates_resp.status}`);
      }

      const data = await coordinates_resp.json();

      if (!Array.isArray(data) || data.length === 0) {
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

          // this was not being done previously, caused issues with markers not being placed and the distance calculations failing
          if (bathroomDetail && typeof bathroomDetail === 'object' && bathroomDetail.id && bathroomDetail.name && bathroomDetail.latitude != null && bathroomDetail.longitude != null) {

            const bathLat = parseFloat(bathroomDetail.latitude);
            const bathLon = parseFloat(bathroomDetail.longitude);
            let dist = null;

            // only calculate distance and add bathroom if coordinates are valid numbers!!!
            // otherwise will cause nasty errors
            if (!isNaN(bathLat) && !isNaN(bathLon)) {
              dist = distanceFromUser(
                userCoords.latitude,
                userCoords.longitude,
                bathLat,
                bathLon
              );

              successfullyFetchedBathrooms.push({
                id: bathroomDetail.id,
                name: bathroomDetail.name,
                accessible: bathroomDetail.accessible === 1 || bathroomDetail.accessible === true,
                unisex: bathroomDetail.unisex === 1 || bathroomDetail.unisex === true,
                changingTable: bathroomDetail.changing_table === 1 || bathroomDetail.changing_table === true,
                directions: bathroomDetail.directions || 'N/A',
                distance: dist,
                latitude: bathLat,
                longitude: bathLon,
              });
            }
            // if coords are invalid after parsing, the bathroom is skipped for this iteration
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        mapType="standard"
        userInterfaceStyle="light"
        showsUserLocation={true}
        onRegionChangeComplete={setRegion} // may cause excessive refetching, be careful
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
        {/* directly use the numeric lat/lon stored in state, checking they are valid numbers */}
        {filteredBathrooms.map((bathroom) => {
          // check if lat and long are valid numbers before rendering, otherwise failure occurs
          if (typeof bathroom.latitude === 'number' && !isNaN(bathroom.latitude) &&
            typeof bathroom.longitude === 'number' && !isNaN(bathroom.longitude)) {
            return (
              <Marker
                key={`marker-${bathroom.id}`}
                coordinate={{
                  latitude: bathroom.latitude,
                  longitude: bathroom.longitude
                }}
                title={bathroom.name}
                description={bathroom.distance ? `${bathroom.distance} miles away` : ''}
                pinColor="red"
              />
            );
          }
          // if coords are not valid numbers in the state, skip rendering this marker
          return null;
        })}
      </MapView>
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.accessible ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => toggleFilter('accessible')}
          >
            <Text style={[
              { fontSize: 16 },
              filters.accessible ? { color: '#fff' } : { color: '#1338CF' }
            ]}>♿</Text>
            <Text style={[
              styles.filterButtonText,
              filters.accessible ? styles.filterTextActive : styles.filterTextInactive
            ]}> Accessible</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.changing_table ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => toggleFilter('changing_table')}
          >
            <Text style={[
              { fontSize: 16 },
              filters.changing_table ? { color: '#fff' } : { color: '#1338CF' }
            ]}>🚼</Text>
            <Text style={[
              styles.filterButtonText,
              filters.changing_table ? styles.filterTextActive : styles.filterTextInactive
            ]}> Changing Table</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.unisex ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => toggleFilter('unisex')}
          >
            <Text style={[
              { fontSize: 16 },
              filters.unisex ? { color: '#fff' } : { color: '#1338CF' }
            ]}>⚥</Text>
            <Text style={[
              styles.filterButtonText,
              filters.unisex ? styles.filterTextActive : styles.filterTextInactive
            ]}> Gender Neutral</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.cardsContainer}>
        <Text style={styles.titleText}>Nearby Bathrooms</Text>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        {fetchError && !isLoading && <Text style={styles.errorText}>{fetchError}</Text>}

        {isLoading ? (
          <ActivityIndicator size="large" color="#1338CF" style={{ marginTop: 30 }} />
        ) : !fetchError && bathrooms.length === 0 ? (
          <Text style={[styles.infoText, { textAlign: 'center', marginTop: 20 }]}>
            No bathrooms found nearby or details could not be retrieved.
          </Text>
        ) : (
          <ScrollView
            style={styles.cardsScroll}
            contentContainerStyle={styles.cardsContentContainer}
            showsVerticalScrollIndicator={true}
          >
            {filteredBathrooms.slice(0, 8).map((bathroom) => (
              <View
                key={`card-${bathroom.id}`}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{bathroom.name}</Text>
                {bathroom.distance !== null && (
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
  },
  filterContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 5,
    alignItems: 'center',
  },
  filterScrollContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1338CF',
  },
  filterButtonInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  filterTextInactive: {
    color: '#333333',
  },
});