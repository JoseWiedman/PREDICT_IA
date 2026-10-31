
import { Match } from '../../domain/Match';
import { TeamStats } from '../../domain/TeamStats';
import { SimulationResult } from '../../domain/SimulationResult';

import { GetMatchesUseCase } from '../../domain/GetMatchesUseCase';
import { SimulateMatchUseCase } from '../../domain/SimulateMatchUseCase';

import { FootballRepositoryImpl } from '../../data/FootballRepositoryImpl';
import { APP_CONFIG } from '../../core/config';

export class FootballViewModel {
  private repository: FootballRepositoryImpl;
  private getMatchesUseCase: GetMatchesUseCase;
  private simulateMatchUseCase: SimulateMatchUseCase;

  public matches: Match[] = [];
  public isLoading = false;
  public errorMessage = '';

  constructor() {
    this.repository = new FootballRepositoryImpl();

    this.getMatchesUseCase = new GetMatchesUseCase(
      this.repository
    );

    this.simulateMatchUseCase = new SimulateMatchUseCase(
      this.repository
    );
  }

  async loadMatches(): Promise<Match[]> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.matches = await this.getMatchesUseCase.execute();
      return this.matches;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible cargar los partidos.';

      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async getTeamStats(team: string): Promise<TeamStats> {
    try {
      return await this.repository.getTeamStats(team);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible consultar las estadísticas.';

      throw error;
    }
  }

  async simulateMatch(
    teamA: string,
    teamB: string
  ): Promise<SimulationResult> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.simulateMatchUseCase.execute(
        teamA,
        teamB,
        APP_CONFIG.simulationIterations
      );

      return result;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible realizar la simulación.';

      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
