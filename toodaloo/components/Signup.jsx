import { useEffect, useState } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyButton } from "./MyButton";
import { MyTextInput } from "./MyTextInput";
import { Image } from "react-native";

export default function Signup({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (email === '' || password === '' || name === '') {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // initialize the reviews to empty list
            const reviews = [];
            // initialize preferences to all off at start
            // user must change them later

            // Initialize the user document with required structure
            await setDoc(doc(db, "users", user.uid), {
                email: email.toLowerCase().trim(),
                uid: user.uid,
                name: name.trim(),
                reviews: [], // initialize the reviews to empty list
                // initialize preferences to all off at start
                // user can change them later
                preferences: {
                    'accessible': false,
                    'changing_table': false,
                    'unisex': false,
                },
                createdAt: new Date(),
            });
        } catch (error) {
            Alert.alert(error.code, error.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                navigation.reset({ index: 0, routes: [{ name: "Main" }]});
            } else {
                // console.log("NO USER - signup");
            }
        });
    }, []);

    return (
        <SafeAreaView
            style={{ // TODO: for all styles, add color!
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "column",
            }}
        >
            <View
                style={{
                    display: "flex",
                    marginVertical: 150,
                }}
            >
                {/* <Image>TODO: LOGO</Image> */}
            </View>
            <MyTextInput
                placeholder={"Name"}
                autoCapitalize={"words"}
                value={name}
                onChangeText={(e) => {
                setName(e);
                }}
            />
            <View style={{ marginBottom: 30 }} />
            <MyTextInput
                placeholder={"Email"}
                autoCapitalize={"none"}
                value={email}
                onChangeText={(e) => {
                setEmail(e);
                }}
            />
            <View style={{ marginBottom: 30 }} />
            <View style={{ 
                width: '80%', 
                flexDirection: 'row', 
                alignItems: 'center',
                position: 'relative'
            }}>
                <TextInput
                    placeholder={"Password"}
                    style={[styles.input, {width: '100%', marginLeft: 0}]}
                    autoCapitalize={"none"}
                    value={password}
                    secureTextEntry={!isPasswordVisible}
                    // selectionColor={}
                    onChangeText={(e) => {
                        setPassword(e)
                    }}
                />
                <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={{ 
                        position: "absolute",
                        right: 10,
                        padding: 8,
                    }}
                >
                {isPasswordVisible ? (
                    <Ionicons name="eye-off-outline" size={20} />
                ) : (
                    <Ionicons name="eye-outline" size={20} />
                )}
                </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 30 }} />
            <View style={{ flexDirection: "column", width: "80%" }}>
                <MyButton
                    text={loading ? 'Signing in...' : 'Sign In'}
                    style={{
                        width: "100%",
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 0,
                        backgroundColor: "#1338CF",
                        borderRadius: 6
                    }}
                    textStyle={{color: "white", fontWeight: "600"}}
                    onPress={() => {
                        handleSignup();
                    }}
                />
                <View style={{ marginBottom: 10 }} />
                <Text
                    style={{
                    fontSize: 14,
                    // fontWeight: '500',
                    textAlign: 'center',
                    marginVertical: 10,
                    color: '#555',
                    letterSpacing: 0.5,
                    // Add shadow for depth
                    textShadowColor: 'rgba(0, 0, 0, 0.1)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 1
                    }}
                    onPress={() => {
                        navigation.navigate("Login");
                    }}
                > 
                    Already Have An Account? <Text style={{ color: '#1338CF', fontWeight: '400' }}>Log In Below!</Text> 
                </Text>
                <TouchableOpacity
                    style={{
                        width: "100%",
                        backgroundColor: "#1338CF",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 40,
                        borderRadius: 6,
                    }}
                    onPress={() => {
                    navigation.navigate("Login");
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "600"}}>Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    input: {
        height: 40,
        width: '80%',
        // borderColor: colors.alt,
        borderBottomWidth: 1.5,
        // backgroundColor: colors.secondaryPink,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
        // textDecorationColor: colors.alt,
        margin: 6,
        marginLeft: 25,
        padding: 10,
    },
  });
  