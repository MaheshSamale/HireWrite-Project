import React, { useEffect, useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    ScrollView, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { theme } from '../../style/theme';
import commonStyles from '../../style/style';
import Button from '../components/Button';
import { getRecruiterJobs } from '../../services/recruiterService'; // Reusing job fetch logic

function JobDetails({ route, navigation }) {
    const { jobId } = route.params; // Passed from ManageJobs.js
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await getRecruiterJobs();
            if (response.status === 'success') {
                // Find the specific job from the list
                const selectedJob = response.data.find(j => j.job_id === jobId);
                setJob(selectedJob);
            }
        } catch (error) {
            Alert.alert("Error", "Could not fetch job details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.center}>
                <Text>Job not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={commonStyles.card}>
                <Text style={styles.title}>{job.title}</Text>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={[styles.value, { color: job.status === 'open' ? 'green' : 'red' }]}>
                        {job.status.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>Role Information</Text>
                <Text style={styles.infoText}>📍 {job.location_type}</Text>
                <Text style={styles.infoText}>💼 {job.employment_type}</Text>
                <Text style={styles.infoText}>⏳ Experience: {job.experience_min} - {job.experience_max} years</Text>

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>Job Description</Text>
                <Text style={styles.description}>{job.jd_text}</Text>

                <View style={styles.actionContainer}>
                    <Button 
                        title="View All Applicants" 
                        onPress={() => navigation.navigate('Applications', { jobId: job.job_id })}
                        marginTop={20}
                    />
                    
                    <Button 
                        title="Edit Posting" 
                        onPress={() => Alert.alert("Feature", "Edit functionality coming soon")}
                        marginTop={10}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontWeight: '700',
        fontSize: 16,
        marginRight: 8,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: theme.lightGray,
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.black,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.black,
    },
    actionContainer: {
        marginTop: 20,
        marginBottom: 30,
    }
});

export default JobDetails;