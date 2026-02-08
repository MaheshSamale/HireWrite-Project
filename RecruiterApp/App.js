import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Screens
import Login from "./src/screens/authScreens/Login";
import BottomTabs from "./src/navigation/BottomTabs";
import JobDetails from "./src/screens/JobDetails";
import Applications from "./src/screens/Applications";
import ApplicationDetails from "./src/screens/ApplicationDetails";
import CreateJob from "./src/screens/CreateJob";

const Stack = createNativeStackNavigator();

function NavigationLayout() {
  const { isLoggedIn, loading, checkLogin } = useAuth();

  if (loading) return null; // Or a custom splash screen component

  return (
    <NavigationContainer>
      {/* Global setting: Hide headers for ALL screens by default */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            
            {/* All these screens will now inherit headerShown: false */}
            <Stack.Screen name="JobDetails" component={JobDetails} />
            <Stack.Screen name="Applications" component={Applications} />
            <Stack.Screen name="ApplicationDetails" component={ApplicationDetails} />
            <Stack.Screen name="CreateJob" component={CreateJob} />
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <Login {...props} onLoginSuccess={checkLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationLayout />
    </AuthProvider>
  );
}