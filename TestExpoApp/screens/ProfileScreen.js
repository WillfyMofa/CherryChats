import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../styles/colors';
import { getUserData, clearUserData } from '../utils/storage';
import ProfileMenu from '../components/ProfileMenu';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/users`;

// Список доступных аватаров
const avatars = [
  { id: 'cherry-chan-hi', name: 'Hi! 👋', source: require('../assets/images/cherry-chan-hi.png') },
  { id: 'cherry-chan-ah', name: 'Ah! 😯', source: require('../assets/images/cherry-chan-ah.png') },
  { id: 'cherry-chan-sleep', name: 'Sleep 😴', source: require('../assets/images/cherry-chan-sleep.png') },
  { id: 'cherry-chan-love', name: 'Love 🍒', source: require('../assets/images/cherry-chan-love.png') },
  { id: 'cherry-chan-maffin', name: 'Maffin 🧁', source: require('../assets/images/cherry-chan-maffin.png') },
];

export default function ProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    lastLogin: '',
    phoneNumber: '',
    email: '', 
    deviceName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('cherry-chan-hi');

  // Данные для редактирования
  const [editablePhone, setEditablePhone] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [editableDevice, setEditableDevice] = useState('');
  
  // Видимость для других пользователей (true - видно, false - скрыто)
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [deviceVisible, setDeviceVisible] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const { userId: storedUserId, username: storedUsername } = await getUserData();
      if (storedUserId) {
        setUserId(storedUserId);
        setUserData(prev => ({ ...prev, username: storedUsername || '' }));
        await loadUserData(storedUserId);
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Ошибка загрузки из storage:', error);
      navigation.navigate('Login');
    }
  };

  const loadUserData = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/${id}`);
      const user = response.data;
      
      setUserData(prev => ({
        ...prev,
        username: user.username || prev.username,
        lastLogin: user.lastSeen ? formatDate(user.lastSeen) : 'Never',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        deviceName: user.deviceName || '',
      }));
      
      setEditablePhone(user.phoneNumber || '');
      setEditableEmail(user.email || '');
      setEditableDevice(user.deviceName || '');
      
      // Загружаем настройки видимости
      setPhoneVisible(user.phoneVisible !== undefined ? user.phoneVisible : true);
      setEmailVisible(user.emailVisible !== undefined ? user.emailVisible : true);
      setDeviceVisible(user.deviceVisible !== undefined ? user.deviceVisible : true);
      
      // Загружаем аватар
      if (user.avatar) {
        setCurrentAvatar(user.avatar);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSignOut = () => {
    setSignOutModalVisible(true);
  };

  const confirmSignOut = async () => {
    setSignOutModalVisible(false);
    await clearUserData();
    navigation.navigate('Login');
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/${userId}`);
      await clearUserData();
      Alert.alert('Успех', 'Аккаунт удалён');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
    }
  };

  const handleSavePhone = async () => {
    if (editablePhone && !validatePhone(editablePhone)) {
      Alert.alert('Ошибка', 'Неверный формат номера телефона');
      return;
    }
    try {
      await axios.put(`${API_URL}/${userId}/phone`, { 
        phoneNumber: editablePhone,
        phoneVisible: phoneVisible 
      });
      Alert.alert('Успех', 'Номер телефона сохранён');
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось сохранить номер');
    }
  };

  const handleSaveEmail = async () => {
    if (editableEmail && !validateEmail(editableEmail)) {
      Alert.alert('Ошибка', 'Неверный формат email');
      return;
    }
    try {
      await axios.put(`${API_URL}/${userId}/email`, { 
        email: editableEmail,
        emailVisible: emailVisible 
      });
      Alert.alert('Успех', 'Email сохранён');
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось сохранить email');
    }
  };

  const handleSaveDevice = async () => {
    try {
      await axios.put(`${API_URL}/${userId}/device`, { 
        deviceName: editableDevice,
        deviceVisible: deviceVisible 
      });
      Alert.alert('Успех', 'Название устройства сохранено');
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось сохранить устройство');
    }
  };

  const handleChangeAvatar = async (selectedAvatar) => {
    setCurrentAvatar(selectedAvatar.id);
    setAvatarModalVisible(false);
    
    try {
      await axios.put(`${API_URL}/${userId}/avatar`, { 
        avatar: selectedAvatar.id 
      });
    } catch (error) {
      console.error('Ошибка сохранения аватара:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить аватар');
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+\-\s\d\(\)]{10,20}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const currentAvatarObj = avatars.find(a => a.id === currentAvatar) || avatars[0];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="person-outline" size={28} color={colors.background} />
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={28} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Баннер */}
        <View style={styles.banner} />

        {/* Аватар и информация */}
        <View style={styles.profileInfoWrapper}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
              <Image 
                source={currentAvatarObj.source}
                style={styles.avatar}
                resizeMode="contain"
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera-outline" size={16} color={colors.background} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfoContainer}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{userData.username}</Text>
              <Ionicons name="checkmark-circle" size={24} color={colors.background} />
            </View>
            <Text style={styles.lastLoginLabel}>last log in:</Text>
            <Text style={styles.lastLoginTime}>{userData.lastLogin}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Поле телефона */}
          <View style={styles.infoContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                value={editablePhone}
                onChangeText={setEditablePhone}
                onBlur={handleSavePhone}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
              />
              {editablePhone.length > 0 && (
                <TouchableOpacity style={styles.inputIcon} onPress={() => setPhoneVisible(!phoneVisible)}>
                  <Ionicons 
                    name={phoneVisible ? "lock-closed" : "lock-open"} 
                    size={22} 
                    color={phoneVisible ? colors.primary : colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Поле email */}
          <View style={styles.infoContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                value={editableEmail}
                onChangeText={setEditableEmail}
                onBlur={handleSaveEmail}
                placeholder="Enter email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
              />
              {editableEmail.length > 0 && (
                <TouchableOpacity style={styles.inputIcon} onPress={() => setEmailVisible(!emailVisible)}>
                  <Ionicons 
                    name={emailVisible ? "lock-closed" : "lock-open"} 
                    size={22} 
                    color={emailVisible ? colors.primary : colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Поле устройства */}
          <View style={styles.infoContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                value={editableDevice}
                onChangeText={setEditableDevice}
                onBlur={handleSaveDevice}
                placeholder="Scanning"
                placeholderTextColor={colors.textSecondary}
              />
              {editableDevice.length > 0 && (
                <TouchableOpacity style={styles.inputIcon} onPress={() => setDeviceVisible(!deviceVisible)}>
                  <Ionicons 
                    name={deviceVisible ? "lock-closed" : "lock-open"} 
                    size={22} 
                    color={deviceVisible ? colors.primary : colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Кнопка выхода */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>sing out</Text>
            <Ionicons name="exit-outline" size={20} color={colors.background} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Модальное окно выхода */}
      <Modal
        visible={signOutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalImagePlaceholder}>
              <Image 
                source={require('../assets/images/pain.png')}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.modalTitle}>Do you really want to sing out?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonNo]} 
                onPress={() => setSignOutModalVisible(false)}
              >
                <Text style={styles.modalButtonTextNo}>no</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonYes]} 
                onPress={confirmSignOut}
              >
                <Text style={styles.modalButtonTextYes}>yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно выбора аватара */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.avatarModalOverlay}>
          <TouchableOpacity style={styles.avatarModalBackdrop} onPress={() => setAvatarModalVisible(false)} activeOpacity={1} />
          
          <View style={styles.avatarModalContainer}>
            <View style={styles.avatarModalHeader}>
              <Text style={styles.avatarModalTitle}>Choose your avatar</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.avatarsGrid}>
              {avatars.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.avatarOption,
                    currentAvatar === item.id && styles.avatarOptionSelected
                  ]}
                  onPress={() => handleChangeAvatar(item)}
                >
                  <Image 
                    source={item.source}
                    style={styles.avatarOptionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.avatarOptionName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Меню профиля */}
      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onDeleteAccount={handleDeleteAccount}
      />
    </View>
  );
}

const styles = {
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative'
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    color: colors.background,
    fontFamily: 'ShantellSans-Regular',
  },
  banner: {
    height: 180,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: -60,
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userInfoContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  username: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.background,
    fontFamily: 'ShantellSans-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lastLoginLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'ShantellSans-Regular',
    marginTop: 4,
  },
  lastLoginTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'ShantellSans-Regular',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  infoContainer: {
    marginBottom: 24,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: 'ShantellSans-Regular',
  },
  label: {
    fontSize: 14,
    fontFamily: 'ShantellSans-Regular',
    marginTop: 6,
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginRight: 20,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  signOutText: {
    fontSize: 18,
    color: colors.background,
    fontFamily: 'ShantellSans-Regular',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '70%',
    backgroundColor: colors.background,
    borderRadius: 30,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'visible',
  },
  modalImagePlaceholder: {
    position: 'absolute',
    top: -100,
    left: -60,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: 160,
    height: 160,
    borderRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalButtonNo: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalButtonYes: {
    backgroundColor: colors.primary,
  },
  modalButtonTextNo: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  modalButtonTextYes: {
    fontSize: 18,
    color: colors.background,
    fontFamily: 'ShantellSans-Regular',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputWithIcon: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: 'ShantellSans-Regular',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 10,
  },
  avatarModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  avatarModalContainer: {
    width: '85%',
    backgroundColor: colors.background,
    borderRadius: 30,
    padding: 20,
    paddingTop: 16,
    maxHeight: '80%',
    zIndex: 10,
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarModalTitle: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarOption: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  avatarOptionImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  avatarOptionName: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
  },
  avatarOption: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  avatarOptionImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  avatarOptionName: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
  },
  avatarModalCloseButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  avatarModalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    textDecorationLine: 'underline',
  },
};