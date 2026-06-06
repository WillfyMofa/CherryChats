import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import colors from '../styles/colors';

export default function OtherWaysModal({ visible, onClose, onSelectMethod }) {
  const handleSelect = (method) => {
    onSelectMethod(method);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Choose another way:</Text>
            
            <TouchableOpacity 
              style={styles.option} 
              onPress={() => handleSelect('phone number')}
            >
              <Text style={styles.optionText}>⬤ phone number</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.option} 
              onPress={() => handleSelect('email')}
            >
              <Text style={styles.optionText}>⬤ email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.option} 
              onPress={() => handleSelect('device scanning')}
            >
              <Text style={styles.optionText}>⬤ device scanning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContent: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSubTitle,
    fontFamily: 'ShantellSans-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'ShantellSans-Regular',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
    textDecorationLine: 'underline',
  },
});