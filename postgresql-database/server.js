require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("PostgreSQL connection error:", err));


function authenticateToken(req, res, next) {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.sendStatus(401); 
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); 
    }
    req.user = user;
    next();
  });
}


app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, passwordHash]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    
    if (err.code === '23505') {
      return res.status(409).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = userResult.rows[0];

    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

   
    const payload = {
      id: user.id,
      username: user.username
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId] 
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, priority } = req.body;
    
    const result = await pool.query(
      "INSERT INTO tasks (name, priority, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, priority, userId] 
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    const taskId = req.params.id;
    const { name, completed, priority } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET name=$1, completed=$2, priority=$3 WHERE id=$4 AND user_id=$5 RETURNING *",
      [name, completed || false, priority, taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found or user not authorized" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING *",
      [taskId, userId] 
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found or user not authorized" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
