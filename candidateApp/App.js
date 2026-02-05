import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/screens/authScreens/Login';
import Register from './src/screens/authScreens/Register';
import BottomTabs from './src/navigation/BottomTabs';
import JobDetails from './src/screens/JobDetails'; // New Screen
import Apply from './src/screens/Apply';   
import ApplicationDetails from './src/screens/ApplicationDetails';       // New Screen
import { getToken } from './services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            {/* Add these so they sit "above" the tabs when navigated to */}
            <Stack.Screen 
              name="JobDetails" 
              component={JobDetails} 
              options={{ headerShown: true, title: 'Job Details' }} 
            />
            <Stack.Screen 
              name="Apply" 
              component={Apply} 
              options={{ headerShown: true, title: 'Application' }} 
            />
            <Stack.Screen 
  name="ApplicationDetails" 
  component={ApplicationDetails} 
  options={{ title: 'Application Status', headerShown: true }} 
/>
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} onLoginSuccess={checkLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}