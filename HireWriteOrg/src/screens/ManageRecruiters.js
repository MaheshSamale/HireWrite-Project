import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { getOrgRecruiters, deleteRecruiter } from '../../services/organizationServices';
import commonStyles from '../../style/style';
import { theme } from '../../style/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ManageRecruiters({ navigation }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecruiters = async () => {
    // Only show full loader on initial mount, not on every focus
    if (recruiters.length === 0) setLoading(true);
    
    try {
      const res = await getOrgRecruiters();
      if (res.status === 'success') {
        setRecruiters(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadRecruiters();
    }, [])
  );

  const handleDelete = (id, name) => {
    Alert.alert(
      "Remove Team Member",
      `Are you sure you want to remove ${name}? They will lose access immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          onPress: async () => {
            const res = await deleteRecruiter(id);
            if (res.status === 'success') {
              loadRecruiters(); // Refresh list
            } else {
              Alert.alert("Error", res.error);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const handleCall = (mobile) => {
    Linking.openURL(`tel:${mobile}`);
  };

  const renderRecruiter = ({ item }) => (
    <View style={[styles.card, commonStyles.shadow]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.pos}>{item.position}</Text>
        </View>
        
        {/* Action Buttons Row */}
        <View style={styles.actions}>
            {item.mobile && (
                <TouchableOpacity onPress={() => handleCall(item.mobile)} style={styles.actionBtn}>
                    <Ionicons name="call-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.recruiter_id, item.name)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <Ionicons name="mail-outline" size={16} color="gray" />
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
        <Text style={styles.headerSubtitle}>Manage your organization's recruiters</Text>
      </View>

      <FlatList
        data={recruiters}
        keyExtractor={(item) => item.recruiter_id ? item.recruiter_id.toString() : Math.random().toString()}
        renderItem={renderRecruiter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={50} color="#ccc" />
            </View>
            <Text style={styles.emptyText}>No recruiters found.</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first team member.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddRecruiter')}
      >
        <Ionicons name="person-add" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' // Light gray background
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
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
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
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: theme.primary + '20', // 20% opacity version of primary color
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primary + '40',
  },
  avatarText: { 
    color: theme.primary, 
    fontWeight: 'bold', 
    fontSize: 20 
  },
  info: { 
    flex: 1, 
    marginLeft: 15 
  },
  name: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: theme.black 
  },
  pos: { 
    fontSize: 13, 
    color: theme.primary, 
    fontWeight: '600',
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE', // Light red background
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: { 
    fontSize: 13, 
    color: 'gray',
    marginLeft: 8 
  },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: theme.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80 
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
    color: theme.black,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubText: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    width: '70%',
  }
});