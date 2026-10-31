export interface SimulationResult {
  teamA: string;
  teamB: string;
  iterations: number;

  teamAWins: number;
  draws: number;
  teamBWins: number;

  teamAProbability: number;
  drawProbability: number;
  teamBProbability: number;

  expectedGoalsA: number;
  expectedGoalsB: number;

  mostFrequentScore: string;
}