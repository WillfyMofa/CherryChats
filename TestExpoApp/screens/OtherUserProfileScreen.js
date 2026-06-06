import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../styles/colors';
import { API_BASE_URL } from '../utils/config';
import { getUserData } from '../utils/storage';

const API_URL = `${API_BASE_URL}/api/users`;
const CHATS_API_URL = `${API_BASE_URL}/api/chats`;

export default function OtherUserProfileScreen({ navigation, route }) {
  const { userId, username } = route.params;
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadUserData();
  }, []);

  const loadCurrentUser = async () => {
    const { userId } = await getUserData();
    setCurrentUserId(userId);
  };

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      // Проверяем, существует ли уже чат
      const response = await axios.post(`${CHATS_API_URL}/direct`, {
        userId1: currentUserId,
        userId2: userId
      });
      
      if (response.data.chatId) {
        navigation.navigate('ChatDetail', {
          chatId: response.data.chatId,
          chatName: userData?.username || username,
          chatType: 'direct'
        });
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать чат');
    }
  };

  const handleInvite = () => {
    Alert.alert('Пригласить в чат', 'Функция будет добавлена позже');
  };

  const handleShareContact = () => {
    Alert.alert('Поделиться контактом', 'Функция будет добавлена позже');
  };

  const handleBlock = () => {
    Alert.alert(
      'Заблокировать пользователя',
      `Вы уверены, что хотите заблокировать ${userData?.username || username}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Заблокировать', style: 'destructive', onPress: () => {
          Alert.alert('Пользователь заблокирован');
        }}
      ]
    );
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Информация о пользователе */}
        <View style={styles.userInfoRow}>
          <Image 
            source={require('../assets/images/cherry-chan-hi.png')}
            style={styles.avatar}
            resizeMode="contain"
          />
          <View style={styles.userTextInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{userData?.username || username}</Text>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={userData?.isConfirmed ? colors.success : colors.textSecondary} 
              />
            </View>
            <Text style={styles.lastSeen}>
              last seen {formatLastSeen(userData?.lastSeen)}
            </Text>
          </View>
        </View>

        {/* Полоска с иконками */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleSendMessage}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleInvite}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Invite</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShareContact}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleBlock}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="ban-outline" size={24} color={colors.error} />
            </View>
            <Text style={[styles.actionText, styles.blockText]}>Block</Text>
          </TouchableOpacity>
        </View>

        {/* Дополнительная информация (опционально) */}
        {(userData?.phoneNumber && userData.phoneVisible) && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Phone number</Text>
            <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
          </View>
        )}

        {(userData?.email && userData.emailVisible) && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    marginRight: 16,
  },
  userTextInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  lastSeen: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  blockText: {
    color: colors.error,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
};