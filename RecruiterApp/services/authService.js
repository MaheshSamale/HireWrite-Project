import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  const token=  await AsyncStorage.getItem('recruiter_token');
  return token;
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem('recruiter_token', token);
};

export const logoutToken = async () => {
  await AsyncStorage.removeItem('recruiter_token');
};