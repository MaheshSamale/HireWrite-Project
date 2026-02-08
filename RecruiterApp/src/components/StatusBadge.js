import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../style/theme';

function StatusBadge({ stage }) {
  // Define colors based on the stage from your backend logic
  const getBadgeStyle = (currentStage) => {
    switch (currentStage?.toLowerCase()) {
      case 'applied':
        return { bg: '#E3F2FD', text: '#1976D2' }; // Blue
      case 'shortlisted':
        return { bg: '#F3E5F5', text: '#7B1FA2' }; // Purple
      case 'interview':
        return { bg: '#FFF3E0', text: '#F57C00' }; // Orange
      case 'hired':
        return { bg: '#E8F5E9', text: '#2E7D32' }; // Green
      case 'rejected':
        return { bg: '#FFEBEE', text: '#D32F2F' }; // Red
      default:
        return { bg: '#F5F5F5', text: '#616161' }; // Grey
    }
  };

  const { bg, text } = getBadgeStyle(stage);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>
        {stage ? stage.toUpperCase() : 'UNKNOWN'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default StatusBadge;