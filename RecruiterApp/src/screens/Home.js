import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../style/theme';
import commonStyles from '../../style/style';
import { getRecruiterProfile } from '../../services/recruiterService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function Home({ navigation }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Refresh data every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const fetchDashboardData = async () => {
        try {
            const response = await getRecruiterProfile();
            if (response.status === 'success') {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const StatCard = ({ title, value, icon, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Ionicons name={icon} size={30} color={color} />
            <View style={styles.statInfo}>
                <Text style={styles.statValue}>{value || 0}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) return <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />;

    const recruiterName = dashboardData?.profile?.recruiter_name || "Recruiter";
    const organizationName = dashboardData?.organization?.name || "Dashboard";
    const stats = dashboardData?.stats || { total_jobs: 0, total_applications: 0 };

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Welcome back,</Text>
                    <Text style={styles.recruiterName}>{recruiterName}</Text>
                    <Text style={styles.orgName}>{organizationName}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle" size={50} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <StatCard 
                    title="Active Jobs" 
                    value={stats.open_jobs || stats.total_jobs} 
                    icon="briefcase" 
                    color="#1976D2" 
                />
                <StatCard 
                    title="Total Applicants" 
                    value={stats.total_applications} 
                    icon="people" 
                    color="#388E3C" 
                />
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionGrid}>
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => navigation.navigate('Post Job')}
                >
                    <Ionicons name="add-circle" size={32} color={theme.primary} />
                    <Text style={styles.actionText}>Post New Job</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => navigation.navigate('My Jobs')}
                >
                    <Ionicons name="list" size={32} color={theme.primary} />
                    <Text style={styles.actionText}>Manage Jobs</Text>
                </TouchableOpacity>
            </View>

            <View style={[commonStyles.card, styles.tipCard]}>
                <Ionicons name="bulb-outline" size={24} color="#FBC02D" />
                <View style={styles.tipContent}>
                    <Text style={styles.tipText}>
                        <Text style={{fontWeight: 'bold'}}>Pro-tip:</Text> Shortlisted candidates are 3x more likely to respond if you contact them within 48 hours.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
    loader: { flex: 1, justifyContent: 'center' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 30, 
        marginTop: 40 
    },
    welcome: { fontSize: 16, color: 'gray' },
    recruiterName: { fontSize: 26, fontWeight: 'bold', color: theme.black },
    orgName: { fontSize: 14, color: theme.primary, fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: {
        backgroundColor: 'white',
        width: '48%',
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        borderLeftWidth: 5,
    },
    statInfo: { marginLeft: 10 },
    statValue: { fontSize: 22, fontWeight: 'bold' },
    statTitle: { fontSize: 12, color: 'gray' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: {
        backgroundColor: 'white',
        width: '48%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    actionText: { marginTop: 10, fontWeight: '600', color: theme.black },
    tipCard: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFFDE7',
        borderRadius: 12
    },
    tipContent: { flex: 1, marginLeft: 10 },
    tipText: { fontSize: 13, color: '#5D4037' }
});

export default Home;