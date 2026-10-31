
import { Match } from '../domain/Match';

const CSV_URL =
  'https://raw.githubusercontent.com/martj42/international_results/master/results.csv';

export class CsvDataSource {
  async getMatches(): Promise<Match[]> {
    try {
      const response = await fetch(CSV_URL);

      if (!response.ok) {
        throw new Error('No fue posible descargar los datos de fútbol.');
      }

      const csvText = await response.text();

      const rows = this.parseCSV(csvText);

      if (rows.length < 2) {
        throw new Error('El archivo CSV no contiene partidos.');
      }

      const headers = rows[0].map((header) =>
        header.trim().toLowerCase()
      );

      const requiredColumns = [
        'date',
        'home_team',
        'away_team',
        'home_score',
        'away_score',
        'tournament',
        'city',
        'country',
        'neutral',
      ];

      for (const column of requiredColumns) {
        if (!headers.includes(column)) {
          throw new Error(`Falta la columna ${column} en el CSV.`);
        }
      }

      const getValue = (row: string[], column: string): string => {
        const index = headers.indexOf(column);
        return (row[index] ?? '').trim();
      };

      const matches: Match[] = rows
        .slice(1)
        .map((row) => {
          const homeScore = Number(getValue(row, 'home_score'));
          const awayScore = Number(getValue(row, 'away_score'));

          return {
            date: getValue(row, 'date'),
            homeTeam: getValue(row, 'home_team'),
            awayTeam: getValue(row, 'away_team'),
            homeScore,
            awayScore,
            tournament: getValue(row, 'tournament'),
            city: getValue(row, 'city'),
            country: getValue(row, 'country'),
            neutral: ['true', '1', 'yes'].includes(
              getValue(row, 'neutral').toLowerCase()
            ),
          };
        })
        .filter(
          (match) =>
            match.date !== '' &&
            match.homeTeam !== '' &&
            match.awayTeam !== '' &&
            Number.isFinite(match.homeScore) &&
            Number.isFinite(match.awayScore)
        );

      return matches;
    } catch (error) {
      console.error('Error cargando los partidos:', error);
      throw error;
    }
  }

  private parseCSV(content: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = '';
    let insideQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '"') {
        if (insideQuotes && content[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(value);
        value = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && content[i + 1] === '\n') {
          i++;
        }

        row.push(value);
        rows.push(row);

        row = [];
        value = '';
      } else {
        value += char;
      }
    }

    if (value.length > 0 || row.length > 0) {
      row.push(value);
      rows.push(row);
    }

    if (rows.length > 0) {
      rows[0][0] = rows[0][0].replace(/^\uFEFF/, '');
    }

    return rows;
  }
}
