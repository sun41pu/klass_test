const express = require('express')
const app = express();
const pool = require("../database/pool.js")
const SelectQueryBuilder = require('../database/lessonSelectQueryBuilder.js')
const insertLessons = require('../database/insertLessons.js')


app.use(express.json())


app.post('/', async (req, res) => {
    try {
      let { date, status, teachersIds, studentsCount, page, lessonsPerPage } = req.body;
      const builder = new SelectQueryBuilder();
      console.log("/ req.body: ", date, status, teachersIds, studentsCount, page, lessonsPerPage);
      if(!page) page = 1
      if(!lessonsPerPage) lessonsPerPage = 5
      const query = builder
            .filterByDate(date)
            .filterByStatus(status)
            .filterByTeacherIds(teachersIds)
            .filterByStudentsCount(studentsCount)
            .paginate(page, lessonsPerPage)
            .build()
          
     
      const { rows } = await pool.query(query);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Ошибка при обработке запроса', error);
      res.status(400).send('Ошибка при обработке запроса');
    }
});


app.post('/lessons', async (req, res) => {
  try {
    const { teacherIds, title, days, firstDate, lessonsCount, lastDate } = req.body;

    console.log("/lessons req.body: ", teacherIds, title, days, firstDate, lessonsCount, lastDate);
    let data = await insertLessons(teacherIds, title, days, firstDate, lessonsCount, lastDate)

    return res.status(200).json({ lessonIds: data });
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Ошибка обработки запроса' });
  }
});

app.listen(3333, ()=> {
    console.log(`Слушаем порт 3333...`);
})

module.exports = app;