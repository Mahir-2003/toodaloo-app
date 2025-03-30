import React, { useEffect, useState, useCallback, useMemo } from 'react'; // Added useMemo
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getToiletReviews, likeReview, dislikeReview } from '../utils/reviewsManager';
import { auth } from '../utils/firebaseConfig'; // Assuming you export auth from firebaseConfig

import { GoogleGenerativeAI } from "@google/generative-ai";
import ENV from "../.env.js";

const API_KEY = ENV.GEMINI_API_KEY;
let genAI;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Gemini API Key not found. Summary feature disabled.");
}

export default function BathroomCard({ route, navigation }) {
    const { bathroom } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State for Gemini Summary ---
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(null);
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'summary'

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

    const generateSummary = useCallback(async (reviewsToSummarize) => {
        if (!genAI || reviewsToSummarize.length === 0) {
            setSummary('No reviews available to summarize.');
            return;
        }

        setSummaryLoading(true);
        setSummaryError(null);
        setSummary(''); // clear previous summary

        // format reviews into a single text block for the prompt
        const reviewsText = reviewsToSummarize
            .map(review => `- ${review.text} (Likes: ${review.likes || 0}, Dislikes: ${review.dislikes || 0})`)
            .join('\n');

        // prompt
        const prompt = `Summarize the following user reviews for a public bathroom. Focus on common themes like cleanliness
        accessibility, amenities (like changing tables), and overall user sentiment. Keep the summary concise (2-3 sentences). Do not just list the reviews.

        Reviews: ${reviewsText}

        Summary:`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            // api call
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summaryText = response.text();

            // update gen AI summary
            setSummary(summaryText);

        } catch (error) {
            console.error("Error generating summary:", error);
            setSummaryError("Could not generate summary. Please try again later.");
            setSummary('');
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    // --- Effect to trigger summary generation when reviews change ---
    useEffect(() => {
        if (reviews.length > 0 && !loading) {
            generateSummary(reviews);
        } else if (reviews.length === 0 && !loading) {
            setSummary('No reviews available to summarize.'); // set message if no reviews
        }
    }, [reviews, loading, generateSummary]); // rerun when messages loading


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

    const renderedReviews = useMemo(() => {
        if (loading) {
             return <ActivityIndicator size="small" color="#1338CF" style={{ marginVertical: 20 }}/>;
        }
        if (reviews.length === 0) {
            return <Text style={styles.noReviewsText}>No reviews yet. Be the first!</Text>;
        }
        return reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>{review.userName || 'Anonymous'}</Text>
                <View style={styles.ratingContainer}>
                    <TouchableOpacity
                        style={styles.ratingButton}
                        onPress={() => handleLikeReview(review.id)}
                        disabled={!auth.currentUser} // Optionally disable if not logged in
                    >
                        <Ionicons
                            name={review.currentUserLiked ? "thumbs-up" : "thumbs-up-outline"}
                            size={16}
                            color={review.currentUserLiked ? "#1338CF" : "#555"}
                        />
                        <Text style={styles.ratingCount}>{review.likes || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ratingButton}
                        onPress={() => handleDislikeReview(review.id)}
                        disabled={!auth.currentUser} 
                    >
                        <Ionicons
                            name={review.currentUserDisliked ? "thumbs-down" : "thumbs-down-outline"}
                            size={16}
                            color={review.currentUserDisliked ? "#ff6b6b" : "#555"}
                        />
                        <Text style={styles.ratingCount}>{review.dislikes || 0}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
            </View>
        ));
    }, [reviews, loading]); 

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
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTab]}
                            onPress={() => setActiveTab('reviews')}
                        >
                            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Reviews ({reviews.length})</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'summary' && styles.activeTab]}
                            onPress={() => setActiveTab('summary')}
                            disabled={!genAI}
                        >
                            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText, !genAI && styles.disabledTabText]}>AI Summary ✨</Text>
                        </TouchableOpacity>
                        {activeTab === 'reviews' && ( // Only show Add button on Reviews tab
                            <TouchableOpacity
                                style={styles.addReviewButton}
                                onPress={() => navigation.navigate('AddReview', { bathroom })}
                            >
                                <Ionicons name="add-circle-outline" size={28} color="#1338CF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {activeTab === 'reviews' && (
                        <View style={styles.tabContent}>
                            {renderedReviews}
                        </View>
                    )}
                    {activeTab === 'summary' && (
                        <View style={styles.tabContent}>
                            {summaryLoading && <ActivityIndicator size="small" color="#1338CF" style={{ marginVertical: 20 }} />}
                            {summaryError && <Text style={styles.errorText}>{summaryError}</Text>}
                            {!summaryLoading && !summaryError && summary && (
                                <Text style={styles.summaryText}>{summary}</Text>
                            )}
                            {!genAI && <Text style={styles.disabledFeatureText}>AI Summary feature requires API configuration.</Text>}
                        </View>
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
        padding: 5,
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
        backgroundColor: '#e0e0e0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapError: { 
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: '#f0f0f0',
    },
    detailsContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginBottom: 15, 
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
        justifyContent: 'space-between',
    },
    featureContainer: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    featureIcon: {
        marginRight: 8,
        width: 20, 
        textAlign: 'center',
    },
    featureText: {
        fontSize: 14,
        color: '#555',
        flexShrink: 1,
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
        marginHorizontal: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f8f9fa',
         position: 'relative', 
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1338CF', 
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555',
    },
    activeTabText: {
        color: '#1338CF',
    },
    disabledTabText: {
        color: '#aaa',
    },
     addReviewButton: {
         position: 'absolute',
         right: 10,
         top: 0,
         bottom: 0,
         justifyContent: 'center',
         paddingHorizontal: 5,
     },
    tabContent: {
        padding: 15,
    },
    reviewCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
    },
    reviewCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
        marginBottom: 15,
    },
    reviewCard: { 
         borderBottomWidth: 0,
         marginBottom: 0,
         paddingBottom: 0,
    },
    reviewAuthor: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        marginRight: 15,
    },
    ratingCount: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginTop: 4,
    },
    noReviewsText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 25, 
    },
    summaryText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        textAlign: 'left', 
        paddingVertical: 10, 
    },
    errorText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        paddingVertical: 20,
    }
});