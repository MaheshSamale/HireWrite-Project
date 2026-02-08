import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { getRecruiterProfile, updateProfilePhoto } from '../../services/recruiterService';
import { theme } from '../../style/theme';
import config from '../../services/config';

export default function Profile() {
    const { logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useFocusEffect(
        useCallback(() => { fetchProfile(); }, [])
    );

    const fetchProfile = async () => {
        try {
            const res = await getRecruiterProfile();
            if (res.status === 'success') setData(res.data);
        } catch (error) { 
            console.error("Profile Fetch Error:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) uploadPhoto(result.assets[0].uri);
    };

    const uploadPhoto = async (uri) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('photo', { uri, name: 'profile.jpg', type: 'image/jpeg' });
        try {
            const res = await updateProfilePhoto(formData);
            if (res.status === 'success') {
                Alert.alert("Success", "Profile photo updated!");
                fetchProfile();
            }
        } catch (e) { 
            Alert.alert("Error", "Upload failed"); 
        } finally { 
            setUploading(false); 
        }
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    // Destructuring based on your specific API response
    const { profile, organization, stats } = data;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* 1. Header Section */}
            <View style={styles.headerCard}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} disabled={uploading}>
                    {profile.profile_photo_url ? (
                        <Image 
                            source={{ uri: `${config.BASE_URL}${profile.profile_photo_url}` }} 
                            style={styles.avatarImg} 
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {profile.recruiter_name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.editIcon}>
                        <Ionicons name="camera" size={16} color="white" />
                    </View>
                    {uploading && (
                        <View style={styles.absLoaderOverlay}>
                            <ActivityIndicator color="white" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.userName}>{profile.recruiter_name}</Text>
                <Text style={styles.userRole}>{profile.position}</Text>
                <Text style={styles.userEmail}>{profile.email}</Text>
            </View>

            {/* 2. Real Stats Section */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{stats.total_jobs}</Text>
                    <Text style={styles.statLabel}>Total Jobs</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                    <Text style={styles.statNum}>{stats.open_jobs}</Text>
                    <Text style={styles.statLabel}>Open</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{stats.total_applications}</Text>
                    <Text style={styles.statLabel}>Applicants</Text>
                </View>
            </View>

            {/* 3. Organization Section */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Organization Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.orgHeader}>
                        {organization.logo_url && (
                            <Image 
                                source={{ uri: `${config.BASE_URL}${organization.logo_url}` }} 
                                style={styles.orgLogo} 
                            />
                        )}
                        <View>
                            <Text style={styles.orgName}>{organization.name}</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(organization.website)}>
                                <Text style={styles.orgLink}>{organization.website}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.orgDesc}>{organization.description}</Text>
                </View>

                {/* 4. Contact Details */}
                <View style={[styles.infoCard, { marginTop: 15 }]}>
                    <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={18} color="#666" />
                        <Text style={styles.contactText}>{profile.mobile}</Text>
                    </View>
                    <View style={[styles.contactRow, { marginTop: 10 }]}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#666" />
                        <Text style={styles.contactText}>Role: {profile.org_role}</Text>
                    </View>
                </View>

                {/* 5. Logout */}
                <TouchableOpacity 
                    style={styles.logoutBtn} 
                    onPress={() => Alert.alert("Logout", "Are you sure you want to exit?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Logout", onPress: logout }
                    ])}
                >
                    <Ionicons name="log-out-outline" size={22} color="#F44336" />
                    <Text style={styles.logoutText}>Logout from Recruiter Portal</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerCard: { 
        backgroundColor: 'white', 
        paddingTop: 60, 
        paddingBottom: 30, 
        alignItems: 'center', 
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30, 
        elevation: 4 
    },
    avatarWrapper: { width: 110, height: 110, borderRadius: 55, marginBottom: 15, position: 'relative' },
    avatarImg: { width: 110, height: 110, borderRadius: 55 },
    avatarPlaceholder: { 
        width: 110, height: 110, borderRadius: 55, 
        backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' 
    },
    avatarText: { color: 'white', fontSize: 44, fontWeight: 'bold' },
    editIcon: { 
        position: 'absolute', bottom: 5, right: 5, 
        backgroundColor: '#333', padding: 8, borderRadius: 20, 
        borderWidth: 3, borderColor: 'white' 
    },
    absLoaderOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        borderRadius: 55, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    userRole: { fontSize: 16, color: theme.primary, fontWeight: '600', marginTop: 2 },
    userEmail: { fontSize: 14, color: 'gray', marginTop: 4 },
    statsRow: { 
        flexDirection: 'row', 
        backgroundColor: 'white', 
        marginHorizontal: 20, 
        marginTop: -25, 
        borderRadius: 20, 
        paddingVertical: 20, 
        elevation: 5 
    },
    statItem: { flex: 1, alignItems: 'center' },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F0F0F0' },
    statNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 12, color: 'gray', marginTop: 4 },
    infoSection: { padding: 20, marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 12 },
    infoCard: { backgroundColor: 'white', padding: 18, borderRadius: 16, elevation: 2 },
    orgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    orgLogo: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
    orgName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    orgLink: { color: theme.primary, fontSize: 14, marginTop: 2 },
    orgDesc: { fontSize: 14, color: '#777', lineHeight: 22 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactText: { marginLeft: 10, fontSize: 15, color: '#444' },
    logoutBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 40, 
        padding: 16, 
        backgroundColor: '#FFF1F0', 
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFA39E'
    },
    logoutText: { color: '#F5222D', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});