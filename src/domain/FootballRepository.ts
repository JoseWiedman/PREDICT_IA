
import { Match } from './Match';
import { TeamStats } from './TeamStats';

export interface FootballRepository {
  getMatches(): Promise<Match[]>;
  getTeamStats(team: string): Promise<TeamStats>;
}
