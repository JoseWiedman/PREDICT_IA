
import { Match } from './Match';
import { FootballRepository } from './FootballRepository';

export class GetMatchesUseCase {
  private repository: FootballRepository;

  constructor(repository: FootballRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Match[]> {
    return await this.repository.getMatches();
  }
}
