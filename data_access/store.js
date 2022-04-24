const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const connectionString =
  `postgres://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.DATABASEPORT}/${process.env.DATABASE}`;

const conection = {
  connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
  ssl: { rejectUnauthorized: false }
}

const pool = new Pool(conection);

let store = {

  addCustomer: (name, email, password) => {
    const hash = bcrypt.hashSync(password, 10);
    return pool.query(`insert into imagequiz.customer (name, email, password) values ($1, $2, $3)
    on conflict (email) do nothing returning id;`, [name, email, hash]);
  },

  login: (email, password) => {
    return pool.query("select name, email, password from imagequiz.customer where email = $1", [email])
    .then(x => {
      if (x.rows.length == 1) {
        let valid = bcrypt.compareSync(password, x.rows[0].password);
        if (valid) {
          return {valid: true};
        } else {
          return {valid: false, message: "Credentials are not valid."};
        }
      } else {
        return {valid: false, message: "Email not found."};
      }
    });
  },

  getFlowers: () => {
    return pool.query(`select * from imagequiz.flowers`)
    .then(x => {
      let quiz = x.rows.map(y => {
        return {name: y.name, picture: y.picture}
      })
      return quiz;
    });
  },

  getQuiz: (name) => {
    let sqlQuery = `select q.id as quiz_id, q2.*  from imagequiz.quiz q join imagequiz.quiz_question qq on q.id = qq.quiz_id
	  join imagequiz.question q2 on qq.question_id = q2.id
	  where lower(q.name) = $1`;

    return pool.query(sqlQuery, [name.toLowerCase()])
    .then(x => {
      let quiz;

      if (x.rows.length > 0) {
        quiz = {
          id: x.rows[0].quiz_id,
          questions: x.rows.map(y => {
            return {id: y.id, picture: y.picture, choices: y.choices, answer: y.answer}
            })
        };
      }
      return quiz;
    });
  },

checkScore: (quizTaker, quizName) => {
  return pool.query(`select q.id as user_id, qq.id as quiz_id from imagequiz.customer
  q join imagequiz.quiz qq on lower(q.email) = $1 and lower(qq.name) = $2`, [quizTaker.toLowerCase(), quizName.toLowerCase()])
  .then(x => {
      console.log(x);
      if (x.rows.length > 0) {
          return {done: true, result: x, message:"Score successfully added!"}
      } else {
          return {done: false, result:undefined, message: "Quiz or Taker do not exist!"};
      }
  })
},

addScore: (quizTaker, quizName, score) => {
    return pool.query(`insert into imagequiz.score (quiz_id, customer_id, score, date)
    values ($1, $2, $3, current_timestamp) returning id`, [quizName, quizTaker, score]);
},

getScores: (quizTaker, quizName) => {
    return pool.query(`select score from imagequiz.customer
    q join imagequiz.quiz qq on lower(q.name) = $1 and lower(qq.name) = $2
    join imagequiz.score q2 on q2.customer_id = q.id and q2.quiz_id = qq.id`, [quizTaker.toLowerCase(), quizName.toLowerCase()]);
  }
}

module.exports = { store };
