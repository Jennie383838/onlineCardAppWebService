import cors from "cors";

app.use(cors({
    origin: "http://localhost:3000"
}));
// include required packages
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const port = 3000;

// database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
};

// initialize app
const app = express();

// middleware
app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",
    "https://card-app-starter-z9o9-hemyf1rqh-xavier-thongs-projects.vercel.app",
    "https://onlinecardappwebservice-iu6e.onrender.com"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// routes

app.get("/allcards", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT * FROM cards");
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error for allcards" });
    }
});

app.get("/cards", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT * FROM cards");
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error for cards" });
    }
});

app.post("/addcard", async (req, res) => {
    const { card_name, card_pic } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            "INSERT INTO cards (card_name, card_pic) VALUES (?, ?)",
            [card_name, card_pic]
        );
        await connection.end();
        res.status(201).json({ message: "Card added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not add card" });
    }
});

app.put("/updatecard/:id", async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            "UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?",
            [card_name, card_pic, id]
        );
        await connection.end();
        res.json({ message: "Card updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not update card" });
    }
});

app.delete("/deletecard/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute("DELETE FROM cards WHERE id = ?", [id]);
        await connection.end();
        res.json({ message: "Card deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not delete card" });
    }
});

// start server
app.listen(port, () => {
    console.log("Server started on port " + port);
});
