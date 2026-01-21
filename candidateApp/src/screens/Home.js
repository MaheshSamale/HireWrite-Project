import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '..//../style/theme';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome 👋</Text>
      <Text style={styles.subtitle}>
        Here's what's happening with your job search
      </Text>

      <View style={styles.card}>
        <Text style={styles.count}>12</Text>
        <Text style={styles.label}>Applications</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.count}>3</Text>
        <Text style={styles.label}>Interviews</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.count}>1</Text>
        <Text style={styles.label}>Offers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.white,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.black,
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 20,
    color: 'gray',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    marginTop: 5,
    fontSize: 16,
    color: '#ccc',
  },
});

