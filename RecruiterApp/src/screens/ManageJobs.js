import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl,
    Alert,
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRecruiterJobs, updateJobStatus } from '../../services/recruiterService';
import { theme } from '../../style/theme';

export default function ManageJobs({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [])
    );

    const fetchJobs = async () => {
        try {
            const response = await getRecruiterJobs();
            if (response.status === 'success') {
                const sortedJobs = response.data.sort((a, b) => {
                    if (a.status === b.status) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return a.status === 'open' ? -1 : 1;
                });
                setJobs(sortedJobs);
            }
        } catch (error) {
            console.error("Fetch Jobs Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
        
        Alert.alert(
            nextStatus === 'open' ? "Re-open Job?" : "Close Job?",
            `Are you sure you want to ${nextStatus === 'open' ? 'make this job active' : 'stop accepting applications'}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: async () => {
                        try {
                            const res = await updateJobStatus(jobId, nextStatus);
                            if (res.status === 'success') {
                                fetchJobs(); 
                            }
                        } catch (error) {
                            Alert.alert("Error", "Could not update job status.");
                        }
                    } 
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderJobItem = ({ item }) => {
        const isClosed = item.status === 'closed';
        
        return (
            <View style={[styles.card, isClosed && styles.cardClosed]}>
                {/* Top Row: Date & Status */}
                <View style={styles.cardTopRow}>
                    <Text style={styles.dateText}>Posted {formatDate(item.created_at)}</Text>
                    <TouchableOpacity 
                        style={[styles.statusChip, isClosed ? styles.statusChipClosed : styles.statusChipOpen]}
                        onPress={() => handleToggleStatus(item.job_id, item.status)}
                    >
                        <View style={[styles.statusDot, { backgroundColor: isClosed ? '#757575' : '#4CAF50' }]} />
                        <Text style={[styles.statusText, { color: isClosed ? '#757575' : '#2E7D32' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Job Title */}
                <Text style={[styles.jobTitle, isClosed && styles.textClosed]} numberOfLines={1}>
                    {item.title}
                </Text>

                {/* Metadata Tags - Compact Row */}
                <View style={styles.tagsContainer}>
                    <View style={styles.tag}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.tagText}>{item.location_type}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="briefcase-outline" size={12} color="#666" />
                        <Text style={styles.tagText}>{item.employment_type}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Footer: Stats & Action */}
                <View style={styles.cardFooter}>
                    <View style={styles.statsContainer}>
                        <Text style={[styles.statsValue, isClosed && styles.textClosed]}>
                            {item.total_applications || 0}
                        </Text>
                        <Text style={styles.statsLabel}>Applicants</Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.actionButton, isClosed && styles.actionButtonClosed]}
                        onPress={() => navigation.navigate('Applications', { jobId: item.job_id })}
                    >
                        <Text style={[styles.actionButtonText, isClosed && styles.actionButtonTextClosed]}>
                            Manage
                        </Text>
                        <Ionicons 
                            name="chevron-forward" 
                            size={14} 
                            color={isClosed ? '#666' : 'white'} 
                            style={{marginLeft: 2}}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>My Jobs</Text>
                    <Text style={styles.headerSubtitle}>{jobs.length} Listings</Text>
                </View>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('CreateJob')}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Post</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.job_id.toString()}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchJobs} colors={[theme.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="briefcase-outline" size={32} color="#999" />
                            </View>
                            <Text style={styles.emptyTitle}>No Jobs Yet</Text>
                            <Text style={styles.emptySubtitle}>Post a job to get started.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F8',
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Header Styles
    headerContainer: {
        backgroundColor: 'white',
        paddingTop: 60,
        paddingBottom: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    addButton: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 2,
    },

    // List Styles
    listContent: {
        padding: 12, // Reduced outer padding
        paddingBottom: 40,
    },

    // Card Styles (Compact)
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12, // Reduced inner padding
        marginBottom: 10, // Reduced margin between cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardClosed: {
        backgroundColor: '#F9F9F9',
        borderColor: '#EFEFEF',
    },
    
    // Card Top Row
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    dateText: {
        fontSize: 10,
        color: '#999',
        fontWeight: '500',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusChipOpen: {
        backgroundColor: '#E8F5E9',
        borderColor: '#C8E6C9',
    },
    statusChipClosed: {
        backgroundColor: '#EEEEEE',
        borderColor: '#E0E0E0',
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: 4,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    // Card Content
    jobTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    textClosed: {
        color: '#888',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 3,
        textTransform: 'capitalize',
    },

    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 8,
    },

    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    statsValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.primary,
        marginRight: 4,
    },
    statsLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },

    // Action Button
    actionButton: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionButtonClosed: {
        backgroundColor: '#E0E0E0',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    actionButtonTextClosed: {
        color: '#666',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        padding: 20,
    },
    emptyIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
});