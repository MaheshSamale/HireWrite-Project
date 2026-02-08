import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/screens/authScreens/Login';
import Register from './src/screens/authScreens/Register';
import OrgTabs from './src/navigation/OrgTabs';
import AddRecruiter from './src/screens/AddRecruiter';
import RecruiterStats from './src/screens/RecruiterStats';
import JobDetails from './src/screens/JobDetails';
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

            <Stack.Screen name="Main">
              {(props) => <OrgTabs {...props} onLogoutSuccess={checkLogin} />}
            </Stack.Screen>
            
            <Stack.Screen name="AddRecruiter" component={AddRecruiter} />
            
            <Stack.Screen
              name="RecruiterStats"
              component={RecruiterStats}
              options={{ headerShown: false }} 
            />


            <Stack.Screen 
              name="JobDetails" 
              component={JobDetails} 
              options={{ headerShown: false }}
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