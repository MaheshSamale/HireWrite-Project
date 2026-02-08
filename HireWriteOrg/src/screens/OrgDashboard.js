import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOrgJobs, getOrgRecruiters } from '../../services/organizationServices';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';

export default function OrgDashboard() {
  const [stats, setStats] = useState({ jobs: 0, recruiters: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, recruitersRes] = await Promise.all([
        getOrgJobs(),
        getOrgRecruiters()
      ]);
      
      setStats({
        jobs: jobsRes.data?.length || 0,
        recruiters: recruitersRes.data?.length || 0
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Reusable Stat Card Component
  const StatCard = ({ label, count, icon, color }) => (
    <View style={[styles.statCard, commonStyles.shadow]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statNumber}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}> Overview</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard 
            label="Total Jobs" 
            count={stats.jobs} 
            icon="briefcase" 
            color={theme.primary} 
          />
          <StatCard 
            label="Recruiters" 
            count={stats.recruiters} 
            icon="people" 
            color="#FF9800" // Orange for contrast
          />
        </View>

        {/* Global Status Card */}
        <View style={[styles.card, commonStyles.shadow]}>
          <View style={styles.cardHeader}>
             <Ionicons name="server-outline" size={20} color={theme.primary} />
             <Text style={styles.cardTitle}>System Status</Text>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>All Systems Operational</Text>
          </View>
          
          <Text style={styles.description}>
             Your organization portal is active. Job postings and recruiter accounts are live and accessible.
          </Text>
        </View>

        {/* Hiring Summary Card */}
        <View style={[styles.card, commonStyles.shadow]}>
          <View style={styles.cardHeader}>
             <Ionicons name="analytics-outline" size={20} color={theme.primary} />
             <Text style={styles.cardTitle}>Hiring Summary</Text>
          </View>

          <Text style={styles.description}>
             You currently have <Text style={styles.highlight}>{stats.recruiters} active recruiters</Text> managing a total of <Text style={styles.highlight}>{stats.jobs} job openings</Text>.
          </Text>
          
          <View style={styles.tipContainer}>
             <Ionicons name="bulb-outline" size={16} color="gray" />
             <Text style={styles.tipText}>Tip: Pull down to refresh these statistics anytime.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 15,
    backgroundColor: theme.primary, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.white  ,
    marginTop: 4,

  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: { 
    width: '48%', 
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: theme.black 
  },
  statLabel: { 
    fontSize: 14, 
    color: 'gray', 
    marginTop: 2,
    fontWeight: '600'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.black,
    marginLeft: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50', // Green
    marginRight: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  description: {
    color: 'gray',
    lineHeight: 22,
    fontSize: 14,
  },
  highlight: {
    color: theme.black,
    fontWeight: 'bold',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 6,
    fontStyle: 'italic',
  }
});