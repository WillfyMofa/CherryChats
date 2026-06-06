import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../styles/colors';
import { getUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/chats`;

export default function ChatInfoScreen({ navigation, route }) {
  const { chatId, chatName, chatType } = route.params;
  const [chatInfo, setChatInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadChatInfo();
  }, []);

  const loadCurrentUser = async () => {
    const { userId } = await getUserData();
    setCurrentUserId(userId);
  };

  const loadChatInfo = async () => {
    try {
      const { userId } = await getUserData();
      const response = await axios.get(`${API_URL}/user/${userId}`);
      const chat = response.data.find(c => c.chatId === chatId);
      
      setChatInfo(chat);
      
      if (chat && chat.participants) {
        
        const currentParticipant = chat.participants.find(p => p.userId === userId);
        
        setIsAdmin(currentParticipant?.role === 'admin');
        
        const sorted = [...chat.participants].sort((a, b) => {
          if (a.userId === userId) return -1;
          if (b.userId === userId) return 1;
          if (a.role === 'admin') return -1;
          if (b.role === 'admin') return 1;
          return 0;
        });
        setParticipants(sorted);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о чате');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarSource = () => {
    if (chatType === 'group') {
      return require('../assets/images/cherry-chan-duo.png');
    } else {
      return require('../assets/images/cherry-chan-hi.png');
    }
  };

  const handleViewProfile = (userId, username) => {
    navigation.navigate('OtherUserProfile', { userId, username });
  };

  const handleAddParticipant = () => {
    Alert.alert('Add participant', 'Функция будет добавлена позже');
  };

  const handleMuteNotifications = () => {
    Alert.alert('Mute notifications', 'Функция будет добавлена позже');
  };

  const handleArchiveChat = () => {
    Alert.alert('Archive chat', 'Функция будет добавлена позже');
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete chat',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Chat deleted', 'You will be redirected to chats list');
          navigation.navigate('Chats');
        }}
      ]
    );
  };

  const handleLeaveChat = () => {
    Alert.alert(
      'Leave chat',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => {
          Alert.alert('You left the chat', 'You will be redirected to chats list');
          navigation.navigate('Chats');
        }}
      ]
    );
  };

  const renderParticipant = ({ item, index }) => {
    const isLast = index === participants.length - 1;
    return (
      <TouchableOpacity 
        style={[styles.participantItem, !isLast && styles.participantItemBorder]}
        onPress={() => handleViewProfile(item.userId, item.username)}
      >
        <Image 
          source={require('../assets/images/cherry-chan-hi.png')}
          style={styles.participantAvatar}
          resizeMode="contain"
        />
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.username}</Text>
          <Text style={styles.participantRole}>
            {item.userId === currentUserId ? 'You' : item.role === 'admin' ? 'Admin' : 'Member'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Chat Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Информация о чате */}
        <View style={styles.chatInfoCard}>
          <Image 
            source={getAvatarSource()}
            style={styles.chatAvatar}
            resizeMode="contain"
          />
          <Text style={styles.chatName}>{chatName}</Text>
          {chatType === 'group' && chatInfo?.description && (
            <Text style={styles.chatDescription}>{chatInfo.description}</Text>
          )}
          <Text style={styles.chatType}>
            {chatType === 'group' ? 'Group chat' : 'Private chat'}
          </Text>
        </View>

        {/* Участники */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <Text style={styles.sectionCount}>{participants.length}</Text>
          </View>
          
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.userId.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Кнопка выхода из чата (для групп) */}
        {chatType === 'group' && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveChat}>
            <Ionicons name="exit-outline" size={24} color={colors.primary} />
            <Text style={styles.leaveButtonText}>Leave chat</Text>
          </TouchableOpacity>
        )}

        {/* Кнопки действий (только для админа) */}
        {chatType === 'group' && isAdmin && (
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddParticipant}>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Add member</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleMuteNotifications}>
              <Ionicons name="notifications-off-outline" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Mute notification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButtonDanger} onPress={handleArchiveChat}>
              <Ionicons name="archive-outline" size={24} color={colors.primary} />
              <Text style={styles.actionTextDanger}>Archive chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButtonDanger} onPress={handleDeleteChat}>
              <Ionicons name="trash-outline" size={24} color={colors.primary} />
              <Text style={styles.actionTextDanger}>Delete chat</Text>
            </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  chatInfoCard: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  chatName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
    marginBottom: 8,
  },
  chatDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  chatType: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  participantItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  participantRole: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  actionTextDanger: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
};