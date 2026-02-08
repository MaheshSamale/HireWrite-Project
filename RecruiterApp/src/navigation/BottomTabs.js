import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ManageJobs from '../screens/ManageJobs'; // Replaces Jobs
import CreateJob from '../screens/CreateJob';   // Replaces Apply
import Profile from '../screens/Profile';
// You can use a Dashboard or Home screen for general stats
import Home from '../screens/Home';
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
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Mapping icons to Recruiter specific actions
          if (route.name === 'Dashboard') {
            iconName = 'pie-chart-outline';
          } else if (route.name === 'My Jobs') {
            iconName = 'list-outline';
          } else if (route.name === 'Post Job') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = 'business-outline'; // Business icon for recruiter
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Home} />
      <Tab.Screen name="My Jobs" component={ManageJobs} />
      <Tab.Screen name="Post Job" component={CreateJob} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}