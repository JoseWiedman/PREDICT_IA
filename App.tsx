
import React, { useState } from 'react';

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

  const [tournamentViewModel] = useState(
    () => new TournamentViewModel()
  );

  const handleRegisterSuccess = (
    email: string,
    password: string
  ) => {
    setInitialEmail(email);
    setInitialPassword(password);
    setCurrentScreen('login');
  };

  // Iniciar sesión y recuperar el torneo guardado.
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
      Alert.alert(
        'Recuperación del torneo',
        error instanceof Error
          ? error.message
          : 'No fue posible recuperar el torneo guardado.'
      );
    } finally {
      setIsTournamentLoading(false);
      setCurrentScreen('home');
    }
  };

  // Cerrar sesión sin eliminar el torneo guardado.
  const handleLogout = () => {
    setUserName('');
    setInitialEmail('');
    setInitialPassword('');
    setCurrentScreen('login');
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
          onLoginSuccess={handleLoginSuccess}
          initialEmail={initialEmail}
          initialPassword={initialPassword}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onBack={() => setCurrentScreen('login')}
          onRegisterSuccess={handleRegisterSuccess}
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
              onPress={() => setCurrentScreen('tournamentSetup')}
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
            <ActivityIndicator size="large" color="#B9F66A" />

            <Text style={styles.loadingTitle}>
              {currentScreen === 'login'
                ? 'RECUPERANDO TORNEO'
                : 'PROCESANDO TORNEO'}
            </Text>

            <Text style={styles.loadingDescription}>
              {currentScreen === 'login'
                ? 'Consultando los resultados guardados...'
                : 'Procesando la información del torneo...'}
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
