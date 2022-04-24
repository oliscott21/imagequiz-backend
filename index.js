//dependacies
const express = require("express");
let { store } = require("./data_access/store");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 4002;

//middlewares
app.use(express.json());
app.use(cors());

//methods
app.get("/", (request, response) => {
    response.status(200).json({done: true, message: "Fine"});
});

app.post("/register", (request, response) => {
    let name = request.body.name;
    let email = request.body.email;
    let password = request.body.password;

    store.addCustomer(name, email, password)
    .then(x => {
        if (x.rows.length > 0) {
              response.status(201).json({done: true, result: "Customer added successfully!"});
          } else {
              response.status(403).json({done: false, result: "Customer already exists!"});
          }
      }
    )
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});

app.post("/login", (request, response) => {
    let email = request.body.email;
    let password = request.body.password;

    store.login(email, password)
    .then(x => {
      if (x.valid) {
        response.status(200).json(
          {done: true, message: "Customer logged in successfully!"});
      } else {
        response.status(401).json(
          {done: false, message: x.message});
      }
    })
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});

app.get("/flowers", (request, response) => {
    store.getFlowers()
    .then(x => {
      response.status(200).json(
        {done: true, result: x, message: "Got all flowers"});
    })
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});

app.get("/quiz/:name", (request, response) => {
    let name = request.params.name;
    store.getQuiz(name)
    .then(x => {
        if (x) {
          response.status(200).json(
            {done: true, result: x, message: "A quiz with this name was found"});
        } else {
          response.status(404).json(
            {done: false, result: undefined, message: "No quiz with this name found!"});
        }
    })
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});
//

app.post("/score", (request, response) => {
    let quizTaker = request.body.quizTaker;
    let quizName = request.body.quizName;
    let score = request.body.score;

    store.checkScore(quizTaker)
    .then(x => {
        console.log(1);
        store.addScore(x.rows[0].user_id, quizName, score)
        .then(y => {
            if (y.rows.length > 0){
                response.status(201).json({done: true, message: "Score added successfully!"});
            }
        })
    })
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});

app.get("/scores/:quiztaker/:quizname", (request, response) => {
    let quizTaker = request.params.quiztaker;
    let quizName = request.params.quizname;

    store.getScores(quizTaker, quizName)
    .then(x => {
      if (x.rows.length > 0) {
        response.status(201).json({done: true, result: x.rows , message: "All quizes found of this name for user!"});
      } else {
        response.status(404).json(
          {done: false, result: [], message: "No quizes of this name found for the user"});
      }
    })
    .catch(e => {
      console.log(e);
      response.status(500).json({done: false, message: "Something went wrong."});
    });
});

app.listen(port, () => {
    console.log("Listening to port 4002");
});
