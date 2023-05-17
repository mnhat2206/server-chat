const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connectDB = require("./config/db");
const authRouter = require("./routers/AuthRouter");
const messagesRouter = require("./routers/MessagesRouter");
const usersRouter = require("./routers/UsersRoute");
const verifyAuthenToken = require("./middleware/verifyAuthenToken");
const MessagesModel = require("./model/Messages");
const { connect } = require("mongoose");

const port = 4040;
const app = express();

const configCors = {
  origin: ["http://localhost:5173", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(configCors));
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// connect mongo db
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("/api", verifyAuthenToken);
app.use("/api", authRouter);
app.use("/api", messagesRouter);
app.use("/api", usersRouter);

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const CHECK_TOKEN_EXPIRED = "TokenExpiredError";

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const notifyAboutOnlinePeople = () => {
    return [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            username: c.username,
            userId: c.userId,
          })),
        })
      );
    });
  };

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connect.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    console.log("pong");
    clearTimeout(connect.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const token = cookies.split("; ");
    if (token) {
      const accessToken = token[0].split("=")[1];
      jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, userData) => {
        if (err) {
          throw err.message;
        }
        const { userId, username } = userData;
        connection.username = username;
        connection.userId = userId;
      });
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let fileName = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      fileName = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + fileName;
      const bufferData = Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved:" + path);
      });
    }
    if (recipient && (text || file)) {
      const messagesDoc = await MessagesModel.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? fileName : null,
      });
      [...wss.clients]
        .filter((u) => u.userId === recipient)
        .forEach((p) =>
          p.send(
            JSON.stringify({
              _id: messagesDoc._id,
              sender: connection.userId,
              recipient,
              text,
              file: file ? fileName : null,
            })
          )
        );
    }
  });

  // notifyAboutOnlinePeople
  notifyAboutOnlinePeople();
});

// GGmrwgSwBsw1R5dH
