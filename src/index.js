const express = require("express");
require("./db/mongoose");
const { update } = require("./models/user");
const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

const Task = require("./models/task");

const app = express();
PORT = process.env.PORT;

// app.use((req, res, next) => {
//   res.status(503).send("Site under maintainence. Come back later.");
//  });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// const jwt = require("jsonwebtoken");
// const myFunction = async () => {
//   const token = jwt.sign({ _id: "2jahfjk" }, "newcourse");
//   console.log(token);
// };

// myFunction();

app.listen(PORT, () => {
  console.log("server is up on port ", PORT);
});

// const pet = {
//   name: "cat",
//   age: "5",
//   color: "brown",
// };

// pet.toJSON = function () {
//   delete this.color;
//   return this;
// };

// console.log(JSON.stringify(pet));
