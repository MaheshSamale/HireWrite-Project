import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getJobDetails } from '../../services/organizationServices';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';

export default function JobDetails({ route, navigation }) {
    // Safety check: ensure route.params exists
    const { jobId } = route.params || {}; 
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobId) {
            fetchDetails();
        } else {
            Alert.alert("Error", "No Job ID found");
            setLoading(false);
        }
    }, [jobId]);

    const fetchDetails = async () => {
        try {
            console.log(`Fetching details for Job ID: ${jobId}`);
            const response = await getJobDetails(jobId);
            
            console.log("API Response:", response); // CHECK THIS LOG IN TERMINAL

            if (response && response.status === 'success') {
                setJob(response.data);
            } else {
                Alert.alert("Error", "Failed to load job details.");
            }
        } catch (error) {
            console.error("JobDetails Fetch Error:", error);
            Alert.alert("Error", "Network error or server is down.");
        } finally {
            // This ensures the loader ALWAYS stops, even if there is an error
            setLoading(false);
        }
    };

    const handleEmailRecruiter = () => {
        if (job?.posted_by_email) {
            Linking.openURL(`mailto:${job.posted_by_email}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: 'gray' }}>Loading Job Details...</Text>
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Job data not found.</Text>
                <TouchableOpacity onPress={navigation.goBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Helper to render skill tags
    const SkillTag = ({ skill, type }) => (
        <View style={[styles.skillTag, type === 'preferred' && styles.preferredTag]}>
            <Text style={[styles.skillText, type === 'preferred' && styles.preferredText]}>
                {skill}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.black} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.orgName}>{job.organization_name}</Text>
                    <View style={[styles.statusBadge, job.status === 'active' ? styles.openBadge : styles.closedBadge]}>
                        <Text style={[styles.statusText, job.status === 'active' ? styles.openText : styles.closedText]}>
                            {job.status?.toUpperCase() || 'UNKNOWN'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Statistics Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{job.application_count || 0}</Text>
                    <Text style={styles.statLabel}>Applications</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{job.strong_fits || 0}</Text>
                    <Text style={styles.statLabel}>Strong Fits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{job.avg_fitment_score || '-'}</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Job Snapshot */}
                <View style={[commonStyles.card, styles.card]}>
                    <Text style={styles.sectionTitle}>Snapshot</Text>
                    <View style={styles.row}>
                        <Ionicons name="briefcase-outline" size={20} color={theme.primary} />
                        <Text style={styles.rowText}>{job.experience_min} - {job.experience_max} Years Experience</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={20} color={theme.primary} />
                        <Text style={styles.rowText}>{job.location_type} • {job.employment_type}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                        <Text style={styles.rowText}>Posted: {new Date(job.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={[commonStyles.card, styles.card]}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>{job.jd_text}</Text>
                </View>

                {/* Skills */}
                <View style={[commonStyles.card, styles.card]}>
                    <Text style={styles.sectionTitle}>Skills Required</Text>
                    <View style={styles.skillContainer}>
                        {job.skills_required_json?.map((skill, index) => (
                            <SkillTag key={index} skill={skill} type="required" />
                        ))}
                    </View>
                    
                    {job.skills_preferred_json?.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Preferred Skills</Text>
                            <View style={styles.skillContainer}>
                                {job.skills_preferred_json.map((skill, index) => (
                                    <SkillTag key={index} skill={skill} type="preferred" />
                                ))}
                            </View>
                        </>
                    )}
                </View>

                {/* Recruiter Info */}
                <View style={[commonStyles.card, styles.card]}>
                    <Text style={styles.sectionTitle}>Hiring Manager</Text>
                    <View style={styles.recruiterRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{job.posted_by_name?.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.recName}>{job.posted_by_name}</Text>
                            <Text style={styles.recPos}>{job.posted_by_position}</Text>
                            <TouchableOpacity onPress={handleEmailRecruiter}>
                                <Text style={styles.recEmail}>{job.posted_by_email}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: theme.primary, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee',    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30, },
    backBtn: { marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.white },
    orgName: { fontSize: 16, color: 'gray', marginTop: 4 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
    openBadge: { backgroundColor: '#E8F5E9' },
    closedBadge: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    openText: { color: '#4CAF50' },
    closedText: { color: '#FF5252' },
    
    statsRow: { flexDirection: 'row', backgroundColor: theme.darkGray, padding: 20, justifyContent: 'space-between', alignItems: 'center' },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { color: 'black', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: 'rgba(0, 0, 0, 0.8)', fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },

    content: { padding: 16 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.black, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    rowText: { marginLeft: 10, color: '#555', fontSize: 14 },
    description: { lineHeight: 22, color: '#444' },
    
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    skillTag: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
    skillText: { color: '#1976D2', fontSize: 12, fontWeight: '600' },
    preferredTag: { backgroundColor: '#F5F5F5' },
    preferredText: { color: '#666' },

    recruiterRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    recName: { fontSize: 16, fontWeight: 'bold', color: theme.black },
    recPos: { fontSize: 12, color: 'gray' },
    recEmail: { fontSize: 13, color: theme.primary, marginTop: 4 }
});