
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { FootballViewModel } from '../viewmodels/FootballViewModel';
import { Match } from '../../domain/Match';

interface DataTestScreenProps {
  onBack: () => void;
}

export default function DataTestScreen({ onBack }: DataTestScreenProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const horizontalSpace = isMobile ? 18 : isTablet ? 32 : 45;
  const titleSize = isMobile ? 27 : isTablet ? 32 : 36;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const viewModel = new FootballViewModel();

    const loadData = async () => {
      try {
        const result = await viewModel.loadMatches();

        if (isMounted) {
          setMatches(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No fue posible cargar los partidos.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalSpace,
            paddingTop: isMobile ? 30 : 45,
          },
        ]}
      >
        <View style={styles.page}>
          <Text style={styles.brand}>PREDICTIA</Text>

          <Text style={styles.subtitle}>VALIDACIÓN DE DATOS</Text>

          <Text style={[styles.title, { fontSize: titleSize }]}>
            Resultados históricos
          </Text>

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
                <Text style={styles.statLabel}>
                  PARTIDOS DESCARGADOS
                </Text>

                <Text style={styles.statNumber}>
                  {matches.length.toLocaleString('es-CO')}
                </Text>

                <Text style={styles.successText}>
                  Conexión realizada correctamente
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Primeros partidos
              </Text>

              {matches.slice(0, 5).map((match, index) => (
                <View
                  key={`${match.date}-${index}`}
                  style={styles.matchCard}
                >
                  <Text style={styles.matchDate}>
                    {match.date}
                  </Text>

                  <View style={styles.teamsContainer}>
                    <Text style={styles.teamName} numberOfLines={2}>
                      {match.homeTeam}
                    </Text>

                    <View style={styles.scoreContainer}>
                      <Text style={styles.score}>
                        {match.homeScore} - {match.awayScore}
                      </Text>
                    </View>

                    <Text
                      style={[styles.teamName, styles.awayTeam]}
                      numberOfLines={2}
                    >
                      {match.awayTeam}
                    </Text>
                  </View>

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
        </View>
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
    flexGrow: 1,
    paddingBottom: 45,
  },
  page: {
    width: '100%',
    maxWidth: 1050,
    alignSelf: 'center',
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
    marginTop: 30,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 12,
  },
  description: {
    color: '#A4AEA7',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
    maxWidth: 750,
  },
  card: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    backgroundColor: '#1B2920',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  statLabel: {
    color: '#A4AEA7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  statNumber: {
    color: '#B9F66A',
    fontSize: 42,
    fontWeight: '900',
    marginVertical: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#B9F66A',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    backgroundColor: '#1B2920',
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
  },
  matchDate: {
    color: '#B9F66A',
    fontSize: 11,
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    flex: 1,
    flexShrink: 1,
  },
  awayTeam: {
    textAlign: 'right',
  },
  scoreContainer: {
    backgroundColor: '#26372B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 0,
  },
  score: {
    color: '#B9F66A',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  tournament: {
    color: '#A4AEA7',
    fontSize: 12,
    marginTop: 12,
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
