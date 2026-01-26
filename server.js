// required packages
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

// server port
const port = 3000;

// database pool config
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
});

// initialize express app
const app = express();

// middleware
app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",
    "https://card-app-starter-z9o9.vercel.app/",
    "https://onlinecardappwebservice-iu6e.onrender.com",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// routes

// get all cards
app.get("/cards", async (req, res) => {
    try {
        const [rows] = await dbPool.execute("SELECT * FROM cards");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not fetch cards" });
    }
});

// add a new card
app.post("/addcard", async (req, res) => {
    const { card_name, card_pic } = req.body;
    try {
        await dbPool.execute(
            "INSERT INTO cards (card_name, card_pic) VALUES (?, ?)",
            [card_name, card_pic]
        );
        res.status(201).json({ message: "Card added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not add card" });
    }
});

// update a card
app.put("/updatecard/:id", async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try {
        await dbPool.execute(
            "UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?",
            [card_name, card_pic, id]
        );
        res.json({ message: "Card updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error - could not update card" });
    }
});

// delete a card
app.delete("/deletecard/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await dbPool.execute("DELETE FROM cards WHERE id = ?", [id]);
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
