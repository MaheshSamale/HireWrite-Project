import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/screens/authScreens/Login';
import Register from './src/screens/authScreens/Register';
// import Home from './src/screens/Home';
import BottomTabs from './src/navigation/BottomTabs';
import { getToken } from './services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLogin = async () => {
    console.log("in set Login -----------")
    const token = await getToken();
    console.log(token)
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
      <Stack.Screen name="Main" component={BottomTabs} />
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
