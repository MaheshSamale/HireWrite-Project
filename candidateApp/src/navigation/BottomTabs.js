import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Jobs from '../screens/Jobs';
import Applied from '../screens/Applied';
import Profile from '../screens/Profile';
import { theme } from '../../style/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 80,
          paddingBottom:8,
          
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Jobs') iconName = 'briefcase-outline';
          else if (route.name === 'Applied') iconName = 'document-text-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Jobs" component={Jobs} />
      <Tab.Screen name="Applied" component={Applied} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
