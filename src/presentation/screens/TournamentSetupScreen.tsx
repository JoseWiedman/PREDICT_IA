
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { FootballViewModel } from '../viewmodels/FootballViewModel';
import {
  getTeamDisplayName,
  teamMatchesSearch,
} from '../../core/teamTranslations';
import { isNationalTeam } from '../../core/nationalTeams';

import type { TournamentRound } from '../../domain/TournamentMatch';

interface TournamentSetupScreenProps {
  onBack: () => void;
  onStartTournament: (
    tournamentName: string,
    teams: string[],
    startingRound: TournamentRound
  ) => void;
}

const ROUND_OPTIONS: {
  value: TournamentRound;
  label: string;
  teamCount: number;
  matchCount: number;
}[] = [
  { value: 'DIECISEISAVOS', label: 'Dieciseisavos', teamCount: 32, matchCount: 16 },
  { value: 'OCTAVOS', label: 'Octavos', teamCount: 16, matchCount: 8 },
  { value: 'CUARTOS', label: 'Cuartos', teamCount: 8, matchCount: 4 },
  { value: 'SEMIFINALES', label: 'Semifinales', teamCount: 4, matchCount: 2 },
  { value: 'FINAL', label: 'Final', teamCount: 2, matchCount: 1 },
];

export default function TournamentSetupScreen({
  onBack,
  onStartTournament,
}: TournamentSetupScreenProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const horizontalSpace = isMobile ? 16 : isTablet ? 28 : 40;
  const titleSize = isMobile ? 29 : isTablet ? 36 : 40;
  const cardPadding = isMobile ? 15 : isTablet ? 19 : 22;
  const contentMaxWidth = 1100;

  const [tournamentName, setTournamentName] = useState(
    'Mi torneo PredictFutbolIA'
  );

  const [startingRound, setStartingRound] =
    useState<TournamentRound>('DIECISEISAVOS');

  const selectedRound = ROUND_OPTIONS.find(
    (round) => round.value === startingRound
  )!;

  const [teams, setTeams] = useState<string[]>(Array(32).fill(''));
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [dataError, setDataError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAvailableTeams = async () => {
      try {
        setIsLoadingTeams(true);
        setDataError('');

        const viewModel = new FootballViewModel();
        const matches = await viewModel.loadMatches();

        const uniqueTeams = new Map<string, string>();

        matches.forEach((match) => {
          const homeTeam = match.homeTeam.trim();
          const awayTeam = match.awayTeam.trim();

          if (homeTeam && isNationalTeam(homeTeam)) {
            uniqueTeams.set(homeTeam.toLowerCase(), homeTeam);
          }

          if (awayTeam && isNationalTeam(awayTeam)) {
            uniqueTeams.set(awayTeam.toLowerCase(), awayTeam);
          }
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

          if (sortedTeams.length < 2) {
            setDataError(
              'No se encontraron suficientes selecciones nacionales en la base histórica.'
            );
          }
        }
      } catch (error) {
        if (isMounted) {
          setDataError(
            error instanceof Error
              ? error.message
              : 'No fue posible cargar los equipos.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingTeams(false);
        }
      }
    };

    loadAvailableTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoundChange = (round: TournamentRound) => {
    const option = ROUND_OPTIONS.find(
      (item) => item.value === round
    );

    if (!option) return;

    setStartingRound(round);
    setTeams(Array(option.teamCount).fill(''));
    setActiveTeamIndex(null);
    setSearchText('');
    setErrorMessage('');
  };

  const updateTeam = (index: number, originalName: string) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = originalName;

    setTeams(updatedTeams);
    setErrorMessage('');
    setActiveTeamIndex(null);
    setSearchText('');
  };

  const openTeamSelector = (index: number) => {
    if (isLoadingTeams || availableTeams.length === 0) return;

    if (activeTeamIndex === index) {
      setActiveTeamIndex(null);
      setSearchText('');
      return;
    }

    setActiveTeamIndex(index);
    setSearchText('');
    setErrorMessage('');
  };

  const filteredTeams = availableTeams
    .filter((team) => teamMatchesSearch(team, searchText))
    .filter((team) => {
      const alreadySelected = teams.some(
        (selectedTeam, index) =>
          index !== activeTeamIndex &&
          selectedTeam.toLowerCase() === team.toLowerCase()
      );

      return !alreadySelected;
    })
    .slice(0, 12);

  const handleContinue = () => {
    if (!tournamentName.trim()) {
      setErrorMessage('Ingresa un nombre para el torneo.');
      return;
    }

    if (isLoadingTeams || availableTeams.length === 0) {
      setErrorMessage(
        'Espera a que se carguen las selecciones disponibles.'
      );
      return;
    }

    if (teams.some((team) => !team.trim())) {
      setErrorMessage(
        `Debes seleccionar las ${selectedRound.teamCount} selecciones antes de continuar.`
      );
      return;
    }

    const selectedTeams = teams.map((team) => team.trim());
    const normalizedTeams = selectedTeams.map((team) =>
      team.toLowerCase()
    );

    if (new Set(normalizedTeams).size !== selectedRound.teamCount) {
      setErrorMessage(
        'Hay equipos repetidos. Cada selección debe ser diferente.'
      );
      return;
    }

    const invalidTeams = selectedTeams.filter(
      (team) => !isNationalTeam(team)
    );

    if (invalidTeams.length > 0) {
      setErrorMessage(
        `Solo se permiten selecciones nacionales. Equipos no válidos: ${invalidTeams.join(', ')}.`
      );
      return;
    }

    onStartTournament(
      tournamentName.trim(),
      selectedTeams,
      startingRound
    );
  };

  const registeredTeams = teams.filter(
    (team) => team.trim() !== ''
  ).length;

  const progressPercentage =
    (registeredTeams / selectedRound.teamCount) * 100;

  const renderTeamSelector = (index: number, label: string) => {
    const isActive = activeTeamIndex === index;
    const selectedTeam = teams[index];

    return (
      <View style={styles.teamInputContainer}>
        <Text style={styles.teamLabel}>{label}</Text>

        <TouchableOpacity
          style={[
            styles.teamSelector,
            isActive && styles.teamSelectorActive,
          ]}
          onPress={() => openTeamSelector(index)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.teamSelectorText,
              !selectedTeam && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedTeam
              ? getTeamDisplayName(selectedTeam)
              : 'Seleccionar selección...'}
          </Text>

          <Text style={styles.dropdownArrow}>
            {isActive ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {isActive && (
          <View style={styles.dropdownContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar país en español o inglés..."
              placeholderTextColor="#68756C"
              autoCapitalize="none"
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
                  <TouchableOpacity
                    key={team}
                    style={styles.optionItem}
                    onPress={() => updateTeam(index, team)}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionText}>
                        {getTeamDisplayName(team)}
                      </Text>

                      {getTeamDisplayName(team) !== team && (
                        <Text style={styles.originalName}>
                          {team}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.optionArrow}>+</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResults}>
                  No se encontraron selecciones nacionales.
                </Text>
              )}
            </ScrollView>

            <Text style={styles.dropdownHint}>
              Solo se muestran países y selecciones nacionales.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: horizontalSpace,
          paddingTop: isMobile ? 18 : 28,
          paddingBottom: isMobile ? 35 : 50,
          alignItems: 'center',
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.header,
            { marginBottom: isMobile ? 22 : 30 },
          ]}
        >
          <Text style={styles.brand}>PREDICTIA</Text>
          <Text style={styles.subtitle}>PREDICCIÓN DE TORNEOS</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: titleSize }]}>
            Crear torneo
          </Text>

          <Text style={styles.description}>
            Elige la fase en la que deseas comenzar y selecciona
            los países que participarán.
          </Text>
        </View>

        {/* FASE INICIAL */}
        <View
          style={[
            styles.formCard,
            {
              padding: cardPadding,
              maxWidth: 950,
              alignSelf: 'center',
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            FASE INICIAL DEL TORNEO
          </Text>

          <Text style={styles.phaseDescription}>
            Puedes comenzar desde cualquiera de las cinco fases.
          </Text>

          <View style={styles.roundOptions}>
            {ROUND_OPTIONS.map((round) => {
              const isSelected = startingRound === round.value;

              return (
                <TouchableOpacity
                  key={round.value}
                  style={[
                    styles.roundOption,
                    {
                      width: isMobile ? '100%' : isTablet ? '48%' : '19%',
                    },
                    isSelected && styles.roundOptionSelected,
                  ]}
                  onPress={() => handleRoundChange(round.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roundOptionText,
                      isSelected && styles.roundOptionTextSelected,
                    ]}
                  >
                    {round.label}
                  </Text>

                  <Text
                    style={[
                      styles.roundOptionCount,
                      isSelected && styles.roundOptionCountSelected,
                    ]}
                  >
                    {round.teamCount} selecciones
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.phaseInfo}>
            <Text style={styles.phaseInfoText}>
              {selectedRound.teamCount} selecciones ·{' '}
              {selectedRound.matchCount} enfrentamientos
            </Text>
          </View>
        </View>

        {/* PROGRESO */}
        <View
          style={[
            styles.progressCard,
            {
              padding: cardPadding,
              maxWidth: 950,
              alignSelf: 'center',
            },
          ]}
        >
          <Text style={styles.progressLabel}>
            SELECCIONES REGISTRADAS
          </Text>

          <Text style={styles.progressNumber}>
            {registeredTeams}/{selectedRound.teamCount}
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>

          <Text style={styles.availableText}>
            {availableTeams.length > 0
              ? `${availableTeams.length} selecciones nacionales disponibles`
              : 'Consultando selecciones disponibles...'}
          </Text>
        </View>

        {isLoadingTeams && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#B9F66A" />
            <Text style={styles.loadingText}>
              Cargando selecciones desde la base de datos...
            </Text>
          </View>
        )}

        {dataError !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{dataError}</Text>
          </View>
        )}

        {/* INFORMACIÓN DEL TORNEO */}
        <View
          style={[
            styles.formCard,
            {
              padding: cardPadding,
              maxWidth: 950,
              alignSelf: 'center',
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            INFORMACIÓN DEL TORNEO
          </Text>

          <Text style={styles.inputLabel}>NOMBRE DEL TORNEO</Text>

          <TextInput
            style={styles.input}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Ej. Mundial de fútbol"
            placeholderTextColor="#68756C"
          />
        </View>

        {/* ENFRENTAMIENTOS */}
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedRound.label.toUpperCase()}
          </Text>

          <Text style={styles.matchesDescription}>
            Selecciona los dos países de cada enfrentamiento.
          </Text>
        </View>

        <View style={styles.matchesGrid}>
          {Array.from(
            { length: selectedRound.matchCount },
            (_, index) => (
              <View
                key={`${startingRound}-${index}`}
                style={[
                  styles.matchCard,
                  {
                    padding: cardPadding,
                    width: isMobile ? '100%' : isTablet ? '100%' : '48.5%',
                  },
                ]}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchNumber}>
                    ENFRENTAMIENTO {index + 1}
                  </Text>

                  <Text style={styles.matchStatus}>
                    PARTIDO {index + 1}/{selectedRound.matchCount}
                  </Text>
                </View>

                {renderTeamSelector(index * 2, 'SELECCIÓN A')}

                <View style={styles.vsContainer}>
                  <View style={styles.vsLine} />
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.vsLine} />
                </View>

                {renderTeamSelector(index * 2 + 1, 'SELECCIÓN B')}
              </View>
            )
          )}
        </View>

        {errorMessage !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              width: '100%',
              maxWidth: 650,
              alignSelf: 'center',
            },
            (isLoadingTeams ||
              availableTeams.length < selectedRound.teamCount) &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={
            isLoadingTeams ||
            availableTeams.length < selectedRound.teamCount
          }
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            CONTINUAR AL TORNEO →
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          PredictFutbolIA · Modelo de simulación Monte Carlo
        </Text>
      </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  backText: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginBottom: 30,
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
    fontSize: 31,
    fontWeight: '900',
  },
  description: {
    color: '#9AA79D',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  progressCard: {
    backgroundColor: '#19251E',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A3A2E',
    marginBottom: 20,
    width: '100%',
  },
  progressLabel: {
    color: '#A8B5AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressNumber: {
    color: '#B9F66A',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 12,
  },
  progressBackground: {
    height: 7,
    backgroundColor: '#101914',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B9F66A',
    borderRadius: 10,
  },
  availableText: {
    color: '#829087',
    fontSize: 10,
    marginTop: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#19251E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 18,
  },
  loadingText: {
    color: '#A8B5AA',
    fontSize: 12,
    flexShrink: 1,
  },
  formCard: {
    backgroundColor: '#19251E',
    borderRadius: 15,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A3A2E',
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  phaseDescription: {
    color: '#9AA79D',
    fontSize: 12,
    marginTop: 9,
    marginBottom: 15,
    lineHeight: 18,
  },
  roundOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
  },
  roundOption: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#354439',
    borderRadius: 9,
    padding: 13,
    flexGrow: 1,
  },
  roundOptionSelected: {
    borderColor: '#B9F66A',
    backgroundColor: '#263522',
  },
  roundOptionText: {
    color: '#F0F5EF',
    fontSize: 13,
    fontWeight: '800',
  },
  roundOptionTextSelected: {
    color: '#B9F66A',
  },
  roundOptionCount: {
    color: '#829087',
    fontSize: 10,
    marginTop: 4,
  },
  roundOptionCountSelected: {
    color: '#C5D5B7',
  },
  phaseInfo: {
    backgroundColor: '#101914',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  phaseInfoText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  inputLabel: {
    color: '#A8B5AA',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#354439',
    borderRadius: 9,
    padding: 14,
    color: '#F0F5EF',
    fontSize: 14,
    width: '100%',
    minWidth: 0,
  },
  matchesHeader: {
    marginBottom: 18,
    marginTop: 8,
  },
  matchesDescription: {
    color: '#9AA79D',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  matchesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#19251E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A3A2E',
    padding: 17,
    marginBottom: 4,
    minWidth: 0,
  },
  matchHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
    gap: 8,
  },
  matchNumber: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  matchStatus: {
    color: '#829087',
    fontSize: 9,
    fontWeight: '700',
  },
  teamInputContainer: {
    gap: 8,
    width: '100%',
    minWidth: 0,
  },
  teamLabel: {
    color: '#A8B5AA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  teamSelector: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#354439',
    borderRadius: 9,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    width: '100%',
  },
  teamSelectorActive: {
    borderColor: '#B9F66A',
  },
  teamSelectorText: {
    color: '#F0F5EF',
    fontSize: 14,
    flex: 1,
    minWidth: 0,
  },
  placeholderText: {
    color: '#68756C',
  },
  dropdownArrow: {
    color: '#B9F66A',
    fontSize: 11,
  },
  dropdownContainer: {
    backgroundColor: '#101914',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 9,
    padding: 10,
    marginTop: 4,
    width: '100%',
    minWidth: 0,
  },
  searchInput: {
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#354439',
    borderRadius: 8,
    padding: 12,
    color: '#F0F5EF',
    fontSize: 13,
    marginBottom: 8,
    minWidth: 0,
    width: '100%',
  },
  optionsList: {
    maxHeight: 220,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#26352A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  optionText: {
    color: '#F0F5EF',
    fontSize: 13,
  },
  originalName: {
    color: '#829087',
    fontSize: 10,
    marginTop: 3,
  },
  optionArrow: {
    color: '#B9F66A',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
  noResults: {
    color: '#9AA79D',
    fontSize: 12,
    padding: 12,
    textAlign: 'center',
  },
  dropdownHint: {
    color: '#68756C',
    fontSize: 9,
    marginTop: 8,
    lineHeight: 14,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#354439',
  },
  vsText: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '900',
  },
  errorContainer: {
    backgroundColor: '#3B2020',
    borderWidth: 1,
    borderColor: '#713B3B',
    borderRadius: 10,
    padding: 14,
    marginTop: 15,
    width: '100%',
  },
  errorText: {
    color: '#FF9999',
    fontSize: 13,
    lineHeight: 19,
  },
  continueButton: {
    backgroundColor: '#B9F66A',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: '#101914',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  footer: {
    color: '#68756C',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 25,
    lineHeight: 16,
  },
});
