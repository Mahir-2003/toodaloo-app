import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Card } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getToiletReviews, likeReview, dislikeReview } from '../utils/reviewsManager';

export default function BathroomCard({ route, navigation }) {
    const { bathroom } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create a reusable function for fetching reviews
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const bathroomReviews = await getToiletReviews(bathroom.id);
            setReviews(bathroomReviews);
        } catch (error) {
            console.log("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [bathroom.id]);

    // Initial fetch
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Listen for when returning from AddReview screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchReviews();
        });
        
        return unsubscribe;
    }, [navigation, fetchReviews]);

    const openMapsDirections = () => {
        const url = `http://maps.apple.com/?daddr=${bathroom.latitude},${bathroom.longitude}`;
        Linking.openURL(url);
    }

    const handleLikeReview = async (reviewId) => {
        if (!auth.currentUser) {
            Alert.alert(
                "Login Required",
                "You must be logged in to like reviews.",
                [
                    {
                        text: "Log In",
                        onPress: () => navigation.navigate("Login")
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    }
                ]
            );
            return;
        }
        
        try {
            // Update reviews state optimistically
            const updatedReviews = reviews.map(review => {
                if (review.id === reviewId) {
                    const isLiked = review.currentUserLiked || false;
                    const isDisliked = review.currentUserDisliked || false;
                    
                    return {
                        ...review,
                        likes: isLiked ? (review.likes - 1) : (review.likes + 1),
                        dislikes: isDisliked ? (review.dislikes - 1) : review.dislikes,
                        currentUserLiked: !isLiked,
                        currentUserDisliked: isDisliked ? false : review.currentUserDisliked
                    };
                }
                return review;
            });
            
            // Update UI immediately
            setReviews(updatedReviews);
            
            // Make the API call
            await likeReview(reviewId);
            
            // Refresh reviews to ensure data consistency
            fetchReviews();
            
        } catch (error) {
            console.error("Error liking review:", error);
            // Revert to original state if error occurs
            fetchReviews();
        }
    };

    const handleDislikeReview = async (reviewId) => {
        if (!auth.currentUser) {
            Alert.alert(
                "Login Required",
                "You must be logged in to dislike reviews.",
                [
                    {
                        text: "Log In",
                        onPress: () => navigation.navigate("Login")
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    }
                ]
            );
            return;
        }
        
        try {
            // Update reviews state optimistically
            const updatedReviews = reviews.map(review => {
                if (review.id === reviewId) {
                    const isLiked = review.currentUserLiked || false;
                    const isDisliked = review.currentUserDisliked || false;
                    
                    return {
                        ...review,
                        likes: isLiked ? (review.likes - 1) : review.likes,
                        dislikes: isDisliked ? (review.dislikes - 1) : (review.dislikes + 1),
                        currentUserLiked: isLiked ? false : review.currentUserLiked,
                        currentUserDisliked: !isDisliked
                    };
                }
                return review;
            });
            
            // Update UI immediately
            setReviews(updatedReviews);
            
            // Make the API call
            await dislikeReview(reviewId);
            
            // Refresh reviews to ensure data consistency
            fetchReviews();
            
        } catch (error) {
            console.error("Error disliking review:", error);
            // Revert to original state if error occurs
            fetchReviews();
        }
    };

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
                                {bathroom.accesible ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20} />}
                            </Text>
                            <Text style={styles.featureText}>
                                {bathroom.accessible ? 'Accessible' : 'Not Accessible'}
                            </Text>
                        </View>

                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>
                                {bathroom.changingTable ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20} />}
                            </Text>
                            <Text style={styles.featureText}>
                                {bathroom.changingTable ? 'Changing Table' : 'No Changing Table'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.featureContainer}>
                            <Text style={styles.featureIcon}>
                                {bathroom.unisex ? <Ionicons name="checkbox" size={20} /> : <Ionicons name="close-circle" size={20} />}
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

                                <View style={styles.ratingContainer}>
                                    <TouchableOpacity
                                        style={styles.ratingButton}
                                        onPress={() => likeReview(review.id)}
                                    >
                                        <Ionicons name="thumbs-up" size={16} color="#1338CF" />
                                        <Text style={styles.ratingCount}>{review.likes || 0}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.ratingButton}
                                        onPress={() => dislikeReview(review.id)}
                                    >
                                        <Ionicons name="thumbs-down" size={16} color="#ff6b6b" />
                                        <Text style={styles.ratingCount}>{review.dislikes || 0}</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.reviewText}>{review.text}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noReviewsText}>No reviews yet.</Text>
                    )}
                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            right: 10,
                            padding: 8,
                        }}
                        onPress={() => navigation.navigate('AddReview', { bathroom })}
                    >
                        <Ionicons name="add-circle" size={25} />
                    </TouchableOpacity>
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
    ratingContainer: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
        marginRight: 12,
    },
    ratingCount: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
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