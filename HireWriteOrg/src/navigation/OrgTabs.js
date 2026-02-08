import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native'; // Import Platform for device-specific sizing
import OrgDashboard from '../screens/OrgDashboard';
import OrgJobs from '../screens/OrgJobs';
import ManageRecruiters from '../screens/ManageRecruiters';
import OrgProfile from '../screens/OrgProfile';

import { theme } from '../../style/theme'; 

const Tab = createBottomTabNavigator();

export default function OrgTabs({ onLogoutSuccess }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        
        // Fixed: Adjusted height and padding to prevent overlap
        tabBarStyle: { 
            height:80,
            paddingBottom:8
        },
        
        // Fixed: Added label styling for better readability
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: Platform.OS === 'android' ? 8 : 0,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'My Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'business' : 'business-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={OrgDashboard} />
      <Tab.Screen name="Jobs" component={OrgJobs} />
      <Tab.Screen name="My Team" component={ManageRecruiters} />
      
      <Tab.Screen name="Profile">
        {(props) => <OrgProfile {...props} onLogoutSuccess={onLogoutSuccess} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}