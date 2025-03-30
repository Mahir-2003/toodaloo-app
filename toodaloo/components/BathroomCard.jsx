import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Card } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getToiletReviews } from '../utils/reviewsManager';

export default function BathroomCard({ route, navigation }) {
    const { bathroom } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const bathroomReviews = await getToiletReviews(bathroom.id);
                setReviews(bathroomReviews);
            } catch (error) {
                console.log("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [bathroom.id]);

    const openMapsDirections = () => {
        const url = `http://maps.apple.com/?daddr=${bathroom.latitude},${bathroom.longitude}`;
        Linking.openURL(url);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{bathroom.name}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: bathroom.latitude,
                            longitude: bathroom.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        scrollEnabled={false}
                    >
                        <Marker
                            coordinate={{
                                latitude: bathroom.latitude,
                                longitude: bathroom.longitude
                            }}
                            title={bathroom.name}
                        />
                    </MapView>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Bathroom Information</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>
                                {bathroom.accesible ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20}/>}
                            </Text>
                            <Text style={styles.featureText}>
                                {bathroom.accessible ? 'Accessible' : 'Not Accessible'}
                            </Text>
                        </View>

                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>
                                 {bathroom.changingTable ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20}/>}
                            </Text>
                            <Text style={styles.featureText}>
                                {bathroom.changingTable ? 'Changing Table' : 'No Changing Table'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>
                                 {bathroom.unisex ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20}/>}
                            </Text>
                            <Text style={styles.featureText}>
                                {bathroom.unisex ? 'Gender Neutral' : 'Gender Specific'}
                            </Text>
                        </View>

                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>📍</Text>
                            <Text style={styles.featureText}>{bathroom.distance} miles away</Text>
                        </View>
                    </View>

                    {bathroom.directions && bathroom.directions !== 'N/A' && (
                        <View style={styles.directionsContainer}>
                            <Text style={styles.directionsTitle}>Directions:</Text>
                            <Text style={styles.directionsText}>{bathroom.directions}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={openMapsDirections}
                    >
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.reviewsContainer}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color="#1338CF" />
                    ) : reviews.length > 0 ? (
                        reviews.map(review => (
                            <View key={review.id} style={styles.reviewCard}>
                                <Text style={styles.reviewAuthor}>{review.userName || 'Anonymous'}</Text>
                                <Text style={styles.reviewRating}>
                                    Rating: {review.rating} ★
                                </Text>
                                <Text style={styles.reviewText}>{review.comment}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noReviewsText}>No reviews yet.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#1338CF',
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    content: {
        flex: 1,
    },
    mapContainer: {
        height: 200,
        margin: 15,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    detailsContainer: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    featureContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#555',
    },
    directionsContainer: {
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    directionsTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    directionsText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    directionsButton: {
        backgroundColor: '#1338CF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    directionsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    reviewsContainer: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 20,
    },
    reviewCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
    },
    reviewAuthor: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    reviewRating: {
        fontSize: 14,
        color: '#f0a500',
        marginBottom: 6,
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    noReviewsText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 15,
    },
});