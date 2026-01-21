import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  return await AsyncStorage.getItem('candidate_token');
};

export const logout = async () => {
  await AsyncStorage.removeItem('candidate_token');
};
