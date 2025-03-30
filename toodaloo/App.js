import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserActivity from "../toodaloo/components/UserActivity";
import Settings from "../toodaloo/components/Settings";
import BathroomMap from "../toodaloo/components/BathroomMap";
import TopNavbar from "../toodaloo/components/TopNavbar";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Ionicons } from "@expo/vector-icons";

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TopNavbar></TopNavbar>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

