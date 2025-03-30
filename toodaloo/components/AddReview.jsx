import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createReview } from '../utils/reviewsManager';
import { auth } from '../utils/firebaseConfig';

export default function AddReview({ navigation, route }) {
    const { bathroom } = route.params;
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!auth.currentUser) {
            Alert.alert(
                "Login Required",
                "You must be logged in to submit a review.",
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

        if (!reviewText.trim()) {
            Alert.alert("Error", "Please enter a review.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReview({
            text: reviewText,
            toiletID: bathroom.id,
        });

            Alert.alert(
                "Success",
                "Your review has been submitted!",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Error submitting review:", error);
            Alert.alert("Error", "Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Review</Text>
                <View style={styles.placeholderButton} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.formContainer}
            >
                <View style={styles.locationCard}>
                    <Text style={styles.locationName}>{bathroom.name}</Text>
                    {bathroom.distance && (
                        <Text style={styles.locationDistance}>{bathroom.distance} miles away</Text>
                    )}
                </View>
                <Text style={styles.label}>Your Review</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Share your experience with this bathroom..."
                    placeholderTextColor="#999"
                    multiline
                    value={reviewText}
                    onChangeText={setReviewText}
                    maxLength={500}
                />
                <Text style={styles.charCount}>{reviewText.length}/500</Text>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting ? styles.submitButtonDisabled : null
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        padding: 4,
    },
    placeholderButton: {
        width: 24,
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    locationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationDistance: {
        fontSize: 14,
        color: '#1338CF',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#333',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#1338CF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    submitButtonDisabled: {
        backgroundColor: '#99a9db',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});