const SelectQueryBuilder = require('../database/lessonSelectQueryBuilder.js');
const pool = require('../database/pool.js');

jest.mock('../database/pool.js', () => ({
  query: jest.fn(),
}));

describe('SelectQueryBuilder', () => {
  beforeEach(() => {
    pool.query.mockClear();
  });

  it('Должен добавить фильтрацию по дате', () => {
    const builder = new SelectQueryBuilder();

    const query = builder.filterByDate('2022-01-01').build();

    expect(query).toContain("l.date = '2022-01-01'");
  });

  it('Должен добавить фильтрацию по статусу', () => {
    const builder = new SelectQueryBuilder();

    const query = builder.filterByStatus(1).build();

    expect(query).toContain("l.status = 1");
  });

  it('Должен добавить фильтрацию по кол-ву учеников', () => {
    const builder = new SelectQueryBuilder();

    const query = builder.filterByStudentsCount('5,10').build();

    expect(query).toContain("l.id IN (SELECT lesson_id FROM lesson_students GROUP BY lesson_id HAVING COUNT(*) BETWEEN 5 AND 10)");
  });

  it('Должен применить пагинацию к запросу', () => {
    const builder = new SelectQueryBuilder();

    const query = builder.paginate(2, 10).build();

    expect(query).toContain("GROUP BY l.id ORDER BY l.id LIMIT 10 OFFSET 10");
  });
});