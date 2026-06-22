import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatsScreen from "./screens/ChatsScreen";
import ArchiveScreen from "./screens/ArchiveScreen";
import ModeScreen from "./screens/ModeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import colors from "./styles/colors";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import ChatInfoScreen from "./screens/ChatInfoScreen";
import CreateChatScreen from "./screens/CreateChatScreen";
import OtherUserProfileScreen from "./screens/OtherUserProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Chats") iconName = "chatbubbles";
          else if (route.name === "Archive") iconName = "archive";
          else if (route.name === "Mode") iconName = "radio";
          else if (route.name === "Settings") iconName = "settings";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 2,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8, // по бокам
        },
        tabBarItemStyle: {
          paddingHorizontal: 4, // между иконками
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "ShantellSans-Regular",
          marginTop: 2, // от иконки
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Archive" component={ArchiveScreen} />
      <Tab.Screen name="Mode" component={ModeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "ShantellSans-Regular": require("./assets/fonts/ShantellSans-Regular.ttf"),
          "ShantellSans-Italic": require("./assets/fonts/ShantellSans-Italic.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn("Ошибка загрузки шрифтов:", error);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="ChatInfo" component={ChatInfoScreen} />
        <Stack.Screen name="CreateChat" component={CreateChatScreen} />
        <Stack.Screen
          name="OtherUserProfile"
          component={OtherUserProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
