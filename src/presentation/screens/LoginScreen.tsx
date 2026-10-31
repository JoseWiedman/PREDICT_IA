
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

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
  const { width, height } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const horizontalSpace = isMobile ? 22 : isTablet ? 45 : 60;
  const titleSize = isMobile ? 29 : isTablet ? 34 : 36;
  const contentMaxWidth = isMobile ? 480 : 460;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const userName =
        userCredential.user.displayName ||
        userCredential.user.email?.split('@')[0] ||
        'Usuario';

      onLoginSuccess(userName);

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);

      let message =
        'No fue posible iniciar sesión. Intenta nuevamente.';

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message =
            'Correo o contraseña incorrectos. Verifica tus datos.';
          break;

        case 'auth/invalid-email':
          message = 'Ingresa un correo electrónico válido.';
          break;

        case 'auth/user-disabled':
          message = 'Esta cuenta ha sido deshabilitada.';
          break;

        case 'auth/too-many-requests':
          message =
            'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
          break;

        case 'auth/network-request-failed':
          message =
            'No hay conexión. Verifica tu conexión a internet.';
          break;

        case 'auth/operation-not-allowed':
          message =
            'El inicio de sesión por correo no está habilitado en Firebase.';
          break;
      }

      setErrorMessage(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: Math.max(height, 650),
            paddingHorizontal: horizontalSpace,
            paddingVertical: isMobile ? 85 : 65,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              width: '100%',
            },
          ]}
        >
          <Pressable
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Volver</Text>
          </Pressable>

          <Text style={styles.brand}>
            PREDICT<Text style={styles.brandAccent}>IA</Text>
          </Text>

          <Text
            style={[
              styles.title,
              { fontSize: titleSize },
            ]}
          >
            Bienvenido de nuevo.
          </Text>

          <Text style={styles.subtitle}>
            Ingresa a tu cuenta para continuar con el análisis y la predicción
            de partidos.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

            <TextInput
              style={[
                styles.input,
                errorMessage !== '' && styles.inputError,
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
              autoCorrect={false}
            />

            <Text style={styles.label}>CONTRASEÑA</Text>

            <View
              style={[
                styles.passwordContainer,
                errorMessage !== '' && styles.inputError,
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
                autoCapitalize="none"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? 'OCULTAR' : 'VER'}
                </Text>
              </Pressable>
            </View>

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
                <Text style={styles.registerLink}>
                  Crear una cuenta
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            PREDICTFUTBOLIA · ANÁLISIS Y PREDICCIÓN
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  backButton: {
    marginBottom: 35,
    alignSelf: 'flex-start',
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
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9BA79E',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 30,
  },
  form: {
    gap: 13,
    width: '100%',
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
    minWidth: 0,
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
    minWidth: 0,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
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
    textAlign: 'center',
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
