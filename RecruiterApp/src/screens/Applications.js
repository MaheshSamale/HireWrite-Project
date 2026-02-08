import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getJobApplications } from '../../services/recruiterService';
import StatusBadge from '../components/StatusBadge';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Applications({ route, navigation }) {
    const { jobId } = route.params;
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Refresh data whenever the recruiter navigates back to this list
    useFocusEffect(
        useCallback(() => {
            fetchApplications();
        }, [jobId])
    );

    const fetchApplications = async () => {
        try {
            const res = await getJobApplications(jobId);
            if (res.status === 'success') {
                setApps(res.data);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    // Helper to choose color based on score
    const getScoreColor = (score) => {
        if (!score) return '#9E9E9E'; // Gray for 0/null
        if (score >= 80) return '#2E7D32'; // Green
        if (score >= 50) return '#F57C00'; // Orange
        return '#D32F2F'; // Red
    };

    const renderApplicationItem = ({ item }) => {
        // Handle name property based on API response (candidate_name vs name)
        const displayName = item.candidate_name || item.name || 'Unknown';
        const displayInitial = displayName.charAt(0).toUpperCase();
        
        // Use keyword_score for the main list view
        const matchScore = item.keyword_score || 0;
        const scoreColor = getScoreColor(matchScore);

        return (
            <TouchableOpacity 
                style={[commonStyles.card, styles.itemCard]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ApplicationDetails', { app: item })}
            >
                {/* Left Side: Avatar & Info */}
                <View style={styles.leftSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{displayInitial}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                        
                        <View style={styles.badgeRow}>
                            <StatusBadge stage={item.stage} />
                        </View>
                    </View>
                </View>
                
                {/* Right Side: Score & Chevron */}
                <View style={styles.rightSection}>
                    <View style={[styles.scoreContainer, { borderColor: scoreColor }]}>
                        <Text style={[styles.scoreText, { color: scoreColor }]}>
                            {matchScore}%
                        </Text>
                        <Text style={[styles.scoreLabel, { color: scoreColor }]}>Match</Text>
                    </View>

                    {item.fit_flag === 1 && (
                        <View style={styles.topMatchTag}>
                            <Ionicons name="sparkles" size={10} color="white" />
                            <Text style={styles.topMatchText}>TOP</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color={theme.black} />
                </TouchableOpacity>
                <Text style={styles.header}>Applicants</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{apps.length}</Text>
                </View>
            </View>

            <FlatList
                data={apps}
                keyExtractor={(item) => item.application_id.toString()}
                renderItem={renderApplicationItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="people-outline" size={50} color="#999" />
                        </View>
                        <Text style={styles.emptyText}>No applications yet.</Text>
                        <Text style={styles.emptySubText}>Wait for candidates to apply.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 50, // For status bar
        backgroundColor: '#F8F9FA'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
        padding: 4
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.black
    },
    countBadge: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 10
    },
    countText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E1F5FE'
    },
    avatarText: {
        color: theme.primary,
        fontWeight: 'bold',
        fontSize: 20
    },
    info: {
        flex: 1,
        justifyContent: 'center'
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.black,
        marginBottom: 2
    },
    email: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 6
    },
    badgeRow: {
        alignSelf: 'flex-start'
    },
    rightSection: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#FAFAFA'
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    topMatchTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 6
    },
    topMatchText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
        marginLeft: 2
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    emptyText: {
        color: theme.black,
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5
    },
    emptySubText: {
        color: 'gray',
        fontSize: 14
    }
});