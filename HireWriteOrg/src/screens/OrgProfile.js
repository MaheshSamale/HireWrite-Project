import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';
import { logout } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { getOrganizationProfile } from '../../services/organizationServices';

export default function OrgProfile({ onLogoutSuccess }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getOrganizationProfile();
      if (response.status === "success") {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
          await logout(); // 1. Remove tokens from AsyncStorage
          if (onLogoutSuccess) {
            await onLogoutSuccess(); // 2. Tell App.js to re-run checkLogin()
          }
        } 
      }
    ]);
  };

  const ProfileItem = ({ icon, label, value }) => (
    <View style={styles.profileItem}>
      <Ionicons name={icon} size={20} color={theme.primary} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.largeAvatar}>
            <Ionicons name="business" size={40} color="white" />
          </View>
          <Text style={styles.orgName}>{profile?.name || "Organization"}</Text>
          <Text style={styles.orgTagline}>HireWrite Business Portal</Text>
        </View>
      </View>

      <View style={[commonStyles.card, styles.infoCard]}>
        <Text style={styles.sectionTitle}>Company Information</Text>
        <ProfileItem icon="globe-outline" label="Website" value={profile?.website} />
        <ProfileItem icon="mail-outline" label="Official Email" value={profile?.email} />
        <ProfileItem icon="information-circle-outline" label="About" value={profile?.description} />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Sign Out" 
          onPress={handleLogout} 
          backgroundColor="#FF5252"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  header: { backgroundColor: theme.primary, height: 200, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 30 },
  profileHeaderCard: { alignItems: 'center' },
  largeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  orgName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  orgTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  infoCard: { margin: 16, marginTop: -20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.black, marginBottom: 20 },
  profileItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemTextContainer: { marginLeft: 15 },
  itemLabel: { fontSize: 12, color: 'gray' },
  itemValue: { fontSize: 15, color: theme.black, fontWeight: '500' },
  buttonContainer: { paddingHorizontal: 16, marginTop: 10 }
});