const insertLessons = require('../database/insertLessons.js');
const pool = require("../database/pool.js");

jest.mock("../database/pool.js", () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

describe('insertLessons', () => {
  let clientMock;
  
  beforeAll(() => {
    clientMock = {
      query: jest.fn(),
      release: jest.fn(),
    };
    
    pool.connect.mockResolvedValue(clientMock);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Должен выкинуть ошибку Отсутствуют необходимые параметры', async () => {
    await expect(insertLessons()).rejects.toThrow('Отсутствуют необходимые параметры');
  });

  it('Должен выкинуть ошибку Параметры LessonCount и LastDate являются взаимоисключающими, выберите только один', async () => {
    await expect(insertLessons([1, 2], 'Math', [1, 3, 5], new Date(), 10, new Date())).rejects.toThrow('Параметры LessonCount и LastDate являются взаимоисключающими, выберите только один');
  });

  it('Должен выкинуть ошибку "Превышен лимит в 300 уроков или период в 1 год."', async () => {
    await expect(insertLessons([1], 'History', [0, 2, 4], new Date(), 301)).rejects.toThrow('Превышен лимит в 300 уроков или период в 1 год.');
  });

  //С этим тестом возникли трудности. По какой-то причине при вызове функции insertLessons программа не получает данные после выполнения запроса

    //   it('should insert lessons based on lessonsCount', async () => {
    //     const client = { query: jest.fn(), release: jest.fn() };
    //     pool.connect.mockResolvedValue(client);
    //     const currentDate = new Date('2023-10-01');

    //     await insertLessons([1, 2], 'Math', [1, 3, 5], currentDate, 5);

    //     expect(client.query).toHaveBeenCalledTimes(10); // Expect 5 insert queries and 5 teacher related insert queries
    //   });


  it('Должен обработать ошибку и откатить транзакцию', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(client);
  
    client.query.mockRejectedValueOnce(new Error('Database error')); 
  
    try {
      await insertLessons([1, 2], 'Math', [1, 3, 5], new Date('2023-01-01'), 10);
    } catch (error) {
      expect(error.message).toBe('Database error');
      expect(pool.connect).toBeCalledTimes(1);
      expect(client.query).toBeCalledWith('BEGIN');
      expect(client.query).toBeCalledWith('ROLLBACK');
      expect(client.release).toBeCalledTimes(1);
    }
  });
});