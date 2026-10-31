
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FootballViewModel } from '../viewmodels/FootballViewModel';
import { Match } from '../../domain/Match';

interface DataTestScreenProps {
  onBack: () => void;
}

export default function DataTestScreen({ onBack }: DataTestScreenProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const viewModel = new FootballViewModel();

    const loadData = async () => {
      try {
        const result = await viewModel.loadMatches();
        setMatches(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar los partidos.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>PREDICTIA</Text>

        <Text style={styles.subtitle}>VALIDACIÓN DE DATOS</Text>

        <Text style={styles.title}>Resultados históricos</Text>

        <Text style={styles.description}>
          Comprobación de la conexión con la base de resultados de fútbol.
        </Text>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#B9F66A" />
            <Text style={styles.loadingText}>
              Descargando partidos históricos...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error de conexión</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.statLabel}>PARTIDOS DESCARGADOS</Text>

              <Text style={styles.statNumber}>
                {matches.length.toLocaleString('es-CO')}
              </Text>

              <Text style={styles.successText}>
                Conexión realizada correctamente
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Primeros partidos</Text>

            {matches.slice(0, 5).map((match, index) => (
              <View key={`${match.date}-${index}`} style={styles.matchCard}>
                <Text style={styles.matchDate}>{match.date}</Text>

                <Text style={styles.teams}>
                  {match.homeTeam}  {match.homeScore} - {match.awayScore}{' '}
                  {match.awayTeam}
                </Text>

                <Text style={styles.tournament}>
                  {match.tournament}
                </Text>

                <Text style={styles.location}>
                  {match.city}, {match.country}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text onPress={onBack} style={styles.backButton}>
          ← VOLVER
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  content: {
    padding: 24,
    paddingTop: 55,
  },
  brand: {
    color: '#B9F66A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 45,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 12,
  },
  description: {
    color: '#A4AEA7',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#1B2920',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 28,
  },
  statLabel: {
    color: '#A4AEA7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statNumber: {
    color: '#B9F66A',
    fontSize: 42,
    fontWeight: '900',
    marginVertical: 12,
  },
  successText: {
    color: '#B9F66A',
    fontSize: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: '#351D20',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  errorTitle: {
    color: '#FF7777',
    fontWeight: '800',
    fontSize: 17,
    marginBottom: 10,
  },
  errorText: {
    color: '#FFFFFF',
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  matchCard: {
    backgroundColor: '#1B2920',
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
  },
  matchDate: {
    color: '#B9F66A',
    fontSize: 11,
    marginBottom: 9,
  },
  teams: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
  },
  tournament: {
    color: '#A4AEA7',
    fontSize: 12,
    marginTop: 8,
  },
  location: {
    color: '#77857B',
    fontSize: 11,
    marginTop: 5,
  },
  backButton: {
    color: '#B9F66A',
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: 35,
    textAlign: 'center',
    padding: 12,
  },
});
