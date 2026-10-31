
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onBack: () => void;
  onRegister: () => void;
  onLoginSuccess: (name: string) => void;
  initialEmail?: string;
  initialPassword?: string;
}

export default function LoginScreen({
  onBack,
  onRegister,
  onLoginSuccess,
  initialEmail = '',
  initialPassword = '',
}: LoginScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      setLoading(true);

      // Usuario de demostración
      const isDemoUser =
        email.trim().toLowerCase() === 'estudiante@clase.com' &&
        password === '1234';

      if (isDemoUser) {
        onLoginSuccess('Estudiante');
        return;
      }

      // Consultar usuarios registrados
      const storedUsers = await AsyncStorage.getItem('predictia_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const userFound = users.find(
        (user: { name: string; email: string; password: string }) =>
          user.email.toLowerCase() === email.trim().toLowerCase() &&
          user.password === password
      );

      if (userFound) {
        onLoginSuccess(userFound.name);
      } else {
        setErrorMessage(
          'Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.'
        );
      }
    } catch {
      setErrorMessage(
        'No fue posible validar tus datos. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>

        <Text style={styles.brand}>
          PREDICT<Text style={styles.brandAccent}>IA</Text>
        </Text>

        <Text style={styles.title}>Bienvenido de nuevo.</Text>

        <Text style={styles.subtitle}>
          Ingresa a tu cuenta para continuar con el análisis y la predicción
          de partidos.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

          <TextInput
            style={[
              styles.input,
              errorMessage && styles.inputError,
            ]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#78827B"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>CONTRASEÑA</Text>

          <View
            style={[
              styles.passwordContainer,
              errorMessage && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#78827B"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage('');
              }}
              secureTextEntry={!showPassword}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showPassword}>
                {showPassword ? 'OCULTAR' : 'VER'}
              </Text>
            </Pressable>
          </View>

          {/* Mensaje de error */}
          {errorMessage !== '' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>!</Text>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.loginButton,
              loading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'VALIDANDO...' : 'INICIAR SESIÓN →'}
            </Text>
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              ¿Aún no tienes una cuenta?
            </Text>

            <Pressable onPress={onRegister}>
              <Text style={styles.registerLink}>Crear una cuenta</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          PREDICTFUTBOLIA · ANÁLISIS Y PREDICCIÓN
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 35,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 28,
  },
  backText: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 18,
  },
  brandAccent: {
    color: '#B9F66A',
  },
  title: {
    color: '#F2F5F0',
    fontSize: 32,
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
    gap: 13,
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
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#E56B6B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2720',
    borderWidth: 1,
    borderColor: '#344238',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  showPassword: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '800',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#321E20',
    borderWidth: 1,
    borderColor: '#713B3F',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
    gap: 9,
  },
  errorIcon: {
    color: '#FF8585',
    backgroundColor: '#5B292D',
    width: 19,
    height: 19,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
  },
  errorText: {
    flex: 1,
    color: '#FFAAAA',
    fontSize: 12,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: '#B9F66A',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 15,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#101914',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 25,
    gap: 8,
  },
  registerText: {
    color: '#9BA79E',
    fontSize: 13,
  },
  registerLink: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    color: '#657269',
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 45,
  },
});
