import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../styles/colors';
import { getUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/users`;
const CHATS_API_URL = `${API_BASE_URL}/api/chats`;

// Список доступных аватаров для группы
const groupAvatars = [
  { id: 'cherry-chan-duo', name: 'Duo 🍒', source: require('../assets/images/cherry-chan-duo.png') },
  { id: 'cherry-chan-hi', name: 'Hi! 👋', source: require('../assets/images/cherry-chan-hi.png') },
  { id: 'cherry-chan-ah', name: 'Ah! 😯', source: require('../assets/images/cherry-chan-ah.png') },
  { id: 'cherry-chan-sleep', name: 'Sleep 😴', source: require('../assets/images/cherry-chan-sleep.png') },
  { id: 'cherry-chan-love', name: 'Love 🍒', source: require('../assets/images/cherry-chan-love.png') },
];

export default function CreateChatScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('private');
  const [groupAvatar, setGroupAvatar] = useState('cherry-chan-duo');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadCurrentUser();
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchQuery.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setFilteredUsers([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const loadCurrentUser = async () => {
    const { userId } = await getUserData();
    setCurrentUserId(userId);
  };

  const loadAllUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const performSearch = () => {
    setIsSearching(true);
    const filtered = allUsers.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      user.userId !== currentUserId &&
      !selectedUsers.find(u => u.userId === user.userId)
    );
    setFilteredUsers(filtered);
    setIsSearching(false);
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.find(u => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(u => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setFilteredUsers([]);
    }
  };

  const handleCreateChat = async () => {
    if (!isGroup && selectedUsers.length === 0) {
      Alert.alert('Ошибка', 'Выберите пользователя для чата');
      return;
    }
    
    if (isGroup && selectedUsers.length < 2) {
      Alert.alert('Ошибка', 'В группе должно быть минимум 2 участника');
      return;
    }
    
    if (isGroup && !groupName.trim()) {
      Alert.alert('Ошибка', 'Введите название группы');
      return;
    }

    try {
      const { userId } = await getUserData();
      const participantIds = [...selectedUsers.map(u => u.userId), userId];
      
      if (isGroup) {
        await axios.post(`${CHATS_API_URL}/group`, {
          name: groupName,
          chatType: groupType,
          avatar: groupAvatar,
          participantIds: participantIds,
          creatorId: userId
        });
        Alert.alert('Успех', 'Групповой чат создан');
        navigation.getParent()?.navigate('Main', { screen: 'Chats' });
      } else {
        await axios.post(`${CHATS_API_URL}/direct`, {
          userId1: userId,
          userId2: selectedUsers[0].userId
        });
        Alert.alert('Успех', 'Чат создан');
        navigation.getParent()?.navigate('Main', { screen: 'Chats' });
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      Alert.alert('Ошибка', 'Не удалось создать чат');
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => toggleUserSelection(item)}
    >
      <Image 
        source={require('../assets/images/cherry-chan-hi.png')}
        style={styles.userAvatar}
        resizeMode="contain"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderSelectedUser = ({ item }) => (
    <View style={styles.selectedChip}>
      <Text style={styles.selectedChipText}>{item.username}</Text>
      <TouchableOpacity onPress={() => toggleUserSelection(item)}>
        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const currentAvatarObj = groupAvatars.find(a => a.id === groupAvatar) || groupAvatars[0];

  // Текст описания в зависимости от типа чата
  const getTypeDescription = () => {
    if (groupType === 'private') {
      return 'Private group: Only invited members can join and see the chat';
    } else {
      return 'Public group: Anyone can join and see the chat';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeButton, !isGroup && styles.typeButtonActive]}
            onPress={() => setIsGroup(false)}
          >
            <Text style={[styles.typeButtonText, !isGroup && styles.typeButtonTextActive]}>
              Direct
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeButton, isGroup && styles.typeButtonActive]}
            onPress={() => setIsGroup(true)}
          >
            <Text style={[styles.typeButtonText, isGroup && styles.typeButtonTextActive]}>
              Group
            </Text>
          </TouchableOpacity>
        </View>

        {isGroup && (
          <>
            {/* Аватар группы */}
            <TouchableOpacity style={styles.avatarSection} onPress={() => setAvatarModalVisible(true)}>
              <Image 
                source={currentAvatarObj.source}
                style={styles.groupAvatar}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Название группы */}
            <View style={styles.groupNameSection}>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Group name"
                placeholderTextColor={colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>

            {/* Тип чата */}
            <View style={styles.groupTypeSection}>
              <Text style={styles.groupTypeLabel}>Chat type</Text>
              <View style={styles.groupTypeButtons}>
                <TouchableOpacity 
                  style={[styles.groupTypeButton, groupType === 'private' && styles.groupTypeButtonActive]}
                  onPress={() => setGroupType('private')}
                >
                  <Text style={[styles.groupTypeButtonText, groupType === 'private' && styles.groupTypeButtonTextActive]}>
                    Private
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.groupTypeButton, groupType === 'public' && styles.groupTypeButtonActive]}
                  onPress={() => setGroupType('public')}
                >
                  <Text style={[styles.groupTypeButtonText, groupType === 'public' && styles.groupTypeButtonTextActive]}>
                    Public
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.typeDescription}>{getTypeDescription()}</Text>
            </View>
          </>
        )}

        {/* Поиск */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={isGroup ? "Search members..." : "Search users..."}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Выбранные пользователи */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedTitle}>
              Selected ({selectedUsers.length}):
            </Text>
            <FlatList
              horizontal
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={(item) => item.userId.toString()}
              showsHorizontalScrollIndicator={false}
              style={styles.selectedList}
            />
          </View>
        )}

        {/* Результаты поиска */}
        {searchQuery.length >= 2 && (
          <>
            {isSearching ? (
              <View style={styles.loadingResults}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={(item) => item.userId.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersList}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No users found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Кнопка создания */}
      <TouchableOpacity 
        style={[styles.createButton, (!isGroup && selectedUsers.length === 0) || (isGroup && selectedUsers.length < 2) ? styles.createButtonDisabled : null]}
        onPress={handleCreateChat}
        disabled={(!isGroup && selectedUsers.length === 0) || (isGroup && selectedUsers.length < 2)}
      >
        <Text style={styles.createButtonText}>Create Chat</Text>
      </TouchableOpacity>

      {/* Модальное окно выбора аватара */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setAvatarModalVisible(false)} activeOpacity={1} />
          <View style={styles.avatarModalContainer}>
            <View style={styles.avatarModalHeader}>
              <Text style={styles.avatarModalTitle}>Choose group avatar</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarsGrid}>
              {groupAvatars.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.avatarOption, groupAvatar === item.id && styles.avatarOptionSelected]}
                  onPress={() => {
                    setGroupAvatar(item.id);
                    setAvatarModalVisible(false);
                  }}
                >
                  <Image source={item.source} style={styles.avatarOptionImage} resizeMode="contain" />
                  <Text style={styles.avatarOptionName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'ShantellSans-Regular' },
  typeSelector: { flexDirection: 'row', margin: 20, marginBottom: 10, borderRadius: 30, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  typeButtonActive: { backgroundColor: colors.primary },
  typeButtonText: { fontSize: 14, color: colors.text, fontFamily: 'ShantellSans-Regular' },
  typeButtonTextActive: { color: colors.background },
  
  // Групповые стили
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  groupAvatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: colors.border },
  changeAvatarText: { fontSize: 14, color: colors.primary, fontFamily: 'ShantellSans-Regular', textDecorationLine: 'underline', marginTop: 8 },
  groupNameSection: { paddingHorizontal: 20, marginBottom: 20 },
  groupNameInput: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
    textDecorationLine: 'underline',
    textAlign: 'center',
    padding: 8,
  },
  groupTypeSection: { paddingHorizontal: 20, marginBottom: 20 },
  groupTypeLabel: { fontSize: 16, color: colors.text, fontFamily: 'ShantellSans-Regular', marginBottom: 12 },
  groupTypeButtons: { flexDirection: 'row', gap: 12 },
  groupTypeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 25, borderWidth: 1, borderColor: colors.border },
  groupTypeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  groupTypeButtonText: { fontSize: 14, color: colors.text, fontFamily: 'ShantellSans-Regular' },
  groupTypeButtonTextActive: { color: colors.background },
  typeDescription: { fontSize: 12, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular', marginTop: 12, lineHeight: 16 },
  
  // Поиск
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 16, color: colors.text, fontFamily: 'ShantellSans-Regular', marginLeft: 10 },
  
  // Выбранные пользователи
  selectedContainer: { paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  selectedTitle: { fontSize: 14, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular', marginBottom: 8 },
  selectedList: { flexGrow: 0 },
  selectedChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: colors.border, gap: 6 },
  selectedChipText: { fontSize: 14, color: colors.text, fontFamily: 'ShantellSans-Regular' },
  
  // Результаты поиска
  usersList: { paddingHorizontal: 20, paddingBottom: 20 },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  userAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 1, borderColor: colors.border },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, color: colors.text, fontFamily: 'ShantellSans-Regular' },
  loadingResults: { padding: 20, alignItems: 'center' },
  noResultsContainer: { alignItems: 'center', paddingTop: 40 },
  noResultsText: { fontSize: 16, color: colors.textSecondary, fontFamily: 'ShantellSans-Regular' },
  
  // Кнопка создания
  createButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { fontSize: 16, color: colors.background, fontFamily: 'ShantellSans-Regular', fontWeight: '600' },
  
  // Модальное окно
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  avatarModalContainer: { width: '85%', backgroundColor: colors.background, borderRadius: 30, padding: 20, maxHeight: '80%', zIndex: 10 },
  avatarModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatarModalTitle: { fontSize: 20, color: colors.primary, fontFamily: 'ShantellSans-Regular' },
  avatarsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  avatarOption: { width: '48%', alignItems: 'center', padding: 12, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 2, borderColor: colors.border },
  avatarOptionSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  avatarOptionImage: { width: 80, height: 80, marginBottom: 8 },
  avatarOptionName: { fontSize: 12, color: colors.text, fontFamily: 'ShantellSans-Regular', textAlign: 'center' },
};