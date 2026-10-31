
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

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../../config/firebaseConfig';

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterStart: () => void;
  onRegisterSuccess: (
    email: string,
    password: string,
    name: string
  ) => void;
  onRegisterEnd: () => void;
}

export default function RegisterScreen({
  onBack,
  onRegisterStart,
  onRegisterSuccess,
  onRegisterEnd,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      Alert.alert(
        'Campos incompletos',
        'Por favor, completa todos los campos.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Contraseña débil',
        'La contraseña debe tener mínimo 6 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Error',
        'Las contraseñas no coinciden.'
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // Avisar a App.tsx que el registro ha comenzado.
      onRegisterStart();

      // Crear el usuario en Firebase.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      console.log(
        'Usuario creado:',
        userCredential.user.uid
      );

      // Guardar el nombre completo.
      await updateProfile(userCredential.user, {
        displayName: cleanName,
      });

      // Actualizar el perfil desde Firebase.
      await userCredential.user.reload();

      const updatedUser = auth.currentUser;

      console.log(
        'Nombre guardado en Firebase:',
        updatedUser?.displayName
      );

      // Verificar que el nombre se haya guardado correctamente.
      if (updatedUser?.displayName !== cleanName) {
        throw new Error(
          'Firebase no confirmó la actualización del nombre.'
        );
      }

      // Informar el registro exitoso.
      onRegisterSuccess(
        cleanEmail,
        password,
        cleanName
      );

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente.'
      );

    } catch (error: any) {
      console.error('Error en el registro:', error);
      console.error('Código del error:', error?.code);

      let message =
        'No fue posible completar el registro. Intenta nuevamente.';

      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'Este correo electrónico ya está registrado.';
          break;

        case 'auth/invalid-email':
          message = 'El correo electrónico no tiene un formato válido.';
          break;

        case 'auth/weak-password':
          message = 'La contraseña es demasiado débil.';
          break;

        case 'auth/network-request-failed':
          message = 'No hay conexión. Verifica tu conexión a internet.';
          break;

        case 'auth/operation-not-allowed':
          message =
            'El registro por correo y contraseña no está habilitado en Firebase.';
          break;

        case 'auth/too-many-requests':
          message =
            'Se han realizado demasiados intentos. Intenta más tarde.';
          break;
      }

      Alert.alert('Error de registro', message);

    } finally {
      // Avisar que el proceso de registro terminó.
      onRegisterEnd();
      setLoading(false);
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
            autoCapitalize="words"
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
            autoCorrect={false}
          />

          <Text style={styles.label}>CONTRASEÑA</Text>

          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
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

          <Pressable
            style={[
              styles.registerButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA →'}
            </Text>
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
  disabledButton: {
    opacity: 0.6,
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
