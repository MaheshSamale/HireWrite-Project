import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getOrgJobs } from '../../services/organizationServices';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';

// 1. Destructure navigation prop here
export default function OrgJobs({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    if (jobs.length === 0) setLoading(true);

    try {
      const response = await getOrgJobs();
      if (response.status === 'success') {
        setJobs(response.data);
      }
    } catch (error) {
      console.error("Fetch Jobs Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchJobs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'closed': return '#FF5252';
      case 'draft': return 'gray';
      default: return theme.primary;
    }
  };

  // 2. Updated render item to be clickable
  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      // Navigate to JobDetails screen with the specific ID
      onPress={() => navigation.navigate('JobDetails', { jobId: item.job_id })}
    >
      <View style={[styles.card, commonStyles.shadow]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
             <Ionicons name="briefcase-outline" size={24} color={theme.primary} />
          </View>
          <View style={styles.headerTextContainer}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.companyName}>Posted by: {item.recruiter_name || 'Team Member'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
              </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="gray" />
              <Text style={styles.detailText}>{item.location_type}</Text>
          </View>
          <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="gray" />
              <Text style={styles.detailText}>{item.employment_type}</Text>
          </View>
          <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="gray" />
              <Text style={styles.detailText}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Jobs</Text>
        <Text style={styles.headerSubtitle}>Overview of all open positions</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.job_id.toString()}
        renderItem={renderJobItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Ionicons name="documents-outline" size={50} color="#ccc" />
            </View>
            <Text style={styles.emptyText}>No active jobs found.</Text>
            <Text style={styles.emptySubText}>Ask your recruiters to post new openings.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    paddingBottom: 25, // Slightly increased padding
    backgroundColor: theme.primary, 
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)', // Softer white for subtitle
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
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
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: theme.primary + '10', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.black,
  },
  companyName: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 6,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.black,
    marginBottom: 5,
  },
  emptySubText: {
    color: 'gray',
    fontSize: 14,
  }
});