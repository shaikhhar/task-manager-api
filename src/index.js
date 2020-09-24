const app = require("./app");
PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server is up on port ", PORT);
});
