import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import { MyButton } from './MyButton';

export default function Settings({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
            
            <View style={styles.content}>
                {user ? (
                    // User is signed in
                    <View style={styles.buttonContainer}>
                        <Text style={styles.welcomeText}>
                            Welcome, {user.email}
                        </Text>
                        <MyButton
                            text={loading ? "Signing Out..." : "Sign Out"}
                            style={styles.signOutButton}
                            textStyle={styles.signOutButtonText}
                            onPress={handleSignOut}
                        />
                    </View>
                ) : (
                    // User is not signed in
                    <View style={styles.buttonContainer}>
                        <Text style={styles.infoText}>
                            You are not signed in
                        </Text>
                        <MyButton
                            text="Log In"
                            style={styles.loginButton}
                            textStyle={styles.loginButtonText}
                            onPress={() => navigation.navigate("Login")}
                        />
                        <View style={{ marginBottom: 15 }} />
                        <MyButton
                            text="Sign Up"
                            style={styles.signupButton}
                            textStyle={styles.signupButtonText}
                            onPress={() => navigation.navigate("Signup")}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#1338CF',
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#1338CF',
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    signupButton: {
        backgroundColor: '#1338CF',
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    signupButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    signOutButton: {
        backgroundColor: '#ff3b30',
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    signOutButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});