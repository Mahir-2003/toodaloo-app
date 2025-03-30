import { useEffect, useState } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyButton } from "./MyButton";
import { MyTextInput } from "./MyTextInput";
import { Image } from "react-native";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (email === '' || password === '') {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                })
        } catch (error) {
            Alert.alert(error.code, error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                navigation.reset({ index: 0, routes: [{ name: "Main" }] });
            } else {
                // console.log("NO USER"); // TODO: proper error message
            }
        });
    }, []);

    return (
        <SafeAreaView
            style={{ // TODO: for all styles, add color!
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                justifyContent: "flex-start",
            }}
        >
            <View
                style={{
                    display: "flex",
                    marginVertical: 10,
                }}
            >
                <Image 
                    style={{ width: 350, height: 350, resizeMode: "contain" }}
                    source={require('../assets/toodaloo.png')}
                />
             </View>
            <MyTextInput
                placeholder={"Email"}
                autoCapitalize={"none"}
                value={email}
                onChangeText={(e) => {
                setEmail(e);
                }}
            />
            <View />
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
                    text={loading ? 'Logging in...' : 'Log In'}
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
                        handleLogin();
                    }}
                />
                <View style={{ marginBottom: 75 }} />
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
                > 
                    Don't Have An Account Yet? <Text style={{ color: '#1338CF', fontWeight: '400' }}>Sign Up Below!</Text> 
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
                    navigation.navigate("Signup");
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "600"}}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// TODO: COLORS
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