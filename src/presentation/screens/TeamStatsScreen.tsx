
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
  useWindowDimensions,
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
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const horizontalSpace = isMobile ? 18 : isTablet ? 32 : 45;
  const titleSize = isMobile ? 27 : isTablet ? 32 : 36;

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
    let isMounted = true;

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

        if (isMounted) {
          setAvailableTeams(sortedTeams);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No fue posible cargar las selecciones.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingTeams(false);
        }
      }
    };

    loadAvailableTeams();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <Text style={styles.selectedTeamName} numberOfLines={1}>
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
    <View
      style={[
        styles.statsCard,
        {
          maxWidth: isMobile ? 650 : 480,
          padding: isMobile ? 17 : 22,
        },
      ]}
    >
      <Text style={styles.teamName}>
        {getTeamDisplayName(stats.team)}
      </Text>

      <View style={styles.statsGrid}>
        {[
          { value: stats.played, label: 'Jugados' },
          { value: stats.wins, label: 'Victorias' },
          { value: stats.draws, label: 'Empates' },
          { value: stats.losses, label: 'Derrotas' },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.statItem,
              {
                width: isMobile ? '48%' : '48%',
              },
            ]}
          >
            <Text style={styles.statNumber}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
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
        <View style={styles.winRateHeader}>
          <Text style={styles.winRateLabel}>
            PORCENTAJE DE VICTORIAS
          </Text>

          <Text style={styles.winRateValue}>
            {stats.winRate}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(stats.winRate, 100))}%` },
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
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalSpace,
            paddingTop: isMobile ? 30 : 45,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <Text style={styles.brand}>PREDICTIA</Text>

          <Text style={styles.subtitle}>ANÁLISIS DE DATOS</Text>

          <Text style={[styles.title, { fontSize: titleSize }]}>
            Comparar equipos
          </Text>

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
                autoCorrect={false}
                autoFocus
              />

              <ScrollView
                style={styles.optionsList}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
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
              </ScrollView>

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
              <Text style={styles.sectionTitle}>
                Resultados del análisis
              </Text>

              <View
                style={[
                  styles.resultsContainer,
                  {
                    flexDirection: isMobile ? 'column' : 'row',
                  },
                ]}
              >
                {renderStats(statsOne)}
                {renderStats(statsTwo)}
              </View>

              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  Estas estadísticas representan el historial completo
                  disponible para cada equipo en la fuente de datos.
                </Text>
              </View>
            </>
          )}

          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              ← VOLVER AL INICIO
            </Text>
          </Pressable>
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
    maxWidth: 1100,
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
    marginBottom: 25,
    maxWidth: 750,
  },
  inputCard: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    backgroundColor: '#1B2920',
    padding: 20,
    borderRadius: 18,
  },
  selectorContainer: {
    marginBottom: 12,
    minWidth: 0,
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
    gap: 10,
  },
  selectorTextContainer: {
    flex: 1,
    minWidth: 0,
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
    minHeight: 52,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  compareButtonText: {
    color: '#101914',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  loadingTeamsContainer: {
    alignItems: 'center',
    padding: 25,
  },
  loadingTeamsText: {
    color: '#A4AEA7',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
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
    gap: 10,
  },
  dropdownTitle: {
    color: '#B9F66A',
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
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
  optionsList: {
    maxHeight: 300,
  },
  teamOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#344438',
    gap: 10,
  },
  teamOptionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
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
  resultsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
  },
  statsCard: {
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#1B2920',
    borderRadius: 17,
    marginBottom: 16,
    minWidth: 0,
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
    alignItems: 'center',
    marginBottom: 13,
    gap: 10,
  },
  detailLabel: {
    color: '#A4AEA7',
    fontSize: 12,
    flex: 1,
    flexShrink: 1,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  winRateContainer: {
    marginTop: 12,
  },
  winRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  winRateLabel: {
    color: '#A4AEA7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  winRateValue: {
    color: '#B9F66A',
    fontSize: 27,
    fontWeight: '900',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#101914',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#B9F66A',
    borderRadius: 10,
  },
  noteCard: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
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
