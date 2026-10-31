
import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import type {
  TournamentBracket,
  TournamentMatch,
  TournamentRound,
} from '../../domain/TournamentMatch';

import { getTeamDisplayName } from '../../core/teamTranslations';

interface TournamentResultsScreenProps {
  tournament: TournamentBracket;
  onBack: () => void;
  onContinueTournament: (throughRound: TournamentRound) => void;
}

const CARD_WIDTH = 150;
const CARD_HEIGHT = 58;
const BRACKET_HEIGHT = 900;

const ROUND_NAMES: Record<TournamentRound, string> = {
  DIECISEISAVOS: 'Dieciseisavos',
  OCTAVOS: 'Octavos',
  CUARTOS: 'Cuartos',
  SEMIFINALES: 'Semifinales',
  FINAL: 'Final',
};

const ROUND_ORDER: TournamentRound[] = [
  'DIECISEISAVOS',
  'OCTAVOS',
  'CUARTOS',
  'SEMIFINALES',
  'FINAL',
];

const MATCH_CENTERS = {
  first: Array.from({ length: 8 }, (_, i) => 45 + i * 115),
  second: Array.from({ length: 4 }, (_, i) => 102.5 + i * 230),
  third: Array.from({ length: 2 }, (_, i) => 217.5 + i * 460),
  semi: [447.5],
  final: [447.5],
};

export default function TournamentResultsScreen({
  tournament,
  onBack,
  onContinueTournament,
}: TournamentResultsScreenProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const horizontalSpace = isMobile ? 18 : isTablet ? 32 : 45;
  const titleSize = isMobile ? 25 : isTablet ? 30 : 34;
  const cardPadding = isMobile ? 14 : 20;
  const contentMaxWidth = 1150;

  const getMatches = (round: TournamentRound) =>
    tournament.matches.filter((match) => match.round === round);

  // Determinar la fase inicial del torneo.
  const startingRoundIndex = ROUND_ORDER.indexOf(
    tournament.startingRound ?? 'DIECISEISAVOS'
  );

  // Identificar las fases que ya finalizaron.
  const completedRounds = ROUND_ORDER
    .map((round, index) => ({
      round,
      index,
      matches: getMatches(round),
    }))
    .filter(
      (item) =>
        item.index >= startingRoundIndex &&
        item.matches.length ===
          (16 / Math.pow(2, item.index)) &&
        item.matches.every(
          (match) =>
            match.status === 'SIMULADO' &&
            match.winner !== null &&
            match.scoreA !== null &&
            match.scoreB !== null
        )
    );

  const lastCompletedRoundIndex =
    completedRounds.length > 0
      ? Math.max(...completedRounds.map((item) => item.index))
      : startingRoundIndex - 1;

  // Identificar la siguiente fase pendiente.
  const nextRoundIndex = lastCompletedRoundIndex + 1;

  const nextRound =
    nextRoundIndex < ROUND_ORDER.length
      ? ROUND_ORDER[nextRoundIndex]
      : null;

  const phasesCompleted = completedRounds.length;
  const totalPhases = ROUND_ORDER.length - startingRoundIndex;

  const firstRound = getMatches('DIECISEISAVOS');
  const secondRound = getMatches('OCTAVOS');
  const quarterFinals = getMatches('CUARTOS');
  const semiFinals = getMatches('SEMIFINALES');
  const finalMatches = getMatches('FINAL');

  const leftFirst = firstRound.slice(0, 8);
  const rightFirst = firstRound.slice(8, 16).reverse();

  const leftSecond = secondRound.slice(0, 4);
  const rightSecond = secondRound.slice(4, 8).reverse();

  const leftQuarter = quarterFinals.slice(0, 2);
  const rightQuarter = quarterFinals.slice(2, 4).reverse();

  const leftSemi = semiFinals.slice(0, 1);
  const rightSemi = semiFinals.slice(1, 2);

  const finalMatch = finalMatches[0];

  const renderBracketMatch = (
    match: TournamentMatch,
    left: number,
    center: number
  ) => {
    const teamAWon = match.winner === match.teamA;
    const teamBWon = match.winner === match.teamB;

    return (
      <View
        key={match.id}
        style={[
          styles.bracketMatch,
          {
            position: 'absolute',
            left,
            top: center - CARD_HEIGHT / 2,
          },
        ]}
      >
        <View style={styles.bracketTeamRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.bracketTeamName,
              teamAWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(match.teamA)}
          </Text>

          <Text
            style={[
              styles.bracketScore,
              teamAWon && styles.bracketWinner,
            ]}
          >
            {match.scoreA ?? '-'}
          </Text>
        </View>

        <View style={styles.bracketSeparator} />

        <View style={styles.bracketTeamRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.bracketTeamName,
              teamBWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(match.teamB)}
          </Text>

          <Text
            style={[
              styles.bracketScore,
              teamBWon && styles.bracketWinner,
            ]}
          >
            {match.scoreB ?? '-'}
          </Text>
        </View>
      </View>
    );
  };

  const renderConnections = (
    fromX: number,
    toX: number,
    fromCenters: number[],
    toCenters: number[],
    direction: 'left' | 'right'
  ) => {
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < toCenters.length; i++) {
      const centerA = fromCenters[i * 2];
      const centerB = fromCenters[i * 2 + 1];
      const nextCenter = toCenters[i];

      if (
        centerA === undefined ||
        centerB === undefined ||
        nextCenter === undefined
      ) {
        continue;
      }

      const startX =
        direction === 'left'
          ? fromX + CARD_WIDTH
          : fromX;

      const endX =
        direction === 'left'
          ? toX
          : toX + CARD_WIDTH;

      const junctionX = (startX + endX) / 2;
      const minY = Math.min(centerA, centerB);
      const maxY = Math.max(centerA, centerB);

      segments.push(
        <View
          key={`h1-${i}`}
          style={[
            styles.connector,
            {
              left: Math.min(startX, junctionX),
              top: centerA,
              width: Math.abs(junctionX - startX),
            },
          ]}
        />
      );

      segments.push(
        <View
          key={`v-${i}`}
          style={[
            styles.connectorVertical,
            {
              left: junctionX,
              top: minY,
              height: maxY - minY,
            },
          ]}
        />
      );

      segments.push(
        <View
          key={`h2-${i}`}
          style={[
            styles.connector,
            {
              left: Math.min(junctionX, endX),
              top: nextCenter,
              width: Math.abs(endX - junctionX),
            },
          ]}
        />
      );
    }

    return segments;
  };

  const renderBracketColumn = (
    matches: TournamentMatch[],
    left: number,
    centers: number[]
  ) =>
    matches.map((match, index) => {
      const center = centers[index];

      if (center === undefined) return null;

      return renderBracketMatch(match, left, center);
    });

  const renderFinal = () => {
    if (!finalMatch) return null;

    const teamAWon = finalMatch.winner === finalMatch.teamA;
    const teamBWon = finalMatch.winner === finalMatch.teamB;

    return (
      <View style={styles.finalContainer}>
        <Text style={styles.finalLabel}>GRAN FINAL</Text>

        <View style={styles.finalCard}>
          <Text
            numberOfLines={1}
            style={[
              styles.finalTeam,
              teamAWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(finalMatch.teamA)}
          </Text>

          <Text style={styles.finalScore}>
            {finalMatch.scoreA ?? '-'}
          </Text>

          <View style={styles.bracketSeparator} />

          <Text
            numberOfLines={1}
            style={[
              styles.finalTeam,
              teamBWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(finalMatch.teamB)}
          </Text>

          <Text style={styles.finalScore}>
            {finalMatch.scoreB ?? '-'}
          </Text>
        </View>

        <Text style={styles.finalTrophy}>🏆</Text>

        <Text style={styles.finalChampion}>
          {tournament.champion
            ? getTeamDisplayName(tournament.champion)
            : 'Por definir'}
        </Text>

        <Text style={styles.finalChampionLabel}>
          CAMPEÓN PROYECTADO
        </Text>
      </View>
    );
  };

  const renderProbabilityCard = (match: TournamentMatch) => {
    const probabilityA = (match.probabilityA ?? 0) * 100;
    const probabilityB = (match.probabilityB ?? 0) * 100;
    const probabilityDraw = (match.drawProbability ?? 0) * 100;

    const teamAWon = match.winner === match.teamA;
    const teamBWon = match.winner === match.teamB;

    return (
      <View
        key={match.id}
        style={[
          styles.probabilityCard,
          { padding: cardPadding },
        ]}
      >
        <View style={styles.probabilityCardHeader}>
          <Text style={styles.probabilityMatchNumber}>
            PARTIDO {match.id}
          </Text>

          <Text style={styles.probabilityStatus}>
            {match.status === 'SIMULADO' ? 'SIMULADO' : 'PENDIENTE'}
          </Text>
        </View>

        <View style={styles.probabilityTeamRow}>
          <Text
            numberOfLines={2}
            style={[
              styles.probabilityTeamName,
              teamAWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(match.teamA)}
          </Text>

          <Text style={styles.probabilityValue}>
            {probabilityA.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.probabilityTeamRow}>
          <Text
            numberOfLines={2}
            style={[
              styles.probabilityTeamName,
              teamBWon && styles.bracketWinner,
            ]}
          >
            {getTeamDisplayName(match.teamB)}
          </Text>

          <Text style={styles.probabilityValue}>
            {probabilityB.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.probabilityBar}>
          <View
            style={[
              styles.probabilityA,
              { width: `${probabilityA}%` },
            ]}
          />

          <View
            style={[
              styles.probabilityDraw,
              { width: `${probabilityDraw}%` },
            ]}
          />

          <View
            style={[
              styles.probabilityB,
              { width: `${probabilityB}%` },
            ]}
          />
        </View>

        <View style={styles.drawRow}>
          <Text style={styles.drawText}>
            Probabilidad de empate
          </Text>

          <Text style={styles.drawValue}>
            {probabilityDraw.toFixed(1)}%
          </Text>
        </View>

        {match.winner && (
          <Text style={styles.qualifiedText}>
            Clasificado: {getTeamDisplayName(match.winner)}
          </Text>
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
            { marginBottom: isMobile ? 17 : 22 },
          ]}
        >
          <Text style={styles.brand}>PREDICTIA</Text>
          <Text style={styles.subtitle}>PREDICCIÓN DE TORNEO</Text>
        </View>

        <Text style={[styles.title, { fontSize: titleSize }]}>
          {tournament.tournamentName}
        </Text>

        <Text style={styles.description}>
          Cuadro de eliminación y análisis estadístico de cada
          enfrentamiento.
        </Text>

        {/* RESUMEN DEL TORNEO */}
        <View
          style={[
            styles.summaryCard,
            {
              padding: cardPadding,
              flexWrap: 'wrap',
            },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {tournament.teams.length}
            </Text>
            <Text style={styles.summaryLabel}>SELECCIONES</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {tournament.matches.length}
            </Text>
            <Text style={styles.summaryLabel}>PARTIDOS</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {phasesCompleted}/{totalPhases}
            </Text>
            <Text style={styles.summaryLabel}>FASES</Text>
          </View>
        </View>

        {/* CONTINUAR TORNEO */}
        {nextRound && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onContinueTournament(nextRound)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonTitle}>
              CONTINUAR TORNEO →
            </Text>

            <Text style={styles.continueButtonDescription}>
              Simular la siguiente fase: {ROUND_NAMES[nextRound]}
            </Text>
          </TouchableOpacity>
        )}

        {!nextRound && tournament.champion && (
          <View style={styles.completedTournament}>
            <Text style={styles.completedTournamentText}>
              TORNEO FINALIZADO
            </Text>
          </View>
        )}

        {/* CUADRO DE ELIMINACIÓN */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            CUADRO DE ELIMINACIÓN
          </Text>

          <Text style={styles.sectionDescription}>
            Recorrido de las selecciones hasta la gran final.
          </Text>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.bracketScroll}
        >
          <View style={styles.bracketCanvas}>
            {renderConnections(
              0,
              180,
              MATCH_CENTERS.first,
              MATCH_CENTERS.second,
              'left'
            )}

            {renderConnections(
              180,
              360,
              MATCH_CENTERS.second,
              MATCH_CENTERS.third,
              'left'
            )}

            {renderConnections(
              360,
              540,
              MATCH_CENTERS.third,
              MATCH_CENTERS.semi,
              'left'
            )}

            {renderConnections(
              1440,
              1260,
              MATCH_CENTERS.first,
              MATCH_CENTERS.second,
              'right'
            )}

            {renderConnections(
              1260,
              1080,
              MATCH_CENTERS.second,
              MATCH_CENTERS.third,
              'right'
            )}

            {renderConnections(
              1080,
              900,
              MATCH_CENTERS.third,
              MATCH_CENTERS.semi,
              'right'
            )}

            <View style={[styles.finalConnector, { left: 690 }]} />
            <View style={[styles.finalConnector, { left: 900 }]} />

            {renderBracketColumn(leftFirst, 0, MATCH_CENTERS.first)}
            {renderBracketColumn(leftSecond, 180, MATCH_CENTERS.second)}
            {renderBracketColumn(leftQuarter, 360, MATCH_CENTERS.third)}
            {renderBracketColumn(leftSemi, 540, MATCH_CENTERS.semi)}

            {renderBracketColumn(rightFirst, 1440, MATCH_CENTERS.first)}
            {renderBracketColumn(rightSecond, 1260, MATCH_CENTERS.second)}
            {renderBracketColumn(rightQuarter, 1080, MATCH_CENTERS.third)}
            {renderBracketColumn(rightSemi, 900, MATCH_CENTERS.semi)}

            {renderFinal()}
          </View>
        </ScrollView>

        <Text style={styles.scrollHint}>
          ← Desliza horizontalmente para recorrer el cuadro →
        </Text>

        {/* CAMPEÓN */}
        {tournament.champion && (
          <View style={styles.championCard}>
            <Text style={styles.championTrophy}>🏆</Text>

            <Text style={styles.championLabel}>
              CAMPEÓN PROYECTADO
            </Text>

            <Text style={styles.championName}>
              {getTeamDisplayName(tournament.champion)}
            </Text>
          </View>
        )}

        {/* ANÁLISIS DE PROBABILIDADES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            ANÁLISIS DE PROBABILIDADES
          </Text>

          <Text style={styles.sectionDescription}>
            Probabilidades estimadas para cada enfrentamiento
            de la simulación.
          </Text>
        </View>

        {ROUND_ORDER.map((round) => {
          const matches = getMatches(round);

          if (matches.length === 0) return null;

          return (
            <View key={round} style={styles.roundSection}>
              <Text style={styles.roundTitle}>
                {ROUND_NAMES[round].toUpperCase()}
              </Text>

              <View
                style={[
                  styles.probabilityGrid,
                  {
                    flexDirection: isMobile ? 'column' : 'row',
                    flexWrap: 'wrap',
                  },
                ]}
              >
                {matches.map((match) => (
                  <View
                    key={match.id}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? undefined : 520,
                      flex: isMobile ? undefined : 1,
                      minWidth: isMobile ? undefined : 280,
                    }}
                  >
                    {renderProbabilityCard(match)}
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* ACLARACIÓN */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>
            SOBRE ESTA PREDICCIÓN
          </Text>

          <Text style={styles.disclaimerText}>
            Los resultados son estimaciones estadísticas basadas
            en los registros históricos disponibles y 1.000
            simulaciones por enfrentamiento. No representan una
            garantía de los resultados reales.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backHomeButton}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={styles.backHomeText}>
            VOLVER AL MENÚ PRINCIPAL
          </Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  brand: {
    color: '#B9F66A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#829087',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 5,
  },
  title: {
    color: '#F0F5EF',
    fontSize: 27,
    fontWeight: '900',
  },
  description: {
    color: '#9AA79D',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#19251E',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3A2E',
    marginBottom: 20,
    gap: 10,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  summaryValue: {
    color: '#B9F66A',
    fontSize: 23,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#829087',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center',
  },
  summaryDivider: {
    height: 35,
    width: 1,
    backgroundColor: '#354439',
  },
  continueButton: {
    backgroundColor: '#B9F66A',
    borderRadius: 12,
    paddingVertical: 17,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  continueButtonTitle: {
    color: '#101914',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  continueButtonDescription: {
    color: '#26382B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  completedTournament: {
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 25,
  },
  completedTournamentText: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: 15,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionDescription: {
    color: '#9AA79D',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  bracketScroll: {
    paddingVertical: 10,
  },
  bracketCanvas: {
    width: 1590,
    height: BRACKET_HEIGHT,
    position: 'relative',
    backgroundColor: '#141E18',
    borderWidth: 1,
    borderColor: '#2A3A2E',
    borderRadius: 14,
    overflow: 'hidden',
  },
  bracketMatch: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#405044',
    borderRadius: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
    zIndex: 2,
  },
  bracketTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 23,
    gap: 5,
  },
  bracketTeamName: {
    color: '#DCE5DD',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  bracketScore: {
    color: '#F0F5EF',
    fontSize: 12,
    fontWeight: '900',
  },
  bracketWinner: {
    color: '#B9F66A',
    fontWeight: '900',
  },
  bracketSeparator: {
    height: 1,
    backgroundColor: '#354439',
  },
  connector: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#829087',
    zIndex: 0,
  },
  connectorVertical: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#829087',
    zIndex: 0,
  },
  finalConnector: {
    position: 'absolute',
    top: 447.5,
    width: 30,
    height: 1,
    backgroundColor: '#B9F66A',
  },
  finalContainer: {
    position: 'absolute',
    left: 690,
    top: 345,
    width: 210,
    height: 205,
    backgroundColor: '#25351F',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 3,
  },
  finalLabel: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  finalCard: {
    width: '100%',
    backgroundColor: '#19251E',
    borderRadius: 8,
    padding: 9,
  },
  finalTeam: {
    color: '#DCE5DD',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 4,
  },
  finalScore: {
    color: '#B9F66A',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  finalTrophy: {
    fontSize: 26,
    marginTop: 7,
  },
  finalChampion: {
    color: '#F0F5EF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 3,
  },
  finalChampionLabel: {
    color: '#B9F66A',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 3,
  },
  scrollHint: {
    color: '#829087',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  championCard: {
    backgroundColor: '#25351F',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
  },
  championTrophy: {
    fontSize: 35,
  },
  championLabel: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 9,
    textAlign: 'center',
  },
  championName: {
    color: '#F0F5EF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
  },
  roundSection: {
    marginTop: 17,
    width: '100%',
  },
  roundTitle: {
    color: '#B9F66A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  probabilityGrid: {
    width: '100%',
    gap: 10,
  },
  probabilityCard: {
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#2A3A2E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 11,
    width: '100%',
  },
  probabilityCardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  probabilityMatchNumber: {
    color: '#829087',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  probabilityStatus: {
    color: '#B9F66A',
    fontSize: 8,
    fontWeight: '900',
  },
  probabilityTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  probabilityTeamName: {
    color: '#DCE5DD',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  probabilityValue: {
    color: '#F0F5EF',
    fontSize: 13,
    fontWeight: '900',
  },
  probabilityBar: {
    height: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#101914',
    marginTop: 10,
  },
  probabilityA: {
    height: '100%',
    backgroundColor: '#B9F66A',
  },
  probabilityDraw: {
    height: '100%',
    backgroundColor: '#829087',
  },
  probabilityB: {
    height: '100%',
    backgroundColor: '#72B7F2',
  },
  drawRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  drawText: {
    color: '#9AA79D',
    fontSize: 10,
    flex: 1,
  },
  drawValue: {
    color: '#DCE5DD',
    fontSize: 10,
    fontWeight: '800',
  },
  qualifiedText: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 12,
  },
  disclaimerCard: {
    backgroundColor: '#19251E',
    borderRadius: 12,
    padding: 17,
    marginTop: 25,
    width: '100%',
  },
  disclaimerTitle: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 9,
  },
  disclaimerText: {
    color: '#9AA79D',
    fontSize: 11,
    lineHeight: 18,
  },
  backHomeButton: {
    backgroundColor: '#B9F66A',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  backHomeText: {
    color: '#101914',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
