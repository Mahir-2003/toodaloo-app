import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";

export default function({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        // set default credentials if fields are empty
        const defaultEmail = "test@test.com";
        const defaultPassword = "Test1234";
        const loginEmail = email || defaultEmail;
        const loginPassword = password || defaultPassword;

        await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            .then(async (userCredential) => {
                const user = userCred
            })
    }
}