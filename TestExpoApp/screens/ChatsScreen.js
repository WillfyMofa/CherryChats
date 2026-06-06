import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import colors from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { getUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/chats`;
const USERS_API_URL = `${API_BASE_URL}/api/users`;

export default function ChatsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState({
    chats: [],
    users: [],
    messages: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const loadChats = async () => {
    try {
      const { userId } = await getUserData();
      if (userId) {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        setChats(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить чаты');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults({ chats: [], users: [], messages: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const { userId } = await getUserData();
      const query = searchQuery.toLowerCase();
      
      // 1. Поиск по чатам
      const filteredChats = chats.filter(chat => {
        const chatName = chat.chatType === 'group' 
          ? chat.chatName?.toLowerCase() || ''
          : chat.otherUser?.username?.toLowerCase() || '';
        const lastMessage = chat.lastMessage?.toLowerCase() || '';
        return chatName.includes(query) || lastMessage.includes(query);
      });

      // 2. Поиск по пользователям
      const usersResponse = await axios.get(USERS_API_URL);
      const filteredUsers = usersResponse.data.filter(user => 
        user.userId !== userId && 
        user.username.toLowerCase().includes(query)
      );

      // 3. Поиск по сообщениям (из всех чатов пользователя)
      let filteredMessages = [];
      for (const chat of chats) {
        try {
          const messagesResponse = await axios.get(`${API_URL}/${chat.chatId}/messages`);
          const matchedMessages = messagesResponse.data.filter(msg => 
            msg.content.toLowerCase().includes(query) && msg.senderId !== userId
          );
          filteredMessages.push(...matchedMessages.map(msg => ({
            ...msg,
            chatId: chat.chatId,
            chatName: chat.chatType === 'group' 
              ? chat.chatName 
              : chat.otherUser?.username,
            chatType: chat.chatType,
          })));
        } catch (error) {
          console.error('Ошибка поиска сообщений в чате:', error);
        }
      }
      
      setSearchResults({
        chats: filteredChats,
        users: filteredUsers,
        messages: filteredMessages,
      });
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, chats]);

  useFocusEffect(
    useCallback(() => {
      loadChats();
      return () => {};
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const getAvatarSource = (chat) => {
    if (chat.chatType === 'group') {
      return require('../assets/images/cherry-chan-duo.png');
    } else {
      return require('../assets/images/cherry-chan-hi.png');
    }
  };

  const getChatName = (chat) => {
    if (chat.chatType === 'group') {
      return chat.chatName || 'Group chat';
    } else {
      return chat.otherUser?.username || 'User';
    }
  };

  const getLastMessageTime = (chat) => {
    if (!chat.lastMessageTime) return '';
    const date = new Date(chat.lastMessageTime);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('ChatDetail', { 
        chatId: item.chatId, 
        chatName: getChatName(item), 
        chatType: item.chatType 
      })}
    >
      <Image 
        source={getAvatarSource(item)}
        style={styles.resultAvatar}
        resizeMode="contain"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{getChatName(item)}</Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      {item.lastMessageTime && (
        <Text style={styles.resultTime}>{getLastMessageTime(item)}</Text>
      )}
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => {
        // Создаём чат с этим пользователем или открываем существующий
        navigation.navigate('CreateChat', { preSelectedUser: item });
      }}
    >
      <Image 
        source={require('../assets/images/cherry-chan-hi.png')}
        style={styles.resultAvatar}
        resizeMode="contain"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.username}</Text>
        <Text style={styles.resultSubtitle}>User</Text>
      </View>
      <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('ChatDetail', { 
        chatId: item.chatId, 
        chatName: item.chatName, 
        chatType: item.chatType 
      })}
    >
      <Image 
        source={item.chatType === 'group' 
          ? require('../assets/images/cherry-chan-duo.png')
          : require('../assets/images/cherry-chan-hi.png')
        }
        style={styles.resultAvatar}
        resizeMode="contain"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.chatName}</Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          <Text style={styles.senderName}>{item.senderName}: </Text>
          {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const sections = [];

  if (searchResults.chats.length > 0) {
    sections.push({ title: 'Chats', data: searchResults.chats, renderItem: renderChatItem });
  }
  if (searchResults.users.length > 0) {
    sections.push({ title: 'Users', data: searchResults.users, renderItem: renderUserItem });
  }
  if (searchResults.messages.length > 0) {
    sections.push({ title: 'Messages', data: searchResults.messages, renderItem: renderMessageItem });
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cherry Chats</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats, users, messages..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <Ionicons name="earth" size={20} color={colors.primary} style={styles.globeIcon} />
        </View>
      </View>

      {isSearching ? (
        <View style={styles.loadingResults}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isSearchActive ? (
        sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.chatId || item.userId || item.messageId}-${index}`}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color={colors.border} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try searching for something else</Text>
          </View>
        )
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.chatId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        />
      )}

      {!isSearchActive && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateChat')}>
          <Ionicons name="add" size={32} color={colors.background} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingResults: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, marginTop: 32 },
  headerTitle: { fontSize: 28, color: colors.primary, fontFamily: 'ShantellSans-Regular' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, borderRadius: 30, borderWidth: 2, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 16, color: colors.text, fontFamily: 'ShantellSans-Regular', marginLeft: 10 },
  globeIcon: { marginLeft: 8 },
  chatsList: { paddingHorizontal: 20, paddingBottom: 80 },
  resultsList: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: { backgroundColor: colors.background, paddingVertical: 8, marginTop: 8 },
  sectionHeaderText: { fontSize: 16, fontWeight: '600', color: colors.primary, fontFamily: 'ShantellSans-Regular' },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 2, borderColor: colors.border },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '600', color: colors.text, fontFamily: 'ShantellSans-Regular' },
  resultSubtitle: { fontSize: 13, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular', marginTop: 2 },
  resultTime: { fontSize: 11, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular' },
  senderName: { fontWeight: '600', color: colors.primary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 20, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular', textAlign: 'center', marginTop: 8 },
  fab: { position: 'absolute', bottom: 20, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
};