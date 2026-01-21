import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image ,
} from 'react-native';
import { theme } from '../../style/theme';
import Button from '../components/Button';
import { getAllJobs } from '../../services/candidateServices';

function Jobs({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const result = await getAllJobs();

      if (result.status === 'success') {
        setJobs(result.data.jobs);
      }
    } catch (error) {
      alert('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace('-', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  

  const renderJob = ({ item }) => (
    <View style={styles.card}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={
            item.logo_url
              ? { uri: item.logo_url }
              : require('../assets/company.png') // fallback logo
          }
          style={styles.logo}
        />
  
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.organization_name}</Text>
        </View>
      </View>
  
      {/* Job Meta */}
      <View style={styles.row}>
      <Text style={styles.meta}>{formatText(item.location_type)}</Text>
    <Text style={styles.meta}>{formatText(item.employment_type)}</Text>

      </View>
  
      <Text style={styles.exp}>
        Experience: {item.experience_min} – {item.experience_max} yrs
      </Text>
  
      <Button
        title="View Details"
        marginTop={12}
        onPress={() =>
          navigation.navigate('JobDetails', { job: item })
        }
      />
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.job_id}
        renderItem={renderJob}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.lightGray,
      padding: 16,
      marginTop: 16,
    },
  
    card: {
      backgroundColor: theme.white,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      elevation: 5,
    },
  
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
  
    logo: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: theme.darkGray,
    },
  
    headerText: {
      flex: 1,
    },
  
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.black,
    },
  
    company: {
      fontSize: theme.fontSize.sm,
      color: '#666',
      marginTop: 2,
    },
  
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
  
    meta: {
      fontSize: theme.fontSize.sm,
      color: theme.black,
      textTransform: 'capitalize',
    },
  
    exp: {
      marginTop: 6,
      fontSize: theme.fontSize.sm,
      color: '#444',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      
      badge: {
        backgroundColor: theme.lightGray,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
      },
      
      badgeText: {
        fontSize: theme.fontSize.sm,
        color: theme.black,
        fontWeight: '600',
      },
      
  });
  
  

export default Jobs;
