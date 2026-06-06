import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import colors from '../styles/colors';
import { saveUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/auth`;

export default function RegisterScreen({ navigation }) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!nickname.trim()) {
      Alert.alert('Ошибка', 'Введите никнейм');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: nickname,
        password: password
      });
      
      // Сохраняем данные пользователя
      await saveUserData(response.data.userId, response.data.username);
      
      setIsLoading(false);
      Alert.alert('Успех', response.data.message, [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Не удалось зарегистрироваться';
      Alert.alert('Ошибка', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Image 
            source={require('../assets/images/cherry-cats.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Registration</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={colors.textSecondary}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>     nickname</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>     password</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#DC1248" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already registered? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sing in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imagePlaceholder: {
    alignItems: 'center',
    marginTop: 52,
    marginBottom: 18,
  },
  image: {
    width: 224,  
    height: 224,
  },
  title: {
    fontSize: 32, 
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'ShantellSans-Regular',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: -10,
    fontFamily: 'ShantellSans-Regular',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 20,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: 'ShantellSans-Regular',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: 200,
    height: 56, 
    justifyContent: 'center',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#281919',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'ShantellSans-Regular',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'ShantellSans-Regular',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ShantellSans-Regular',
  },
};