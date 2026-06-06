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
import OtherWaysModal from '../components/OtherWaysModal';
import { saveUserData } from '../utils/storage';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/auth`;


export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loginMethod, setLoginMethod] = useState('nickname');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Ошибка', 'Введите данные для входа');
      return;
    }
    
    // Пароль нужен для nickname, phone и email
    if ((loginMethod === 'nickname' || loginMethod === 'phone' || loginMethod === 'email') && !password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestData = {
        password: password
      };
      
      if (loginMethod === 'nickname') {
        requestData.username = identifier;
      } else if (loginMethod === 'phone') {
        let cleanPhone = identifier.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
          cleanPhone = '+7' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
          cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) {
          cleanPhone = '+7' + cleanPhone.substring(1);
        }
        requestData.phoneNumber = cleanPhone;
        console.log('Sending phone:', cleanPhone);
      } else if (loginMethod === 'email') {
        requestData.email = identifier.toLowerCase();
        console.log('Sending email:', identifier.toLowerCase());
      }
      
      console.log('Request data:', requestData);
      
      const response = await axios.post(`${API_URL}/login`, requestData);
      
      await saveUserData(response.data.userId, response.data.username, loginMethod, identifier);
      
      setIsLoading(false);
      Alert.alert('Успех', response.data.message, [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error.response?.data);
      const message = error.response?.data?.message || 'Не удалось войти';
      Alert.alert('Ошибка', message);
    }
  };

  const handleSelectMethod = (method) => {
    let methodKey = 'nickname';
    if (method === 'phone number') methodKey = 'phone';
    else if (method === 'email') methodKey = 'email';
    else if (method === 'device scanning') methodKey = 'device';
    
    setLoginMethod(methodKey);
    setIdentifier('');
    setPassword('');
    setModalVisible(false);
  };

  const getLabelText = () => {
    switch (loginMethod) {
      case 'phone':
        return '     phone number';
      case 'email':
        return '     email';
      default:
        return '     nickname';
    }
  };

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'phone':
        return '+7 999 999-99-99';
      case 'email':
        return 'example@mail.com';
      default:
        return 'Enter';
    }
  };

  const getKeyboardType = () => {
    switch (loginMethod) {
      case 'phone':
        return 'phone-pad';
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  // Показываем поле пароля для nickname, phone и email
  const showPasswordField = loginMethod === 'nickname' || loginMethod === 'phone' || loginMethod === 'email';

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

        <Text style={styles.title}>Sing In</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.textSecondary}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={getKeyboardType()}
          />
          <Text style={styles.label}>{getLabelText()}</Text>
        </View>

        {showPasswordField && (
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
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#DC1248" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.otherWaysButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.otherWaysText}>other ways to sing up</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <OtherWaysModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectMethod={handleSelectMethod}
      />
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
    marginBottom: 16,
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
  otherWaysButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  otherWaysText: {
    color: colors.primary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'ShantellSans-Regular',
    textDecorationLine: 'underline',
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