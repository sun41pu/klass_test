const pool = require("./pool.js")
async function insertLessons(teacherIds, title, days, firstDate, lessonsCount, lastDate) {
    if (!teacherIds || !title || !days || !firstDate || (lessonsCount === undefined && lastDate === undefined)) {
      throw new Error('Отсутствуют необходимые параметры')
    }

    if ((lessonsCount && lessonsCount !== undefined) && (lastDate && lastDate !== undefined)) {
      throw new Error('Параметры LessonCount и LastDate являются взаимоисключающими, выберите только один')
    }

    if ((lessonsCount && lessonsCount > 300) || (lastDate && new Date(lastDate) - new Date(firstDate) > 365 * 24 * 60 * 60 * 1000)) {
      throw new Error('Превышен лимит в 300 уроков или период в 1 год.')
    }

    const client = await pool.connect();
    try {
      // Начинаем транзакцию
      await client.query('BEGIN');
      const createdLessonIds = [];

      if (lessonsCount) {
        let currentDate = new Date(firstDate);
        let createdLessons = 0;
        while (createdLessons < lessonsCount && createdLessons < 52 * days.length) {
          if (days.includes(currentDate.getDay())) {
            const lessonResult = await client.query('INSERT INTO lessons (date, title, status) VALUES ($1, $2, $3) RETURNING id', [currentDate, title, 0]);
            const lessonId = lessonResult.rows[0].id;
            createdLessonIds.push(lessonId);

            for (const teacherId of teacherIds) {
              await client.query('INSERT INTO lesson_teachers (lesson_id, teacher_id) VALUES ($1, $2)', [lessonId, teacherId]);
            }

            createdLessons++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (lastDate) {
        let currentDate = new Date(firstDate);
        let createdLessons = 0;
        while ( createdLessons < 300 && currentDate <= new Date(lastDate)) {
          if (days.includes(currentDate.getDay())) {
            const lessonResult = await client.query('INSERT INTO lessons (date, title, status) VALUES ($1, $2, $3) RETURNING id', [currentDate, title, 0]);
            const lessonId = lessonResult.rows[0].id;
            createdLessonIds.push(lessonId);

            for (const teacherId of teacherIds) {
              await client.query('INSERT INTO lesson_teachers (lesson_id, teacher_id) VALUES ($1, $2)', [lessonId, teacherId]);
            }

            createdLessons++
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      

      // Совершаем транзакцию
      await client.query('COMMIT');
      console.log(createdLessonIds.length);
      return createdLessonIds
    } catch (error) {
      // ОТкатываем транзакцию
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // ОСвобождаем client
      client.release();
    }
}

module.exports = insertLessons;