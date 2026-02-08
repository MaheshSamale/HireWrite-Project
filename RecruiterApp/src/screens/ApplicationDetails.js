import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    Linking,
    Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateApplicationStage } from '../../services/recruiterService';
import { theme } from '../../style/theme';
import StatusBadge from '../components/StatusBadge';
import config from '../../services/config';

export default function ApplicationDetails({ route, navigation }) {
    const { app } = route.params; 
    
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 1. Construct Image URL safely
    // If profile_photo_url starts with http, use it directly. Otherwise, prepend BASE_URL.
    let profileImageUrl = null;
    if (app.profile_photo_url) {
        if (app.profile_photo_url.startsWith('http')) {
            profileImageUrl = app.profile_photo_url;
        } else {
            // Remove extra slash if present to avoid double //
            const cleanPath = app.profile_photo_url.startsWith('/') 
                ? app.profile_photo_url.substring(1) 
                : app.profile_photo_url;
            profileImageUrl = `${config.BASE_URL}/${cleanPath}`;
        }
    }

    const handleUpdate = async (newStage) => {
        Alert.alert(
            "Update Stage",
            `Move ${app.candidate_name} to ${newStage.toUpperCase()}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await updateApplicationStage(app.application_id, newStage);
                            Alert.alert("Success", `Candidate moved to ${newStage}`);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Error", "Update failed. Please try again.");
                        } finally {
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    const openResume = () => {
        if (!app.resume_storage_path) {
            Alert.alert("No Resume", "This candidate has not uploaded a resume.");
            return;
        }
        
        // Similar logic for resume URL construction
        let fullPath = app.resume_storage_path;
        if (!fullPath.startsWith('http')) {
             const cleanPath = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
             fullPath = `${config.BASE_URL}/${cleanPath}`;
        }

        Linking.openURL(fullPath).catch(err => {
            console.error("Couldn't load page", err);
            Alert.alert("Error", "Could not open resume link.");
        });
    };

    const ScoreBadge = ({ label, score }) => (
        <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{score ?? '0'}%</Text>
            <Text style={styles.scoreLabel}>{label}</Text>
        </View>
    );

    // Helper to get initials safely from candidate_name
    const getInitials = () => {
        return app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : '?';
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* 1. Candidate Identity */}
                <View style={styles.profileSection}>
                    <TouchableOpacity 
                        style={styles.absoluteBackBtn} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.avatar}>
                        {profileImageUrl && !imageError ? (
                            <Image 
                                source={{ uri: profileImageUrl }} 
                                style={styles.avatarImage} 
                                resizeMode="cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        )}
                    </View>
                    
                    {/* Use candidate_name, NOT name */}
                    <Text style={styles.name}>{app.candidate_name || 'Unknown Candidate'}</Text>
                    <Text style={styles.email}>{app.email}</Text>
                    
                    <View style={{ marginTop: 12 }}>
                        <StatusBadge stage={app.stage} />
                    </View>
                </View>

                {/* 2. AI Scoring Section */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>AI Smart Analysis</Text>
                        {app.fit_flag === 1 && (
                            <View style={styles.matchBadge}>
                                <Ionicons name="sparkles" size={10} color="#2E7D32" />
                                <Text style={styles.matchText}> TOP MATCH</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.scoreContainer}>
                        <ScoreBadge label="Keywords" score={app.keyword_score} />
                        <ScoreBadge label="Semantic" score={app.semantic_score} />
                    </View>

                    {app.fitment_explanation ? (
                        <View style={styles.aiExplanation}>
                            <Ionicons name="bulb" size={18} color={theme.primary} />
                            <Text style={styles.explanationText}>{app.fitment_explanation}</Text>
                        </View>
                    ) : (
                        <Text style={{color: 'gray', fontSize: 13, marginTop: 10}}>No AI analysis available yet.</Text>
                    )}
                </View>

                {/* 3. Contact Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contact & Info</Text>
                    
                    <TouchableOpacity onPress={() => app.mobile && Linking.openURL(`tel:${app.mobile}`)} style={styles.detailRow}>
                        <Ionicons name="call-outline" size={18} color={theme.primary} />
                        <Text style={[styles.detailText, {color: theme.primary, fontWeight: '600'}]}>
                            {app.mobile || "Not provided"}
                        </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.resumeBtn} onPress={openResume}>
                        <Ionicons name="document-text-outline" size={20} color="white" />
                        <Text style={styles.resumeBtnText}>View Resume</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Action Pipeline */}
                <View style={styles.actionBox}>
                    <Text style={styles.sectionTitle}>Manage Pipeline</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} />
                    ) : (
                        <View>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: theme.primary }]} 
                                    onPress={() => handleUpdate('shortlisted')}
                                >
                                    <Text style={styles.btnText}>Shortlist</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#673AB7' }]} 
                                    onPress={() => handleUpdate('interview')}
                                >
                                    <Text style={styles.btnText}>Interview</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.buttonRow, { marginTop: 12 }]}>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} 
                                    onPress={() => handleUpdate('hired')}
                                >
                                    <Text style={styles.btnText}>Hire</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]} 
                                    onPress={() => handleUpdate('rejected')}
                                >
                                    <Text style={styles.btnText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FA' },
    profileSection: {
        backgroundColor: 'white', 
        alignItems: 'center', 
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30, 
        elevation: 2,
        position: 'relative'
    },
    absoluteBackBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: '#F0F0F0',
        padding: 8,
        borderRadius: 20
    },
    avatar: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: '#E3F2FD',
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 12,
        borderWidth: 3, 
        borderColor: 'white',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        overflow: 'hidden' 
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: { 
        fontSize: 36, 
        fontWeight: 'bold', 
        color: theme.primary,
        textAlign: 'center'
    },
    name: { fontSize: 24, fontWeight: 'bold', color: '#222' },
    email: { fontSize: 14, color: '#666', marginTop: 4 },
    card: {
        backgroundColor: 'white', marginHorizontal: 16, marginTop: 16,
        padding: 18, borderRadius: 16, elevation: 1
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    matchBadge: { 
        backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, 
        borderRadius: 20, flexDirection: 'row', alignItems: 'center' 
    },
    matchText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
    scoreContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    scoreBox: { alignItems: 'center' },
    scoreValue: { fontSize: 22, fontWeight: 'bold', color: theme.primary },
    scoreLabel: { fontSize: 12, color: '#888', marginTop: 4 },
    aiExplanation: {
        backgroundColor: '#F0F7FF', padding: 14, borderRadius: 12,
        flexDirection: 'row', marginTop: 10, borderLeftWidth: 4, borderLeftColor: theme.primary
    },
    explanationText: { fontSize: 13, color: '#444', marginLeft: 10, flex: 1, lineHeight: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    detailText: { marginLeft: 12, color: '#444', fontSize: 15 },
    resumeBtn: {
        backgroundColor: '#333', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', padding: 14, borderRadius: 12, marginTop: 5
    },
    resumeBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
    actionBox: { padding: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { flex: 0.48, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});