const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const fs = require("fs").promises;
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getDBConnection = async () => {
  const db = await sqlite.open({
    filename: "database/product.db", // database name
    driver: sqlite3.Database,
  });
  return db;
};

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/pages/signup.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/pages/login.html");
});

app.get("/movies", (req, res) => {
  res.sendFile(__dirname + "/public/pages/movies.html");
});

app.get("/api/movies", async (req, res) => {
  const db = await getDBConnection();
  const rows = await db.all("SELECT * FROM movie");
  await db.close();
  res.json(rows);
});

app.get("/api/movies/:id", async (req, res) => {
  const db = await getDBConnection();
  const rows = await db.all("SELECT * FROM movie WHERE movie_id = ?", [
    req.params.id,
  ]);
  await db.close();
  res.json(rows);
});

app.get("/api/comments/:id", async (req, res) => {
  fs.readFile("database/comment.json", "utf8").then((data) => {
    res.json(
      JSON.parse(data).filter((comment) => comment.movie_id === req.params.id)
    );
  });
});

app.post("/api/comments/:id", async (req, res) => {
  fs.readFile("database/comment.json", "utf8")
    .then((data) => {
      const comments = JSON.parse(data);
      comments.push({ movie_id: req.params.id, comment: req.body.comment });
      fs.writeFile("database/comment.json", JSON.stringify(comments));
    })
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      res.status(500).send();
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
