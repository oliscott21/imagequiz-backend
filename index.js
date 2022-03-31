//dependacies
const express = require("express");
let { store } = require("./temp-store/store");

const app = express();
const port = process.env.PORT || 4002;

//middlewares
app.use(express.json());

//methods
app.get("/", (request, response) => {
    response.status(200).json({done: true, message: "Fine!"});
});

app.post("/register", (request, response) => {
    let name = request.body.name;
    let email = request.body.email;
    let password = request.body.password;

    let result = store.addCustomer(name, email, password);

    if (result.valid) {
      response.status(200).json(
        {done: true, message: "Customer was added successfully!"});
    } else {
      response.status(409).json(
        {done: false, message: "Customer already exists!"});
    }
});

app.post("/login", (request, response) => {
    let email = request.body.email;
    let password = request.body.password;

    let result = store.login(email, password);

    if (result.valid) {
      response.status(200).json(
        {done: true, message: "Customer logged in successfully!"});
    } else {
      response.status(401).json(
        {done: false, message: result.message});
    }
});

app.get("/flowers", (request, response) => {
    let result = store.getFlowers();
    response.status(200).json(
      {done: true, result: result.flowers, message: result.message});
    return {"done": "true"};
});

app.get("/quiz/:id", (request, response) => {
    let id = request.params.id;
    let result = store.getQuiz(id);
    if (result.done) {
      response.status(200).json(
        {done: true, result: result.quiz, message: "A quiz with this name was found"});
    } else {
      response.status(404).json(
        {done: false, result: undefined, message: result.message});
    }
});

app.post("/score", (request, response) => {
    let quizTaker = request.body.quizTaker;
    let quizName = request.body.quizName;
    let score = request.body.score;

    store.addScore(quizTaker, quizName, score);

    response.status(200).json(
      {done: true, message: "Score added successfully!"});
});

app.get("/scores/:quiztaker/:quizname", (request, response) => {
    let quizTaker = request.params.quiztaker;
    let quizName = request.params.quizname;

    let result = store.getScores(quizTaker, quizName);

    if (result.done) {
      response.status(200).json(
        {done: true, result: result.ret, message: result.message});
    } else {
      response.status(404).json(
        {done: false, result: undefined, message: result.message});
    }
});

app.listen(port, () => {
    console.log("Listening to port 4002");
});
