
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterSuccess: (email: string, password: string) => void;
}

export default function RegisterScreen({
  onBack,
  onRegisterSuccess,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener mínimo 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('predictia_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const existingUser = users.find(
        (user: { email: string }) =>
          user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        Alert.alert('Cuenta existente', 'Este correo ya está registrado.');
        return;
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      await AsyncStorage.setItem(
        'predictia_users',
        JSON.stringify([...users, newUser])
      );

      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada.');
      onRegisterSuccess(newUser.email, newUser.password);
    } catch {
      Alert.alert('Error', 'No fue posible crear la cuenta. Intenta nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver al login</Text>
        </Pressable>

        <Text style={styles.brand}>PREDICTIA</Text>
        <Text style={styles.title}>Crea tu cuenta.</Text>
        <Text style={styles.subtitle}>
          Regístrate para comenzar a explorar el fútbol desde los datos.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>NOMBRE COMPLETO</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#78827B"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#78827B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 4 caracteres"
            placeholderTextColor="#78827B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#78827B"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>CREAR CUENTA →</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          PREDICTFUTBOLIA · ANÁLISIS Y PREDICCIÓN
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  scroll: {
    flexGrow: 1,
    padding: 28,
    paddingTop: 55,
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: 38,
  },
  backText: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: '#B9F66A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 18,
  },
  title: {
    color: '#F2F5F0',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9BA79E',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 35,
  },
  form: {
    gap: 12,
  },
  label: {
    color: '#AAB5AC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1B2720',
    borderWidth: 1,
    borderColor: '#344238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#B9F66A',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#101914',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footer: {
    color: '#657269',
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 45,
  },
});
