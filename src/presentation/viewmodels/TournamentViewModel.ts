
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FootballRepositoryImpl } from '../../data/FootballRepositoryImpl';
import { SimulateMatchUseCase } from '../../domain/SimulateMatchUseCase';
import { SimulateTournamentUseCase } from '../../domain/SimulateTournamentUseCase';

import type {
  TournamentBracket,
  TournamentRound,
} from '../../domain/TournamentMatch';

const TOURNAMENT_STORAGE_KEY = '@predictia_saved_tournament';

export class TournamentViewModel {
  private simulateTournamentUseCase: SimulateTournamentUseCase;

  public isLoading = false;
  public errorMessage = '';
  public tournament: TournamentBracket | null = null;

  constructor() {
    const repository = new FootballRepositoryImpl();

    const simulateMatchUseCase = new SimulateMatchUseCase(
      repository
    );

    this.simulateTournamentUseCase =
      new SimulateTournamentUseCase(simulateMatchUseCase);
  }

  // Crear y simular un torneo nuevo.
  async simulateTournament(
    tournamentName: string,
    teams: string[],
    startingRound: TournamentRound = 'DIECISEISAVOS'
  ): Promise<TournamentBracket> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const newTournament =
        await this.simulateTournamentUseCase.execute(
          tournamentName,
          teams,
          undefined,
          startingRound,
          startingRound
        );

      this.tournament = newTournament;

      await this.saveTournament(newTournament);

      return newTournament;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible simular el torneo.';

      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Continuar el torneo con la siguiente fase.
  async continueTournament(
    throughRound: TournamentRound
  ): Promise<TournamentBracket> {
    if (!this.tournament) {
      throw new Error(
        'No hay un torneo cargado para continuar.'
      );
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const updatedTournament =
        await this.simulateTournamentUseCase.execute(
          this.tournament.tournamentName,
          this.tournament.teams,
          this.tournament,
          throughRound
        );

      this.tournament = updatedTournament;

      await this.saveTournament(updatedTournament);

      return updatedTournament;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible continuar el torneo.';

      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Guardar el torneo en el dispositivo.
  async saveTournament(
    tournament: TournamentBracket
  ): Promise<void> {
    try {
      const tournamentJSON = JSON.stringify(tournament);

      await AsyncStorage.setItem(
        TOURNAMENT_STORAGE_KEY,
        tournamentJSON
      );
    } catch {
      throw new Error(
        'No fue posible guardar el torneo en el dispositivo.'
      );
    }
  }

  // Recuperar el último torneo guardado.
  async loadSavedTournament(): Promise<TournamentBracket | null> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const savedTournament = await AsyncStorage.getItem(
        TOURNAMENT_STORAGE_KEY
      );

      if (!savedTournament) {
        this.tournament = null;
        return null;
      }

      const parsedTournament = JSON.parse(
        savedTournament
      ) as TournamentBracket;

      if (
        !parsedTournament.tournamentName ||
        !Array.isArray(parsedTournament.teams) ||
        !Array.isArray(parsedTournament.matches)
      ) {
        throw new Error(
          'El torneo guardado no tiene un formato válido.'
        );
      }

      // Compatibilidad con torneos anteriores.
      if (!parsedTournament.startingRound) {
        const firstMatch = parsedTournament.matches
          .slice()
          .sort(
            (a, b) =>
              this.getRoundIndex(a.round) -
              this.getRoundIndex(b.round)
          )[0];

        parsedTournament.startingRound =
          firstMatch?.round ?? 'DIECISEISAVOS';
      }

      this.tournament = parsedTournament;

      return parsedTournament;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible recuperar el torneo guardado.';

      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Eliminar el torneo guardado.
  async deleteSavedTournament(): Promise<void> {
    try {
      await AsyncStorage.removeItem(
        TOURNAMENT_STORAGE_KEY
      );

      this.tournament = null;
      this.errorMessage = '';
    } catch {
      this.errorMessage =
        'No fue posible eliminar el torneo guardado.';

      throw new Error(this.errorMessage);
    }
  }

  // Obtener la posición de cada fase del torneo.
  private getRoundIndex(round: TournamentRound): number {
    const rounds: TournamentRound[] = [
      'DIECISEISAVOS',
      'OCTAVOS',
      'CUARTOS',
      'SEMIFINALES',
      'FINAL',
    ];

    return rounds.indexOf(round);
  }
}
