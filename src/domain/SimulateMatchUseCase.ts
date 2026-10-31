import type { FootballRepository } from './FootballRepository';
import type { SimulationResult } from './SimulationResult';

export class SimulateMatchUseCase {
  private repository: FootballRepository;

  constructor(repository: FootballRepository) {
    this.repository = repository;
  }

  async execute(
    teamA: string,
    teamB: string,
    iterations: number
  ): Promise<SimulationResult> {

    // Validar que sean dos equipos diferentes
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      throw new Error('Selecciona dos equipos diferentes.');
    }

    if (!Number.isInteger(iterations) || iterations <= 0) {
      throw new Error('El número de simulaciones no es válido.');
    }

    // Obtener las estadísticas históricas de ambos equipos
    const [statsA, statsB] = await Promise.all([
      this.repository.getTeamStats(teamA),
      this.repository.getTeamStats(teamB),
    ]);

    // Calcular los goles esperados de cada equipo
    const expectedGoalsA =
      (statsA.avgGoalsFor + statsB.avgGoalsAgainst) / 2;

    const expectedGoalsB =
      (statsB.avgGoalsFor + statsA.avgGoalsAgainst) / 2;

    // Contadores de resultados
    let teamAWins = 0;
    let draws = 0;
    let teamBWins = 0;

    // Registrar cuántas veces aparece cada marcador
    const scoreFrequency = new Map<string, number>();

    // Ejecutar las simulaciones
    for (let i = 0; i < iterations; i += 1) {

      const goalsA = this.poisson(expectedGoalsA);
      const goalsB = this.poisson(expectedGoalsB);

      const score = `${goalsA}-${goalsB}`;

      scoreFrequency.set(
        score,
        (scoreFrequency.get(score) ?? 0) + 1
      );

      // Determinar el resultado del partido
      if (goalsA > goalsB) {
        teamAWins += 1;
      } else if (goalsA === goalsB) {
        draws += 1;
      } else {
        teamBWins += 1;
      }
    }

    // Encontrar el marcador que más se repitió
    const mostFrequentScore = Array.from(
      scoreFrequency.entries()
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0-0';

    // Devolver los resultados
    return {
      teamA: statsA.team,
      teamB: statsB.team,
      iterations,

      teamAWins,
      draws,
      teamBWins,

      teamAProbability: teamAWins / iterations,
      drawProbability: draws / iterations,
      teamBProbability: teamBWins / iterations,

      expectedGoalsA,
      expectedGoalsB,

      mostFrequentScore,
    };
  }

  // Generar una cantidad de goles usando distribución de Poisson
  private poisson(lambda: number): number {
    const safeLambda = Math.max(0.05, lambda);
    const limit = Math.exp(-safeLambda);

    let product = 1;
    let k = 0;

    do {
      k += 1;
      product *= Math.random();
    } while (product > limit);

    return k - 1;
  }
}