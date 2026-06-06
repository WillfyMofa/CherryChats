import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения
const USER_ID_KEY = 'userId';
const USERNAME_KEY = 'username';
const LOGIN_METHOD_KEY = 'loginMethod';
const LOGIN_IDENTIFIER_KEY = 'loginIdentifier';

export const saveUserData = async (userId, username, method = 'nickname', identifier = '') => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, String(userId));
    await AsyncStorage.setItem(USERNAME_KEY, username);
    await AsyncStorage.setItem(LOGIN_METHOD_KEY, method);
    await AsyncStorage.setItem(LOGIN_IDENTIFIER_KEY, identifier);
    console.log('User data saved:', { userId, username, method });
  } catch (error) {
    console.error('Ошибка сохранения данных пользователя:', error);
  }
};

export const getUserData = async () => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    const loginMethod = await AsyncStorage.getItem(LOGIN_METHOD_KEY);
    const loginIdentifier = await AsyncStorage.getItem(LOGIN_IDENTIFIER_KEY);
    
    return { 
      userId: userId ? parseInt(userId) : null, 
      username,
      loginMethod,
      loginIdentifier
    };
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    return { userId: null, username: null, loginMethod: null, loginIdentifier: null };
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(USERNAME_KEY);
    await AsyncStorage.removeItem(LOGIN_METHOD_KEY);
    await AsyncStorage.removeItem(LOGIN_IDENTIFIER_KEY);
    console.log('User data cleared');
  } catch (error) {
    console.error('Ошибка очистки данных пользователя:', error);
  }
};

export const isUserLoggedIn = async () => {
  const userId = await AsyncStorage.getItem(USER_ID_KEY);
  return userId !== null;
};