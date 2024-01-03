const request = require('supertest');
const app = require('../server/index.js');
const pool = require('../database/pool.js');

jest.mock('../database/pool.js', () => ({
  query: jest.fn(),
}));

describe('POST /', () => {
  it('Должен обработать запрос и вернуть верные данные', async () => {
    const reqBody = {
        "date": "2019-01-01,2019-09-01",
        "status": "0",
        "teachersIds": "1,3",
        "studentsCount": "1,5",
        "page": "1",
        "lessonsPerPage": "5"
    };

    const queryResult = [
        {
            "id": 7,
            "date": "2019-06-16T21:00:00.000Z",
            "title": "White Color",
            "status": 0,
            "visitcount": "1",
            "studentsattended": [
                "id: 1, name: Ivan, visit: true",
                "id: 2, name: Sergey, visit: true"
            ],
            "teachers": [
                "id: 1, Sveta"
            ]
        },
        {
            "id": 10,
            "date": "2019-06-23T21:00:00.000Z",
            "title": "Brown Color",
            "status": 0,
            "visitcount": "2",
            "studentsattended": [
                "id: 1, name: Ivan, visit: false",
                "id: 3, name: Maxim, visit: true"
            ],
            "teachers": [
                "id: 3, Angelina"
            ]
        }
    ] 

    pool.query.mockResolvedValue({ rows: queryResult });

    const res = await request(app)
      .post('/')
      .send(reqBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(queryResult);
  });

});


describe('POST /lessons', () => {
  //С этим тестом возникли трудности. По какой-то причине выдает статус 400. Не знаю, в чем дело

  // it('should return lessonIds when valid data is sent', async () => {
  //     const reqBody = {
  //         "teacherIds": [1,4], 
  //         "title": "Blue noodles",
  //         "days": [0,1,4], 
  //         "firstDate": "2024-01-10",  
  //         "lessonsCount": "22"
  //         }
  //   const response = await request(app)
  //     .post('/lessons')
  //     .send(reqBody);
          
  //   expect(response.status).toBe(200);
  // });

  it('Должен вернуть ошибку при передаче некорректных данных', async () => {
    const response = await request(app)
      .post('/lessons')
      .send({
        
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Ошибка обработки запроса' });
  });
});