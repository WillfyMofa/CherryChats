import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function ArchiveScreen() {
  const [activeTab, setActiveTab] = useState('archived'); // 'archived', 'saved', 'recent'

  // Данные для архивированных чатов
  const [archivedChats, setArchivedChats] = useState([
    { id: '1', type: 'user', name: 'Анна', lastMessage: 'Спасибо за помощь!' },
    { id: '2', type: 'group', name: 'Рабочая группа', lastMessage: 'Документы отправлены' },
    { id: '3', type: 'user', name: 'Максим', lastMessage: 'До встречи!' },
  ]);

  // Данные для сохранённых сообщений
  const [savedMessages, setSavedMessages] = useState([
    { id: '1', type: 'user', name: 'Анна', message: 'Классный проект! 🔥'},
    { id: '2', type: 'group', name: 'Чат дизайнеров', message: 'Палитра: #6E44FF' },
    { id: '3', type: 'user', name: 'Я', message: 'Важная заметка'},
  ]);

  // Данные для недавних участников
  const [recentUsers, setRecentUsers] = useState([
    { id: '1', name: 'Анна', lastSeen: 'была только что', avatar: '🍒' },
    { id: '2', name: 'Максим', lastSeen: 'был 5 мин назад', avatar: '🍒' },
    { id: '3', name: 'Елена', lastSeen: 'была час назад', avatar: '🍒' },
    { id: '4', name: 'Дмитрий', lastSeen: 'был вчера', avatar: '🍒' },
  ]);

  const handleUnarchive = (chat) => {
    Alert.alert(
      'Восстановить чат',
      `Восстановить чат с ${chat.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Восстановить',
          onPress: () => {
            setArchivedChats(prev => prev.filter(c => c.id !== chat.id));
            Alert.alert('Успех', 'Чат восстановлен');
          }
        },
      ]
    );
  };

  const handleClearArchive = () => {
    Alert.alert(
      'Очистить архив',
      'Все чаты будут удалены безвозвратно',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            setArchivedChats([]);
            Alert.alert('Архив очищен');
          }
        },
      ]
    );
  };

  const handleDeleteSaved = (item) => {
    Alert.alert(
      'Удалить',
      `Удалить сохранённое сообщение?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setSavedMessages(prev => prev.filter(i => i.id !== item.id));
            Alert.alert('Удалено');
          }
        },
      ]
    );
  };

  const renderArchivedItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleUnarchive(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.type === 'group' ? '🌸' : '🍒'}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Ionicons name="refresh-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderSavedItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleDeleteSaved(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.type === 'group' ? '🌸' : '🍒'}</Text>
      </View>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        <Text style={styles.itemMessage} numberOfLines={1}>{item.message}</Text>
      </View>
      <Ionicons name="trash-outline" size={24} color={colors.error} />
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMessage}>{item.lastSeen}</Text>
      </View>
      <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'archived':
        if (archivedChats.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={80} color={colors.border} />
              <Text style={styles.emptyText}>Архив пуст</Text>
              <Text style={styles.emptySubtext}>Здесь будут заархивированные чаты</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={archivedChats}
            renderItem={renderArchivedItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
        
      case 'saved':
        if (savedMessages.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={80} color={colors.border} />
              <Text style={styles.emptyText}>Нет сохранённых</Text>
              <Text style={styles.emptySubtext}>Сохранённые сообщения появятся здесь</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={savedMessages}
            renderItem={renderSavedItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
        
      case 'recent':
        if (recentUsers.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color={colors.border} />
              <Text style={styles.emptyText}>Нет недавних</Text>
              <Text style={styles.emptySubtext}>Здесь будут пользователи из общих чатов</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={recentUsers}
            renderItem={renderRecentItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="archive-outline" size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Archive</Text>
        </View>
          <TouchableOpacity onPress={handleClearArchive}>
            <Ionicons name="menu-outline" size={24} color={colors.error} />
          </TouchableOpacity>
      </View>

      {/* Верхнее меню-табы */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'archived' && styles.activeTab]}
          onPress={() => setActiveTab('archived')}
        >
          <Ionicons 
            name="archive-outline" 
            size={20} 
            color={activeTab === 'archived' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'archived' && styles.activeTabText]}>
            Archived
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={20} 
            color={activeTab === 'saved' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'recent' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Контент */}
      {renderContent()}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 14,
  },
  avatarText: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
  itemTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  itemMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
};