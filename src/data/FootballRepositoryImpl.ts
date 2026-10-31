
import type { FootballRepository } from '../domain/FootballRepository';
import { Match } from '../domain/Match';
import { TeamStats } from '../domain/TeamStats';
import { CsvDataSource } from './CsvDataSource';

export class FootballRepositoryImpl implements FootballRepository {
  private dataSource: CsvDataSource;
  private matchesPromise: Promise<Match[]> | null = null;

  constructor() {
    this.dataSource = new CsvDataSource();
  }

  async getMatches(): Promise<Match[]> {
    if (!this.matchesPromise) {
      this.matchesPromise = this.dataSource.getMatches().catch((error) => {
        this.matchesPromise = null;
        throw error;
      });
    }

    return this.matchesPromise;
  }

  async getTeamStats(team: string): Promise<TeamStats> {
    const matches = await this.getMatches();
    const normalizedTeam = team.trim().toLowerCase();

    const teamMatches = matches.filter(
      (match) =>
        match.homeTeam.toLowerCase() === normalizedTeam ||
        match.awayTeam.toLowerCase() === normalizedTeam
    );

    if (teamMatches.length === 0) {
      throw new Error(`No se encontraron partidos para ${team}.`);
    }

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    teamMatches.forEach((match) => {
      const isHome =
        match.homeTeam.toLowerCase() === normalizedTeam;

      const scored = isHome ? match.homeScore : match.awayScore;
      const conceded = isHome ? match.awayScore : match.homeScore;

      goalsFor += scored;
      goalsAgainst += conceded;

      if (scored > conceded) {
        wins++;
      } else if (scored === conceded) {
        draws++;
      } else {
        losses++;
      }
    });

    const played = teamMatches.length;

    return {
      team,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      avgGoalsFor: Number((goalsFor / played).toFixed(2)),
      avgGoalsAgainst: Number((goalsAgainst / played).toFixed(2)),
      winRate: Number(((wins / played) * 100).toFixed(2)),
    };
  }
}
