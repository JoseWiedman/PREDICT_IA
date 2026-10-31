
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';

import { FootballViewModel } from '../viewmodels/FootballViewModel';
import { TeamStats } from '../../domain/TeamStats';

interface TeamStatsScreenProps {
  onBack: () => void;
}

export default function TeamStatsScreen({
  onBack,
}: TeamStatsScreenProps) {
  const [teamOne, setTeamOne] = useState('Colombia');
  const [teamTwo, setTeamTwo] = useState('Argentina');

  const [statsOne, setStatsOne] = useState<TeamStats | null>(null);
  const [statsTwo, setStatsTwo] = useState<TeamStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!teamOne.trim() || !teamTwo.trim()) {
      setError('Debes escribir el nombre de los dos equipos.');
      return;
    }

    if (teamOne.trim().toLowerCase() === teamTwo.trim().toLowerCase()) {
      setError('Debes seleccionar dos equipos diferentes.');
      return;
    }

    setLoading(true);
    setError('');
    setStatsOne(null);
    setStatsTwo(null);

    try {
      const viewModel = new FootballViewModel();

      const [resultOne, resultTwo] = await Promise.all([
        viewModel.getTeamStats(teamOne.trim()),
        viewModel.getTeamStats(teamTwo.trim()),
      ]);

      setStatsOne(resultOne);
      setStatsTwo(resultTwo);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible consultar las estadísticas.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStats = (stats: TeamStats) => (
    <View style={styles.statsCard}>
      <Text style={styles.teamName}>{stats.team}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.played}</Text>
          <Text style={styles.statLabel}>Jugados</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.wins}</Text>
          <Text style={styles.statLabel}>Victorias</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.draws}</Text>
          <Text style={styles.statLabel}>Empates</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.losses}</Text>
          <Text style={styles.statLabel}>Derrotas</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Goles a favor</Text>
        <Text style={styles.detailValue}>{stats.goalsFor}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Goles en contra</Text>
        <Text style={styles.detailValue}>{stats.goalsAgainst}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Promedio de goles a favor</Text>
        <Text style={styles.detailValue}>{stats.avgGoalsFor}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Promedio de goles en contra</Text>
        <Text style={styles.detailValue}>{stats.avgGoalsAgainst}</Text>
      </View>

      <View style={styles.winRateContainer}>
        <Text style={styles.winRateLabel}>PORCENTAJE DE VICTORIAS</Text>
        <Text style={styles.winRateValue}>{stats.winRate}%</Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(stats.winRate, 100)}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>PREDICTIA</Text>

        <Text style={styles.subtitle}>ANÁLISIS DE DATOS</Text>

        <Text style={styles.title}>Comparar equipos</Text>

        <Text style={styles.description}>
          Consulta las estadísticas históricas de dos selecciones
          utilizando los resultados almacenados en nuestra fuente de datos.
        </Text>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>PRIMER EQUIPO</Text>

          <TextInput
            style={styles.input}
            value={teamOne}
            onChangeText={setTeamOne}
            placeholder="Ejemplo: Colombia"
            placeholderTextColor="#77857B"
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>SEGUNDO EQUIPO</Text>

          <TextInput
            style={styles.input}
            value={teamTwo}
            onChangeText={setTeamTwo}
            placeholder="Ejemplo: Argentina"
            placeholderTextColor="#77857B"
            autoCapitalize="words"
          />

          <Pressable
            style={[styles.compareButton, loading && styles.disabledButton]}
            onPress={handleCompare}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#101914" />
            ) : (
              <Text style={styles.compareButtonText}>
                CONSULTAR ESTADÍSTICAS →
              </Text>
            )}
          </Pressable>
        </View>

        {error !== '' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {statsOne && statsTwo && (
          <>
            <Text style={styles.sectionTitle}>Resultados del análisis</Text>

            {renderStats(statsOne)}

            {renderStats(statsTwo)}

            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Estas estadísticas representan el historial completo
                disponible para cada equipo en la fuente de datos.
              </Text>
            </View>
          </>
        )}

        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← VOLVER AL INICIO</Text>
        </Pressable>
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
    paddingTop: 50,
    paddingBottom: 40,
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
    marginTop: 40,
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
    marginBottom: 25,
  },
  inputCard: {
    backgroundColor: '#1B2920',
    padding: 20,
    borderRadius: 18,
  },
  inputLabel: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 9,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#101914',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#344438',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
  },
  compareButton: {
    backgroundColor: '#B9F66A',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.6,
  },
  compareButtonText: {
    color: '#101914',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  errorCard: {
    backgroundColor: '#351D20',
    padding: 15,
    borderRadius: 12,
    marginTop: 18,
  },
  errorText: {
    color: '#FF8585',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 15,
  },
  statsCard: {
    backgroundColor: '#1B2920',
    padding: 20,
    borderRadius: 17,
    marginBottom: 16,
  },
  teamName: {
    color: '#B9F66A',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#26372B',
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    color: '#A4AEA7',
    fontSize: 11,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#344438',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
    gap: 10,
  },
  detailLabel: {
    color: '#A4AEA7',
    fontSize: 12,
    flex: 1,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  winRateContainer: {
    marginTop: 12,
  },
  winRateLabel: {
    color: '#A4AEA7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  winRateValue: {
    color: '#B9F66A',
    fontSize: 27,
    fontWeight: '900',
    marginVertical: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#101914',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#B9F66A',
    borderRadius: 10,
  },
  noteCard: {
    backgroundColor: '#26372B',
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },
  noteText: {
    color: '#A4AEA7',
    fontSize: 12,
    lineHeight: 19,
  },
  backButton: {
    padding: 17,
    alignItems: 'center',
    marginTop: 25,
  },
  backButtonText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
