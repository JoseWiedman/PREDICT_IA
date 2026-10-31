
import React, { useEffect, useMemo, useState } from 'react';
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
import { Match } from '../../domain/Match';
import { isNationalTeam } from '../../core/nationalTeams';
import {
  getTeamDisplayName,
  teamMatchesSearch,
} from '../../core/teamTranslations';

interface TeamStatsScreenProps {
  onBack: () => void;
}

export default function TeamStatsScreen({
  onBack,
}: TeamStatsScreenProps) {
  const [teamOne, setTeamOne] = useState('Colombia');
  const [teamTwo, setTeamTwo] = useState('Argentina');

  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const [statsOne, setStatsOne] = useState<TeamStats | null>(null);
  const [statsTwo, setStatsTwo] = useState<TeamStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAvailableTeams = async () => {
      try {
        const viewModel = new FootballViewModel();
        const matches: Match[] = await viewModel.loadMatches();

        const uniqueTeams = new Map<string, string>();

        matches.forEach((match) => {
          [match.homeTeam, match.awayTeam].forEach((team) => {
            if (team && isNationalTeam(team)) {
              const key = team.trim().toLowerCase();

              if (!uniqueTeams.has(key)) {
                uniqueTeams.set(key, team.trim());
              }
            }
          });
        });

        const sortedTeams = Array.from(uniqueTeams.values()).sort(
          (a, b) =>
            getTeamDisplayName(a).localeCompare(
              getTeamDisplayName(b),
              'es'
            )
        );

        setAvailableTeams(sortedTeams);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar las selecciones.'
        );
      } finally {
        setLoadingTeams(false);
      }
    };

    loadAvailableTeams();
  }, []);

  const selectedTeams = [teamOne, teamTwo];

  const filteredTeams = useMemo(() => {
    const otherSelectedTeam =
      activeTeamIndex === 0 ? teamTwo : teamOne;

    return availableTeams
      .filter((team) => {
        const isAlreadySelected =
          team.toLowerCase() === otherSelectedTeam.toLowerCase();

        return (
          !isAlreadySelected &&
          (!searchText.trim() ||
            teamMatchesSearch(team, searchText.trim()))
        );
      })
      .slice(0, 12);
  }, [availableTeams, searchText, activeTeamIndex, teamOne, teamTwo]);

  const openTeamSelector = (index: number) => {
    setActiveTeamIndex(index);
    setSearchText('');
    setError('');
  };

  const closeTeamSelector = () => {
    setActiveTeamIndex(null);
    setSearchText('');
  };

  const selectTeam = (team: string) => {
    if (activeTeamIndex === 0) {
      setTeamOne(team);
    } else if (activeTeamIndex === 1) {
      setTeamTwo(team);
    }

    setStatsOne(null);
    setStatsTwo(null);
    setError('');
    closeTeamSelector();
  };

  const handleCompare = async () => {
    if (!teamOne || !teamTwo) {
      setError('Debes seleccionar los dos equipos.');
      return;
    }

    if (teamOne.toLowerCase() === teamTwo.toLowerCase()) {
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
        viewModel.getTeamStats(teamOne),
        viewModel.getTeamStats(teamTwo),
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

  const renderTeamSelector = (
    label: string,
    team: string,
    index: number
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <Pressable
        style={styles.selectorButton}
        onPress={() => openTeamSelector(index)}
      >
        <View style={styles.selectorTextContainer}>
          <Text style={styles.selectedTeamName}>
            {team ? getTeamDisplayName(team) : 'Seleccionar selección'}
          </Text>
          <Text style={styles.selectorHint}>
            {team ? 'Selección seleccionada' : 'Elige un equipo'}
          </Text>
        </View>

        <Text style={styles.selectorArrow}>⌄</Text>
      </Pressable>
    </View>
  );

  const renderStats = (stats: TeamStats) => (
    <View style={styles.statsCard}>
      <Text style={styles.teamName}>
        {getTeamDisplayName(stats.team)}
      </Text>

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

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>PREDICTIA</Text>

        <Text style={styles.subtitle}>ANÁLISIS DE DATOS</Text>

        <Text style={styles.title}>Comparar equipos</Text>

        <Text style={styles.description}>
          Consulta y compara las estadísticas históricas de dos selecciones
          utilizando los resultados almacenados en nuestra fuente de datos.
        </Text>

        <View style={styles.inputCard}>
          {loadingTeams ? (
            <View style={styles.loadingTeamsContainer}>
              <ActivityIndicator color="#B9F66A" />
              <Text style={styles.loadingTeamsText}>
                Cargando selecciones disponibles...
              </Text>
            </View>
          ) : (
            <>
              {renderTeamSelector('PRIMER EQUIPO', teamOne, 0)}

              {renderTeamSelector('SEGUNDO EQUIPO', teamTwo, 1)}

              <Pressable
                style={[
                  styles.compareButton,
                  (loading || !availableTeams.length) &&
                    styles.disabledButton,
                ]}
                onPress={handleCompare}
                disabled={loading || !availableTeams.length}
              >
                {loading ? (
                  <ActivityIndicator color="#101914" />
                ) : (
                  <Text style={styles.compareButtonText}>
                    CONSULTAR ESTADÍSTICAS →
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        {activeTeamIndex !== null && (
          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                {activeTeamIndex === 0
                  ? 'Seleccionar primer equipo'
                  : 'Seleccionar segundo equipo'}
              </Text>

              <Pressable onPress={closeTeamSelector}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar selección..."
              placeholderTextColor="#77857B"
              autoCapitalize="words"
              autoFocus
            />

            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <Pressable
                  key={team}
                  style={styles.teamOption}
                  onPress={() => selectTeam(team)}
                >
                  <Text style={styles.teamOptionName}>
                    {getTeamDisplayName(team)}
                  </Text>
                  <Text style={styles.teamOptionArrow}>›</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyResults}>
                No se encontraron selecciones.
              </Text>
            )}

            <Text style={styles.dropdownFooter}>
              Se muestran máximo 12 resultados.
            </Text>
          </View>
        )}

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
  selectorContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 9,
    marginTop: 12,
  },
  selectorButton: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#344438',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectedTeamName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  selectorHint: {
    color: '#77857B',
    fontSize: 10,
    marginTop: 5,
  },
  selectorArrow: {
    color: '#B9F66A',
    fontSize: 24,
    marginLeft: 10,
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
  loadingTeamsContainer: {
    alignItems: 'center',
    padding: 25,
  },
  loadingTeamsText: {
    color: '#A4AEA7',
    fontSize: 12,
    marginTop: 12,
  },
  dropdownCard: {
    backgroundColor: '#1B2920',
    padding: 17,
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#344438',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dropdownTitle: {
    color: '#B9F66A',
    fontSize: 13,
    fontWeight: '900',
  },
  closeButton: {
    color: '#A4AEA7',
    fontSize: 18,
    paddingHorizontal: 5,
  },
  searchInput: {
    backgroundColor: '#101914',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#344438',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    marginBottom: 10,
  },
  teamOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#344438',
  },
  teamOptionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  teamOptionArrow: {
    color: '#B9F66A',
    fontSize: 21,
  },
  emptyResults: {
    color: '#A4AEA7',
    fontSize: 12,
    textAlign: 'center',
    padding: 18,
  },
  dropdownFooter: {
    color: '#77857B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
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
