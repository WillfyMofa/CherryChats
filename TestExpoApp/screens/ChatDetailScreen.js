import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import colors from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { getUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/chats`;

export default function ChatDetailScreen({ navigation, route }) {
  const { chatId, chatName, chatType } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    if (chatType === 'direct') {
      loadOtherUser();
    }
    
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  const loadCurrentUser = async () => {
    const { userId } = await getUserData();
    setCurrentUserId(userId);
  };

  const loadOtherUser = async () => {
    if (chatType !== 'direct') return;
    
    try {
      const { userId } = await getUserData();
      const response = await axios.get(`${API_URL}/user/${userId}`);
      const chat = response.data.find(c => c.chatId === chatId);
      if (chat && chat.otherUser) {
        setOtherUserId(chat.otherUser.userId);
      }
    } catch (error) {
      console.error('Ошибка загрузки собеседника:', error);
    }
  };

  const getAvatarSource = () => {
    if (chatType === 'group') {
      return require('../assets/images/cherry-chan-duo.png');
    } else {
      return require('../assets/images/cherry-chan-hi.png');
    }
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/${chatId}/messages`);
      setMessages(response.data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      // Не показываем Alert для групповых чатов, просто логируем
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const { userId } = await getUserData();
      await axios.post(`${API_URL}/message`, {
        chatId: chatId,
        senderId: userId,
        content: inputText.trim()
      });
      
      setInputText('');
      loadMessages();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.senderId === currentUserId;
    const showDate = index === 0 || formatDate(item.sentAt) !== formatDate(messages[index - 1]?.sentAt);
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.sentAt)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage
        ]}>
          {!isMyMessage && (
            <TouchableOpacity onPress={() => navigation.navigate('OtherUserProfile', { 
              userId: item.senderId, 
              username: item.senderName 
            })}>
              <Text style={styles.senderName}>{item.senderName}</Text>
            </TouchableOpacity>
          )}
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.otherBubble
          ]}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={styles.messageTime}>{formatTime(item.sentAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleHeaderPress = () => {
    if (chatType === 'group') {
      navigation.navigate('ChatInfo', { chatId, chatName, chatType });
    } else {
      // Для личных чатов проверяем, что otherUserId есть
      if (otherUserId) {
        navigation.navigate('OtherUserProfile', { 
          userId: otherUserId, 
          username: chatName 
        });
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить профиль пользователя');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />
      
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo} onPress={handleHeaderPress}>
          <Image 
            source={getAvatarSource()}
            style={styles.headerAvatar}
            resizeMode="contain"
          />
          <View style={styles.headerTextInfo}>
            <Text style={styles.headerTitle}>{chatName}</Text>
            <Text style={styles.headerSubtitle}>
              {chatType === 'group' ? 'Group chat' : 'last seen recently'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {chatType === 'group' && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('ChatInfo', { chatId, chatName, chatType })}
          >
            <Ionicons name="menu-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Сообщения */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Поле ввода */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color={inputText.trim() ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  headerTextInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  menuButton: {
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'ShantellSans-Regular',
  },
  myMessageText: {
    color: colors.background,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
    maxHeight: 100,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
};