require("./db/mongoose");
const Task = require("./models/task");

Task.findByIdAndDelete("5f58c887e9ab9cc221105067")
  .then((result) => {
    console.log(result);
    return Task.count({ completed: false });
  })
  .then((count) => console.log(count))
  .catch((error) => console.log(error));
