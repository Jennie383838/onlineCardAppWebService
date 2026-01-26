// required packages
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

// server port
const port = process.env.PORT || 3000;

// database pool config
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
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
    "https://card-app-starter-z9o9.vercel.app",
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

// ---------- ROUTES ----------

// get all cards
app.get("/cards", async (req, res) => {
    try {
        const [rows] = await dbPool.query("SELECT * FROM cards");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching cards:", err);
        res.status(500).json({ message: "Server error - could not fetch cards" });
    }
});

// add a new card
app.post("/addcard", async (req, res) => {
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
        return res.status(400).json({ message: "card_name and card_pic are required" });
    }

    try {
        await dbPool.query(
            "INSERT INTO cards (card_name, card_pic) VALUES (?, ?)",
            [card_name, card_pic]
        );
        res.status(201).json({ message: "Card added successfully" });
    } catch (err) {
        console.error("Error adding card:", err);
        res.status(500).json({ message: "Server error - could not add card" });
    }
});

// update a card
app.put("/updatecard/:id", async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
        return res.status(400).json({ message: "card_name and card_pic are required" });
    }

    try {
        const [result] = await dbPool.query(
            "UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?",
            [card_name, card_pic, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.json({ message: "Card updated successfully", affectedRows: result.affectedRows });
    } catch (err) {
        console.error("Error updating card:", err);
        res.status(500).json({ message: "Server error - could not update card" });
    }
});

// delete a card
app.delete("/deletecard/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await dbPool.query("DELETE FROM cards WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.json({ message: "Card deleted successfully", affectedRows: result.affectedRows });
    } catch (err) {
        console.error("Error deleting card:", err);
        res.status(500).json({ message: "Server error - could not delete card" });
    }
});

// start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
