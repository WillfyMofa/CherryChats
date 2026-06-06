import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

const { height, width } = Dimensions.get('window');

export default function ProfileMenu({ visible, onClose, onDeleteAccount }) {
  const handleBlockedUsers = () => {
    onClose();
    Alert.alert('Заблокированные пользователи', 'Список заблокированных будет здесь');
  };

  const handleDeleteAccount = () => {
    onClose();
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены? Это действие необратимо. Все ваши данные будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            if (onDeleteAccount) onDeleteAccount();
          }
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.menuItem} onPress={handleBlockedUsers}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="ban-outline" size={24} color={colors.error} />
                <Text style={styles.menuItemText}>Blocked users</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="trash-outline" size={24} color={colors.error} />
                <Text style={[styles.menuItemText, styles.deleteText]}>Delete account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: height * 0.6,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    fontSize: 20,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  deleteText: {
    color: colors.error,
  },
});