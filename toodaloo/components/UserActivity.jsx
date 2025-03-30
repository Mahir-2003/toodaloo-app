import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../utils/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MyButton } from './MyButton';
import { Ionicons } from "@expo/vector-icons";

export default function UserActivity({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        accessible: false,
        changing_table: false,
        unisex: false
    })

    useEffect(() => {

        const fetchUserData = async () => {
            setLoading(true);
            const currentUser = auth.currentUser;
            
            if (currentUser) {
                setUser(currentUser);
                
                try {
                    // Get user document from Firestore
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    
                    if (userDoc.exists() && userDoc.data().preferences) {
                        // Update state with user preferences
                        setPreferences(userDoc.data().preferences);
                    }
                } catch (error) {
                    console.error("Error fetching user preferences:", error);
                }
            }
            
            setLoading(false);
        };
        
        fetchUserData();

        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []); // only runs once

    // for updating a specific preference
    const togglePreference = async (key) => {
        if (!user) return;

        try {
            // update local state first for immediate feedback
            const newPreferences = {
                ...preferences,
                [key]: !preferences[key]
            };
            setPreferences(newPreferences);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                [`preferences.${key}`]: !preferences[key]
            });
        } catch (error) {
            console.error(`Error updating ${key} preference:`, error.message);
            setPreferences({ ...preferences });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{user ? `${user.name}'s` : 'My'} Profile</Text>
                </View>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>
                <View style={styles.centeredContent}>
                    <View style={styles.loginCard}>
                        <Text style={styles.loginTitle}>Welcome to toodaloo!</Text>
                        <Text style={styles.loginSubtitle}>
                            Please sign in to view your profile, save preferences, and track your bathroom history.
                        </Text>
                        <View style={{ marginBottom: 15 }} />
                        <View style={styles.buttonContainer}>
                            <MyButton
                                text="Log In"
                                style={styles.loginButton}
                                textStyle={styles.loginButtonText}
                                onPress={() => navigation.navigate("Login")}
                            />
                            <View style={{ marginBottom: 15 }} />
                            <Text style={styles.signupText}>
                                Don't have an account? <Text style={styles.signupLink} onPress={() => navigation.navigate("Signup")}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My User Activity</Text>
            </View>

            <ScrollView 
                contentContainerStyle={{ 
                    flexGrow: 1
                }}
              >
            <View style={styles.content}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>My Bathroom Preferences</Text>
                    <Text style={styles.sectionSubtitle}>
                        Set your preferences for the types of bathrooms you prefer.
                        These will be pre-selected when you open the map.
                    </Text>

                    <View style={styles.preferencesContainer}>
                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceText}> ♿ Accessibility</Text>
                            <Switch
                                value={preferences.accessible}
                                onValueChange={() => togglePreference('accessible')}
                                trackColor={{ false: '#d1d1d6', true: '#4169e1' }}
                                thumbColor={preferences.accessible ? '#ffffff' : '#ffffff'}
                                ios_backgroundColor="#d1d1d6"
                            />
                        </View>

                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceText}> 🚼 Changing Table</Text>
                            <Switch
                                value={preferences.changing_table}
                                onValueChange={() => togglePreference('changing_table')}
                                trackColor={{ false: '#d1d1d6', true: '#4169e1' }}
                                thumbColor={preferences.changing_table ? '#ffffff' : '#ffffff'}
                                ios_backgroundColor="#d1d1d6"
                            />
                        </View>

                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceText}>   ⚥  Gender Neutral / Unisex</Text>
                            <Switch
                                value={preferences.unisex}
                                onValueChange={() => togglePreference('unisex')}
                                trackColor={{ false: '#d1d1d6', true: '#4169e1' }}
                                thumbColor={preferences.unisex ? '#ffffff' : '#ffffff'}
                                ios_backgroundColor="#d1d1d6"
                            />
                        </View>
                    </View>
                </View>

            </View>

            <View style={styles.content}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>My Achievements</Text>
                    <Text style={styles.sectionSubtitle}>
                        Earn more badges by posting reviews on the bathrooms you visit!
                    </Text>
                
                    <View style={{
                        height: 70,
                        width: "100%",
                        backgroundColor: '#1338CF',
                        borderRadius: 15,          
                        paddingHorizontal: 5,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        marginBottom: 15
                        }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginLeft: 5}}>
                            Shy Guy
                        </Text>
                        <Text style={{ color: 'white', fontSize: 12, marginLeft: 5}}>
                            Reviewed one bathroom on the app
                        </Text>

                        <Ionicons name="glasses-outline" size={43} color="white" style={{position: "absolute", right: 20, bottom: 2}}/>
                    </View>

                    <View style={{
                        height: 70,
                        width: "100%",
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 15,          
                        paddingHorizontal: 5,
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                        }}>
                        <Text style={{ color: '#000000', fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginLeft: 5}}>
                            Silent but Deadly (LOCKED)
                        </Text>
                        <Text style={{ color: '#333', fontSize: 12, marginLeft: 5}}>
                            Reviewed 30 bathrooms on the app
                        </Text>

                        <Ionicons name="bug-outline" size={38} color="black" style={{position: "absolute", right: 25, bottom: 15}}/>
                    </View>
                </View>
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
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        margin: 0
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 16,
    },
    sectionContainer: {
        marginTop: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    preferencesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 6,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    preferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    preferenceText: {
        fontSize: 16,
        color: '#333',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loginCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 24,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1338CF',
        marginBottom: 10,
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#1338CF',
        width: 220,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    signupLink: {
        color: '#1338CF',
        fontWeight: '500',
    },
});