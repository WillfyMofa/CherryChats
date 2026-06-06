import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function SettingsScreen() {
  const [theme, setTheme] = useState('light'); // 'light' или 'dark'
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    Alert.alert('Тема', `Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`);
    // TODO: Реализовать смену темы глобально
  };

  const handleHelp = () => {
    Alert.alert('Помоги себе сам, помолись небесам)');
  };

  const handleAbout = () => {
    Alert.alert('О приложении', 'Cherry Chats\nВерсия 1.0.0\n\nЧат-приложение с геолокацией и вишенками 🍒');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="settings-outline" size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      {/* Theme */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Theme</Text>
        </View>
        <View style={styles.themeButtons}>
          <TouchableOpacity 
            style={[
              styles.themeButton,
              theme === 'light' && styles.themeButtonActive
            ]}
            onPress={() => setTheme('light')}
          >
            <Text style={[
              styles.themeButtonText,
              theme === 'light' && styles.themeButtonTextActive
            ]}>light</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.themeButton,
              theme === 'dark' && styles.themeButtonActive
            ]}
            onPress={toggleTheme}
          >
            <Text style={[
              styles.themeButtonText,
              theme === 'dark' && styles.themeButtonTextActive
            ]}>dark</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <View style={styles.notificationRow}>
          <Text style={styles.notificationText}>Allow notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.surface, true: colors.subprimary }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Language</Text>
        </View>
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.languageText}>English</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Help */}
      <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.menuItemText}>Help</Text>
        </View>
      </TouchableOpacity>

      {/* About app */}
      <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.menuItemText}>About app</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 32,
    marginBottom: 16
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
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 20
  },
  themeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  themeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  themeButtonTextActive: {
    color: colors.background,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  languageText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
};