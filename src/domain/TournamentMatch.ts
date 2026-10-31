
export type TournamentRound =
  | 'DIECISEISAVOS'
  | 'OCTAVOS'
  | 'CUARTOS'
  | 'SEMIFINALES'
  | 'FINAL';

export interface TournamentMatch {
  id: number;
  round: TournamentRound;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  winner: string | null;
  probabilityA: number | null;
  probabilityB: number | null;
  drawProbability: number | null;
  status: 'PENDIENTE' | 'SIMULADO';
}

export interface TournamentBracket {
  tournamentName: string;

  // Selecciones participantes al comenzar el torneo.
  teams: string[];

  // Primera fase elegida por el usuario.
  startingRound: TournamentRound;

  // Historial completo de enfrentamientos simulados.
  matches: TournamentMatch[];

  champion: string | null;
}
