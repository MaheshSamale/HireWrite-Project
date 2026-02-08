import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// Ensure this import matches the function name in your services file
import { getJobsByRecruiter } from '../../services/organizationServices';
import { theme } from '../../style/theme';
import commonStyles from '../../style/style';
import { Ionicons } from '@expo/vector-icons';

export default function RecruiterStats({ route, navigation }) {
  const { recruiterId, name } = route.params;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Use the imported function name here
      const res = await getJobsByRecruiter(recruiterId);
      if (res.status === 'success') {
        setJobs(res.data);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderJobItem = ({ item }) => (
    <View style={[commonStyles.card, styles.jobCard]}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
             {item.status ? item.status.toUpperCase() : 'ACTIVE'}
          </Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color="gray" />
        <Text style={styles.detailText}> {item.location_type}</Text>
        <Text style={styles.separator}>|</Text>
        <Ionicons name="briefcase-outline" size={14} color="gray" />
        <Text style={styles.detailText}> {item.employment_type}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.date}>
        Posted on: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
      </Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.black} />
        </TouchableOpacity>
        <View>
            <Text style={styles.label}>Performance Overview</Text>
            <Text style={styles.recruiterName}>{name}</Text>
        </View>
      </View>

      {/* Stats Summary Card */}
      <View style={styles.summaryContainer}>
        <View style={styles.statBox}>
          {/* Displays the total count of jobs posted */}
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Jobs Posted</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Job History</Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.job_id ? item.job_id.toString() : Math.random().toString()}
        renderItem={renderJobItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
            <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={{color: 'gray', marginTop: 10}}>No jobs posted by this recruiter yet.</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white, paddingHorizontal: 16 },
  header: { marginTop: 50, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15, padding: 5 },
  label: { fontSize: 12, color: theme.primary, fontWeight: '600', textTransform: 'uppercase' },
  recruiterName: { fontSize: 24, fontWeight: 'bold', color: theme.black },
  
  // Stats Section
  summaryContainer: { marginBottom: 25, flexDirection: 'row', justifyContent: 'center' },
  statBox: { 
    backgroundColor: theme.primary, 
    width: '100%',
    paddingVertical: 25, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  statNumber: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 14, color: 'white', opacity: 0.9, marginTop: 5 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: theme.black },
  
  // Job Card Styles
  jobCard: { padding: 15, borderRadius: 12 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: theme.black, flex: 1 },
  statusBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  statusText: { fontSize: 10, color: '#2196F3', fontWeight: 'bold' },
  
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { fontSize: 13, color: '#666' },
  separator: { marginHorizontal: 8, color: '#ddd' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  date: { fontSize: 11, color: '#999', fontStyle: 'italic' },
  
  emptyState: { alignItems: 'center', marginTop: 50 }
});