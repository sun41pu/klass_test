const pool = require("./pool.js")
class SelectQueryBuilder {
  constructor() {
    this.query = `SELECT l.*, 
    COUNT(DISTINCT ls.visit) AS visitCount, 
    array_agg(DISTINCT CONCAT('id: ', s.id, ', ', 'name: ', s.name, ', ', 'visit: ', COALESCE(ls.visit::text, 'false'))) AS studentsAttended, 
    array_agg(DISTINCT CONCAT('id: ', t.id, ', ', t.name)) AS teachers
    FROM lessons l
    LEFT JOIN lesson_students ls ON l.id = ls.lesson_id
    LEFT JOIN lesson_teachers lt ON l.id = lt.lesson_id
    LEFT JOIN students s ON ls.student_id = s.id
    LEFT JOIN teachers t ON lt.teacher_id = t.id
    WHERE 1=1`;
  }

  filterByDate(date) {
    if (date !== undefined) {
      const dates = date.split(',');
      if (dates.length === 1) {
        this.query += ` AND l.date = '${dates[0]}'`;
      } else if (dates.length === 2) {
        this.query += ` AND l.date BETWEEN '${dates[0]}' AND '${dates[1]}'`;
      }
    }
    return this;
  }

  filterByStatus(status) {
    if (status !== undefined) {
      this.query += ` AND l.status = ${status}`;
    }
    return this;
  }

  filterByTeacherIds(teacherIds) {
    if (teacherIds !== undefined && teacherIds.length > 0) {
      if (teacherIds.length > 1) {
        this.query += ` AND l.id IN (SELECT lesson_id FROM lesson_teachers WHERE teacher_id IN (${teacherIds}))`;
      } else if (teacherIds.length === 1) {
        this.query += ` AND l.id = (SELECT lesson_id from lesson_teachers WHERE teacher_id = ${teacherIds})`
      }
    }
    return this;
  }

  filterByStudentsCount(studentsCount) {
    if (studentsCount !== undefined) {
      const countRange = studentsCount.split(',');
      if (countRange.length === 1) {
        this.query += ` AND l.id IN (SELECT lesson_id FROM lesson_students GROUP BY lesson_id HAVING COUNT(*) = ${countRange[0]})`;
      } else if (countRange.length === 2) {
        this.query += ` AND l.id IN (SELECT lesson_id FROM lesson_students GROUP BY lesson_id HAVING COUNT(*) BETWEEN ${countRange[0]} AND ${countRange[1]})`;
      }
    }
    return this;
  }

  paginate(page, lessonsPerPage) {
    if (page !== undefined && lessonsPerPage !== undefined) {
      const offset = (page - 1) * lessonsPerPage;
      this.query += ` GROUP BY l.id ORDER BY l.id LIMIT ${lessonsPerPage} OFFSET ${offset}`;
    }
    return this;
  }

  build() {
    return this.query;
  }
}

module.exports = SelectQueryBuilder;