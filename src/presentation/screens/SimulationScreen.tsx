
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FootballViewModel } from '../viewmodels/FootballViewModel';
import { SimulationResult } from '../../domain/SimulationResult';

interface SimulationScreenProps {
  onBack: () => void;
}

export default function SimulationScreen({
  onBack,
}: SimulationScreenProps) {
  const [teamA, setTeamA] = useState('Colombia');
  const [teamB, setTeamB] = useState('Argentina');

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [viewModel] = useState(() => new FootballViewModel());

  const handleSimulation = async () => {
    if (!teamA.trim() || !teamB.trim()) {
      setErrorMessage('Debes ingresar los nombres de los dos equipos.');
      setResult(null);
      return;
    }

    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      setErrorMessage('Debes seleccionar dos equipos diferentes.');
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      const simulationResult = await viewModel.simulateMatch(
        teamA.trim(),
        teamB.trim()
      );

      setResult(simulationResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al realizar la simulación.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProbability = (
    label: string,
    percentage: number,
    color: string
  ) => {
    const percentageValue = percentage * 100;

    return (
      <View style={styles.probabilityItem}>
        <View style={styles.probabilityHeader}>
          <Text style={styles.probabilityLabel}>{label}</Text>
          <Text style={styles.probabilityValue}>
            {percentageValue.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, percentageValue)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.brand}>PREDICTIA</Text>
        <Text style={styles.subtitle}>MODELO DE PREDICCIÓN</Text>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Simulación</Text>
        <Text style={styles.description}>
          Analiza un enfrentamiento utilizando datos históricos y
          simulaciones probabilísticas.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>CONFIGURAR ENFRENTAMIENTO</Text>

        <Text style={styles.inputLabel}>EQUIPO LOCAL / A</Text>
        <TextInput
          style={styles.input}
          value={teamA}
          onChangeText={setTeamA}
          placeholder="Ej. Colombia"
          placeholderTextColor="#68756C"
          autoCapitalize="words"
        />

        <View style={styles.vsContainer}>
          <View style={styles.vsLine} />
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.vsLine} />
        </View>

        <Text style={styles.inputLabel}>EQUIPO VISITANTE / B</Text>
        <TextInput
          style={styles.input}
          value={teamB}
          onChangeText={setTeamB}
          placeholder="Ej. Argentina"
          placeholderTextColor="#68756C"
          autoCapitalize="words"
        />

        <View style={styles.iterationsContainer}>
          <Text style={styles.iterationsLabel}>SIMULACIONES</Text>
          <Text style={styles.iterationsValue}>1.000</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.simulateButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSimulation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#101914" />
          ) : (
            <Text style={styles.simulateButtonText}>
              EJECUTAR SIMULACIÓN →
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {errorMessage !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B9F66A" />
          <Text style={styles.loadingText}>
            Analizando datos y ejecutando simulaciones...
          </Text>
        </View>
      )}

      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>RESULTADOS DEL MODELO</Text>

          <View style={styles.resultCard}>
            <Text style={styles.cardSubtitle}>ENFRENTAMIENTO</Text>

            <View style={styles.teamsRow}>
              <Text style={styles.teamName}>{result.teamA}</Text>
              <Text style={styles.teamVs}>VS</Text>
              <Text style={styles.teamName}>{result.teamB}</Text>
            </View>

            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {result.expectedGoalsA.toFixed(2)}
              </Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.score}>
                {result.expectedGoalsB.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.scoreDescription}>
              Goles esperados del modelo
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.cardSubtitle}>
              PROBABILIDADES DE RESULTADO
            </Text>

            {renderProbability(
              `Victoria ${result.teamA}`,
              result.teamAProbability,
              '#B9F66A'
            )}

            {renderProbability(
              'Empate',
              result.drawProbability,
              '#F4C96B'
            )}

            {renderProbability(
              `Victoria ${result.teamB}`,
              result.teamBProbability,
              '#72B7F2'
            )}

            <Text style={styles.simulationCount}>
              Basado en {result.iterations.toLocaleString('es-CO')} simulaciones
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.cardSubtitle}>MARCADOR MÁS FRECUENTE</Text>

            <Text style={styles.frequentScore}>
              {result.mostFrequentScore}
            </Text>

            <Text style={styles.scoreDescription}>
              Resultado que más se repitió durante las simulaciones.
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.cardSubtitle}>RESUMEN DE SIMULACIONES</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Victorias {result.teamA}
              </Text>
              <Text style={styles.summaryValue}>
                {result.teamAWins.toLocaleString('es-CO')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Empates</Text>
              <Text style={styles.summaryValue}>
                {result.draws.toLocaleString('es-CO')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Victorias {result.teamB}
              </Text>
              <Text style={styles.summaryValue}>
                {result.teamBWins.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Estos resultados son estimaciones estadísticas basadas en
            los datos históricos disponibles. No representan una garantía
            del resultado real de un partido.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  content: {
    padding: 22,
    paddingBottom: 45,
  },
  header: {
    marginBottom: 35,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: '#B9F66A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#829087',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 5,
  },
  titleContainer: {
    marginBottom: 25,
  },
  title: {
    color: '#F0F5EF',
    fontSize: 32,
    fontWeight: '800',
  },
  description: {
    color: '#9AA79D',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: '#19251E',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3A2E',
  },
  sectionTitle: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 25,
  },
  inputLabel: {
    color: '#A8B5AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#354439',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#F0F5EF',
    fontSize: 15,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#354439',
  },
  vsText: {
    color: '#B9F66A',
    fontWeight: '900',
    fontSize: 12,
  },
  iterationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  iterationsLabel: {
    color: '#A8B5AA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iterationsValue: {
    color: '#B9F66A',
    fontSize: 19,
    fontWeight: '900',
  },
  simulateButton: {
    backgroundColor: '#B9F66A',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  simulateButtonText: {
    color: '#101914',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#3B2020',
    borderColor: '#713B3B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 18,
  },
  errorText: {
    color: '#FF9999',
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 35,
    gap: 14,
  },
  loadingText: {
    color: '#A8B5AA',
    fontSize: 13,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 35,
    gap: 16,
  },
  resultsTitle: {
    color: '#B9F66A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  resultCard: {
    backgroundColor: '#19251E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3A2E',
  },
  cardSubtitle: {
    color: '#829087',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 20,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    color: '#F0F5EF',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  teamVs: {
    color: '#829087',
    fontSize: 11,
    fontWeight: '800',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
    marginTop: 25,
  },
  score: {
    color: '#B9F66A',
    fontSize: 38,
    fontWeight: '900',
  },
  scoreSeparator: {
    color: '#829087',
    fontSize: 25,
  },
  scoreDescription: {
    color: '#829087',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
  },
  probabilityItem: {
    marginBottom: 20,
  },
  probabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
    gap: 10,
  },
  probabilityLabel: {
    color: '#DCE5DD',
    fontSize: 12,
    flex: 1,
  },
  probabilityValue: {
    color: '#F0F5EF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBackground: {
    height: 9,
    backgroundColor: '#101914',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  simulationCount: {
    color: '#829087',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },
  frequentScore: {
    color: '#B9F66A',
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A2E',
    gap: 10,
  },
  summaryLabel: {
    color: '#C6D0C8',
    fontSize: 12,
    flex: 1,
  },
  summaryValue: {
    color: '#B9F66A',
    fontSize: 13,
    fontWeight: '800',
  },
  disclaimer: {
    color: '#829087',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
});
