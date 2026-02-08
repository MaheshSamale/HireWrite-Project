import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  return await AsyncStorage.getItem('org_token');
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem('org_token', token);
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'org_token',
      'organization_id',
      'user_role'
    ]);
  } catch (error) {
    console.error("Logout error in authService:", error);
  }
};