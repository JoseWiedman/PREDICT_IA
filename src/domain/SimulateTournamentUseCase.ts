
import { SimulateMatchUseCase } from './SimulateMatchUseCase';

import type {
  TournamentBracket,
  TournamentMatch,
  TournamentRound,
} from './TournamentMatch';

export class SimulateTournamentUseCase {
  private simulateMatchUseCase: SimulateMatchUseCase;

  private readonly rounds: TournamentRound[] = [
    'DIECISEISAVOS',
    'OCTAVOS',
    'CUARTOS',
    'SEMIFINALES',
    'FINAL',
  ];

  private readonly teamsPerRound = [32, 16, 8, 4, 2];
  private readonly matchesPerRound = [16, 8, 4, 2, 1];

  constructor(simulateMatchUseCase: SimulateMatchUseCase) {
    this.simulateMatchUseCase = simulateMatchUseCase;
  }

  async execute(
    tournamentName: string,
    teams: string[],
    previousBracket?: TournamentBracket,
    throughRound: TournamentRound = 'FINAL',
    startingRound: TournamentRound = 'DIECISEISAVOS'
  ): Promise<TournamentBracket> {
    const tournamentStartingRound = previousBracket
      ? previousBracket.startingRound ?? this.getStartingRoundFromMatches(previousBracket.matches)
      : startingRound;

    const startingRoundIndex = this.rounds.indexOf(
      tournamentStartingRound
    );

    const targetRoundIndex = this.rounds.indexOf(throughRound);

    if (startingRoundIndex === -1 || targetRoundIndex === -1) {
      throw new Error('La fase seleccionada no es válida.');
    }

    if (targetRoundIndex < startingRoundIndex) {
      throw new Error(
        'No puedes simular una fase anterior a la fase inicial del torneo.'
      );
    }

    const tournamentTeams = previousBracket
      ? previousBracket.teams
      : teams.map((team) => team.trim());

    if (!previousBracket) {
      this.validateTeams(
        tournamentTeams,
        this.teamsPerRound[startingRoundIndex]
      );
    }

    const allMatches: TournamentMatch[] = previousBracket
      ? [...previousBracket.matches]
      : [];

    // Revisar las fases que ya fueron simuladas.
    let lastCompletedRoundIndex = startingRoundIndex - 1;

    for (
      let i = startingRoundIndex;
      i < this.rounds.length;
      i++
    ) {
      const round = this.rounds[i];

      const roundMatches = allMatches.filter(
        (match) => match.round === round
      );

      if (roundMatches.length === 0) {
        break;
      }

      const expectedMatches = this.matchesPerRound[i];

      const roundIsComplete =
        roundMatches.length === expectedMatches &&
        roundMatches.every(
          (match) =>
            match.status === 'SIMULADO' &&
            match.winner !== null &&
            match.scoreA !== null &&
            match.scoreB !== null
        );

      if (!roundIsComplete) {
        throw new Error(
          `La fase ${round} tiene resultados incompletos.`
        );
      }

      lastCompletedRoundIndex = i;
    }

    // Impedir que existan resultados en fases fuera de orden.
    const nextRoundIndex = lastCompletedRoundIndex + 1;

    const matchesAfterIncompleteRound = allMatches.some(
      (match) => {
        const matchRoundIndex = this.rounds.indexOf(match.round);

        return (
          matchRoundIndex < startingRoundIndex ||
          matchRoundIndex > nextRoundIndex
        );
      }
    );

    if (matchesAfterIncompleteRound) {
      throw new Error(
        'El torneo tiene fases fuera de orden. No es posible continuarlo.'
      );
    }

    // Recuperar las selecciones iniciales o los clasificados.
    let currentTeams: string[];

    if (lastCompletedRoundIndex < startingRoundIndex) {
      currentTeams = [...tournamentTeams];
    } else {
      const lastRound = this.rounds[lastCompletedRoundIndex];

      currentTeams = allMatches
        .filter((match) => match.round === lastRound)
        .sort((a, b) => a.id - b.id)
        .map((match) => match.winner as string);
    }

    // Si ya se llegó a la fase solicitada, conservar resultados.
    if (lastCompletedRoundIndex >= targetRoundIndex) {
      return {
        tournamentName:
          previousBracket?.tournamentName ?? tournamentName,
        teams: tournamentTeams,
        startingRound: tournamentStartingRound,
        matches: allMatches,
        champion:
          allMatches.find(
            (match) => match.round === 'FINAL'
          )?.winner ?? null,
      };
    }

    let matchId =
      allMatches.reduce(
        (maxId, match) => Math.max(maxId, match.id),
        0
      ) + 1;

    // Simular las fases pendientes hasta la fase solicitada.
    for (
      let roundIndex = nextRoundIndex;
      roundIndex <= targetRoundIndex;
      roundIndex++
    ) {
      const round = this.rounds[roundIndex];

      if (currentTeams.length !== this.teamsPerRound[roundIndex]) {
        throw new Error(
          `La cantidad de selecciones no corresponde a la fase ${round}.`
        );
      }

      const simulations = [];

      for (
        let i = 0;
        i < currentTeams.length;
        i += 2
      ) {
        simulations.push(
          this.simulateMatchUseCase.execute(
            currentTeams[i],
            currentTeams[i + 1],
            1000
          )
        );
      }

      const results = await Promise.all(simulations);
      const nextTeams: string[] = [];

      results.forEach((result) => {
        const scoreParts = result.mostFrequentScore
          .split('-')
          .map(Number);

        const scoreA = scoreParts[0] ?? 0;
        const scoreB = scoreParts[1] ?? 0;

        let winner: string;

        if (result.teamAWins > result.teamBWins) {
          winner = result.teamA;
        } else if (result.teamBWins > result.teamAWins) {
          winner = result.teamB;
        } else {
          winner =
            Math.random() < 0.5
              ? result.teamA
              : result.teamB;
        }

        nextTeams.push(winner);

        allMatches.push({
          id: matchId++,
          round,
          teamA: result.teamA,
          teamB: result.teamB,
          scoreA,
          scoreB,
          winner,
          probabilityA: result.teamAProbability,
          probabilityB: result.teamBProbability,
          drawProbability: result.drawProbability,
          status: 'SIMULADO',
        });
      });

      currentTeams = nextTeams;
    }

    return {
      tournamentName:
        previousBracket?.tournamentName ?? tournamentName,
      teams: tournamentTeams,
      startingRound: tournamentStartingRound,
      matches: allMatches,
      champion:
        allMatches.find(
          (match) => match.round === 'FINAL'
        )?.winner ?? null,
    };
  }

  private getStartingRoundFromMatches(
    matches: TournamentMatch[]
  ): TournamentRound {
    const firstMatch = matches.reduce<TournamentMatch | null>(
      (earliest, match) => {
        if (!earliest) {
          return match;
        }

        return this.rounds.indexOf(match.round) <
          this.rounds.indexOf(earliest.round)
          ? match
          : earliest;
      },
      null
    );

    return firstMatch?.round ?? 'DIECISEISAVOS';
  }

  private validateTeams(
    teams: string[],
    expectedCount: number
  ): void {
    if (teams.length !== expectedCount) {
      throw new Error(
        `Debes ingresar exactamente ${expectedCount} selecciones para esta fase.`
      );
    }

    if (teams.some((team) => !team.trim())) {
      throw new Error(
        'Todas las selecciones deben tener un nombre.'
      );
    }

    const normalizedTeams = teams.map((team) =>
      team.trim().toLowerCase()
    );

    if (new Set(normalizedTeams).size !== expectedCount) {
      throw new Error(
        'No puedes ingresar selecciones repetidas.'
      );
    }
  }
}
