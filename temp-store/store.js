const bcrypt = require("bcrypt");
let { customers } = require("./customers");
let { quizzes } = require("./data");
let { flowers } = require("./flowers");
let { scores } = require("./scores");

let store = {

  addCustomer: (name, email, password) => {
    let customer = customers.find(
      x => x.email.toLowerCase() === email.toLowerCase());

    if (customer) {
      return {valid: false};
    } else {
      const hash = bcrypt.hashSync(password, 10);
      customers.push(
        {id: 1, name: name, email: email, password: hash});
      return {valid: true};
    }
  },

  login: (email, password) => {
    let customer = customers.find(
      x => x.email.toLowerCase() === email.toLowerCase());
    if (customer) {
      let valid = bcrypt.compareSync(password, customer.password);
      if (valid) {
        return {valid: true};
      } else {
        return {valid: false, message: "Credentials are not valid."};
      }
    } else {
      return {valid: false, message: "Email not found."};
    }
  },

  getFlowers: () => {
    return {done: true, flowers, message: "Got all flowers"};
  },

  getQuiz: (id) => {
    let quiz =  quizzes.find(x => x.name.toLowerCase() === id.toLowerCase());
    if (quiz) {
      return {done: true, quiz};
    } else {
      return {done: false, message: "No quiz with this name found!"}
    }
  },

  addScore: (quizTaker, quizName, score) => {
    scores.push(
      {quizTaker: quizTaker, quizName: quizName, score: score});
  },

  getScores: (quizTaker, quizName) => {
    let ret = []

    for (i = 0; i < scores.length; i++ ) {
      if (scores[i].quizTaker === quizTaker & scores[i].quizName === quizName) {
        ret.push(scores[i]);
      }
    }

    if (ret.length > 0) {
      return {done: true, ret, message: "All scores of quiz found for quiz taker!"};
    } else {
      return {done: false, message: "No quiz with this name found!"}
    }
  }
}

module.exports = { store };
