
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { auth } from './src/config/firebaseConfig';

import SplashScreen from './src/presentation/screens/SplashScreen';
import LoginScreen from './src/presentation/screens/LoginScreen';
import RegisterScreen from './src/presentation/screens/RegisterScreen';
import HomeScreen from './src/presentation/screens/HomeScreen';
import TeamStatsScreen from './src/presentation/screens/TeamStatsScreen';
import SimulationScreen from './src/presentation/screens/SimulationScreen';
import TournamentSetupScreen from './src/presentation/screens/TournamentSetupScreen';
import TournamentResultsScreen from './src/presentation/screens/TournamentResultsScreen';

import { TournamentViewModel } from './src/presentation/viewmodels/TournamentViewModel';

import type {
  TournamentBracket,
  TournamentRound,
} from './src/domain/TournamentMatch';

type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'home'
  | 'teamStats'
  | 'simulate'
  | 'tournamentSetup'
  | 'tournamentResults';

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>('splash');

  const [initialEmail, setInitialEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [userName, setUserName] = useState('');

  const [tournament, setTournament] =
    useState<TournamentBracket | null>(null);

  const [isTournamentLoading, setIsTournamentLoading] =
    useState(false);

  const [isCheckingSession, setIsCheckingSession] =
    useState(true);

  const [tournamentViewModel] = useState(
    () => new TournamentViewModel()
  );

  // Controlar el proceso de registro y evitar eventos duplicados.
  const isRegisteringRef = useRef(false);
  const handledUserUidRef = useRef<string | null>(null);

  // Recuperar torneo guardado después de autenticar al usuario.
  const handleLoginSuccess = async (name: string) => {
    setUserName(name);
    setInitialEmail('');
    setInitialPassword('');
    setIsTournamentLoading(true);

    try {
      const savedTournament =
        await tournamentViewModel.loadSavedTournament();

      setTournament(savedTournament);
    } catch (error) {
      console.error('Error recuperando torneo:', error);

      Alert.alert(
        'Recuperación del torneo',
        error instanceof Error
          ? error.message
          : 'No fue posible recuperar el torneo guardado.'
      );
    } finally {
      setIsTournamentLoading(false);
      setIsCheckingSession(false);
      setCurrentScreen('home');
    }
  };

  // Indicar que el registro está comenzando.
  const handleRegisterStart = () => {
    isRegisteringRef.current = true;
  };

  // Finalizar el estado de registro.
  const handleRegisterEnd = () => {
    isRegisteringRef.current = false;
  };

  // Recibir el nombre completo desde RegisterScreen.
  const handleRegisterSuccess = async (
    _email: string,
    _password: string,
    name: string
  ) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      handledUserUidRef.current = currentUser.uid;
    }

    await handleLoginSuccess(name);
  };

  // Firebase controla la sesión y recupera el nombre actualizado.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // No procesar el usuario mientras se está registrando.
          if (isRegisteringRef.current) {
            return;
          }

          // Evitar procesar nuevamente un usuario ya atendido.
          if (handledUserUidRef.current === user.uid) {
            return;
          }

          try {
            // Actualizar los datos del usuario desde Firebase.
            await user.reload();

            // Obtener el usuario actualizado.
            const updatedUser = auth.currentUser;

            const name =
              updatedUser?.displayName ||
              updatedUser?.email?.split('@')[0] ||
              'Usuario';

            console.log(
              'Usuario autenticado:',
              updatedUser?.email
            );

            console.log(
              'Nombre recuperado desde Firebase:',
              name
            );

            handledUserUidRef.current =
              updatedUser?.uid ?? user.uid;

            await handleLoginSuccess(name);
          } catch (error) {
            console.error(
              'Error recuperando el usuario:',
              error
            );

            const name =
              user.displayName ||
              user.email?.split('@')[0] ||
              'Usuario';

            handledUserUidRef.current = user.uid;

            await handleLoginSuccess(name);
          }
        } else {
          handledUserUidRef.current = null;

          setUserName('');
          setTournament(null);
          setCurrentScreen('splash');
          setIsCheckingSession(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // Cerrar sesión en Firebase sin eliminar el torneo guardado.
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setInitialEmail('');
      setInitialPassword('');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      Alert.alert(
        'Error',
        'No fue posible cerrar la sesión. Intenta nuevamente.'
      );
    }
  };

  // Crear un torneo desde la fase seleccionada.
  const handleStartTournament = async (
    tournamentName: string,
    teams: string[],
    startingRound: TournamentRound
  ) => {
    setIsTournamentLoading(true);

    try {
      const result =
        await tournamentViewModel.simulateTournament(
          tournamentName,
          teams,
          startingRound
        );

      setTournament(result);
      setCurrentScreen('tournamentResults');
    } catch (error) {
      Alert.alert(
        'Error en el torneo',
        error instanceof Error
          ? error.message
          : 'No fue posible ejecutar el torneo.'
      );
    } finally {
      setIsTournamentLoading(false);
    }
  };

  // Continuar el torneo desde la siguiente fase pendiente.
  const handleContinueTournament = async (
    throughRound: TournamentRound
  ) => {
    setIsTournamentLoading(true);

    try {
      const result =
        await tournamentViewModel.continueTournament(
          throughRound
        );

      setTournament(result);
      setCurrentScreen('tournamentResults');
    } catch (error) {
      Alert.alert(
        'Error al continuar el torneo',
        error instanceof Error
          ? error.message
          : 'No fue posible continuar la simulación.'
      );
    } finally {
      setIsTournamentLoading(false);
    }
  };

  // Ejecutar la eliminación del torneo.
  const executeTournamentDeletion = async () => {
    setIsTournamentLoading(true);

    try {
      await tournamentViewModel.deleteSavedTournament();

      setTournament(null);

      if (Platform.OS === 'web') {
        window.alert(
          'El torneo guardado se eliminó correctamente.'
        );
      } else {
        Alert.alert(
          'Torneo eliminado',
          'El torneo guardado se eliminó correctamente.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible eliminar el torneo.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error al eliminar', message);
      }
    } finally {
      setIsTournamentLoading(false);
    }
  };

  // Eliminar el torneo guardado con confirmación.
  const handleDeleteTournament = () => {
    if (!tournament) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas eliminar el torneo guardado? Se perderán todos sus resultados y esta acción no se puede deshacer.'
      );

      if (confirmed) {
        void executeTournamentDeletion();
      }

      return;
    }

    Alert.alert(
      'Eliminar torneo',
      '¿Estás seguro de que deseas eliminar el torneo guardado? Se perderán todos sus resultados y esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void executeTournamentDeletion();
          },
        },
      ]
    );
  };

  // Mostrar carga mientras Firebase recupera la sesión.
  if (isCheckingSession) {
    return (
      <View style={styles.sessionLoading}>
        <ActivityIndicator
          size="large"
          color="#B9F66A"
        />

        <Text style={styles.sessionLoadingText}>
          VERIFICANDO SESIÓN...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {currentScreen === 'splash' && (
        <View style={styles.screenContainer}>
          <SplashScreen />

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.startButtonText}>
              COMENZAR →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onBack={() => setCurrentScreen('splash')}
          onRegister={() => setCurrentScreen('register')}
          onLoginSuccess={() => {}}
          initialEmail={initialEmail}
          initialPassword={initialPassword}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onBack={() => setCurrentScreen('login')}
          onRegisterStart={handleRegisterStart}
          onRegisterSuccess={handleRegisterSuccess}
          onRegisterEnd={handleRegisterEnd}
        />
      )}

      {currentScreen === 'home' && (
        <>
          <HomeScreen
            userName={userName}
            onLogout={handleLogout}
            onAnalyze={() => setCurrentScreen('teamStats')}
            onSimulate={() => setCurrentScreen('simulate')}
          />

          <View style={styles.tournamentActions}>
            {tournament && (
              <>
                <TouchableOpacity
                  style={styles.savedTournamentButton}
                  onPress={() =>
                    setCurrentScreen('tournamentResults')
                  }
                  disabled={isTournamentLoading}
                >
                  <Text style={styles.savedTournamentButtonText}>
                    VER TORNEO GUARDADO
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteTournamentButton}
                  onPress={handleDeleteTournament}
                  disabled={isTournamentLoading}
                >
                  <Text style={styles.deleteTournamentButtonText}>
                    ELIMINAR TORNEO GUARDADO
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.tournamentButton}
              onPress={() =>
                setCurrentScreen('tournamentSetup')
              }
              disabled={isTournamentLoading}
            >
              <Text style={styles.tournamentButtonText}>
                🏆 NUEVO TORNEO
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {currentScreen === 'teamStats' && (
        <TeamStatsScreen
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'simulate' && (
        <SimulationScreen
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'tournamentSetup' && (
        <TournamentSetupScreen
          onBack={() => setCurrentScreen('home')}
          onStartTournament={handleStartTournament}
        />
      )}

      {currentScreen === 'tournamentResults' && tournament && (
        <TournamentResultsScreen
          tournament={tournament}
          onBack={() => setCurrentScreen('home')}
          onContinueTournament={handleContinueTournament}
        />
      )}

      {isTournamentLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color="#B9F66A"
            />

            <Text style={styles.loadingTitle}>
              PROCESANDO TORNEO
            </Text>

            <Text style={styles.loadingDescription}>
              Consultando y procesando la información guardada...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  sessionLoading: {
    flex: 1,
    backgroundColor: '#101914',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  sessionLoadingText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  screenContainer: {
    flex: 1,
  },
  startButton: {
    position: 'absolute',
    bottom: 65,
    left: 30,
    right: 30,
    backgroundColor: '#B9F66A',
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#101914',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tournamentActions: {
    position: 'absolute',
    bottom: 18,
    left: 22,
    right: 22,
    gap: 10,
  },
  savedTournamentButton: {
    backgroundColor: '#26382B',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  savedTournamentButtonText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  deleteTournamentButton: {
    backgroundColor: '#301E1E',
    borderWidth: 1,
    borderColor: '#A94D4D',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteTournamentButtonText: {
    color: '#FF8585',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tournamentButton: {
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tournamentButtonText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  loadingCard: {
    backgroundColor: '#19251E',
    borderRadius: 18,
    padding: 30,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#354439',
  },
  loadingTitle: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 22,
  },
  loadingDescription: {
    color: '#A8B5AA',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 12,
  },
});
