import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserActivity from "../components/UserActivity";
import Settings from "../components/Settings";
import BathroomMap from "../components/BathroomMap";

import { Ionicons } from "@expo/vector-icons";
const Tab = createBottomTabNavigator();

function TopNavbar() {

  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        safeAreaInsets: { top: 0 },
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "User") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          size = 25;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12, 
          fontWeight: '500'
        },
        tabBarStyle: {
          backgroundColor: '#1338CF', 
          height: 75, 
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0
        },
        tabBarActiveTintColor: '#ffffff', 
        tabBarInactiveTintColor: '#f0f0f0'
      })}
    >
      <Tab.Screen name="Map" component={BathroomMap} />
      <Tab.Screen name="User" component={UserActivity} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default TopNavbar;