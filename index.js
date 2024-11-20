const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;

app.use(express.json());

const SECRET_KEY = "your_secret_key";

let users = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
  },
  {
    id: 2,
    username: "user2",
    email: "user2@example.com",
    password: "password2",
  },
];

function generateToken(user) {
  return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
}
// middleware
function authenticateJWT(req, res, next) {
  const token = req.headers["authorization"];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.put("/update-email", authenticateJWT, (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.email = newEmail;
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.delete("/delete-account", authenticateJWT, (req, res) => {
  const userId = req.user.id;
  users = users.filter((u) => u.id !== userId);
  res.json({ message: "Account successfully deleted" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
