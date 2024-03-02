const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const path = require("path");
const app = express();
const assetsRouter = require("./server/assets-router");
app.use("/src", assetsRouter);

app.use(cors());
app.use(express.json());

var CONNECTION_STRING =
  "mongodb+srv://vergaraxy:SvkTloNOx4OmzJUy@verconsinventorymanagem.yzezpta.mongodb.net/inventoryapp?retryWrites=true&w=majority&appName=VerconsInventoryManagementApp";
var DATABASE_NAME = "inventoryapp";
var database;

app.get("/api/users", (req, res) => {
  const nameQuery = req.query.name;
  if (nameQuery) {
    database.collection("users")
      .find({ "name": { $regex: nameQuery, $options: 'i' } })
      .toArray((err, result) => {
        if (err) {
          console.error("Error fetching users:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        res.send(result);
      });
  } else {
    database.collection("users")
      .find({})
      .toArray((err, result) => {
        if (err) {
          console.error("Error fetching users:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        res.send(result);
      });
  }
});

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  database.collection("users")
    .findOne({ "_id": ObjectId(userId) }, (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.send(result);
    });
});

app.post("/api/users", (req, res) => {
  const newUser = req.body;
  database.collection("users").insertOne(newUser, (err, result) => {
    if (err) {
      console.error("Error adding new user:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(201).json({ message: "User added successfully", userId: result.insertedId });
  });
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  database.collection("users").updateOne({ "_id": ObjectId(userId) }, { $set: updatedUser }, (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json({ message: "User updated successfully", userId: userId });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  database.collection("users").deleteOne({ "_id": ObjectId(userId) }, (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json({ message: "User deleted successfully", userId: userId });
  });
});

app.delete("/api/users", (req, res) => {
  database.collection("users").deleteMany({}, (err, result) => {
    if (err) {
      console.error("Error deleting all users:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json({ message: "All users deleted successfully" });
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Online Market application." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }

    database = client.db(DATABASE_NAME);
    console.log("Connected to the database");

    console.log(`Server is listening on port ${PORT}`);
  });
});