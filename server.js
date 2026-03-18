// server.js
// const commonData = require("./common.js");
const setup = require("./routes/setup");
const commentJS = require("./comments.js");
const serverUtils = require("./serverUtils.js");
const path = require("path");
const { MongoClient } = require("mongodb");

const fs = require("fs");
const cors = require("cors");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");

// const mongoURL = process.env.mongoURL;
// console.log(mongoURL);
const mongoURL = `mongodb+srv://mikeb:Password123@cluster0.smk7bk1.mongodb.net/test?retryWrites=true&w=majority`;

const client = new MongoClient(mongoURL);
let chatHistoryTable;
let startDataTable;
const dbName = "test";

async function initDB() {
  await client.connect();
  const db = client.db(dbName);
  chatHistoryTable = db.collection("chatHistory"); // collection for chat messages
  startDataTable = db.collection("startData");     // collection for startData JSON format
}

initDB(); //.catch(console.error);

let chats = [
  { name: "Alice", message: "Hello again Bob!" },
  { name: "Bob", message: "Hi Alice, How are you?" }
];
let startData =
{
  "audio": "https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg",
  "trainer": "Mike Baradaran - mike.baradaran@qa.com",
  "course_title": "Design and DevOps",
  "code": "AEDXD3SE4M4",
  "pin": "4855725-18",
  "webex_email": "qa.webex026@qa.com",
  "material": "https://github.com/mikebaradaran/Mod4.git",
  "mimeo": "AEDXD3SE4M4",
  "pcs": [
    "https://www.gotomypc.com/sc/DC490DC64F5C055F3E63819CE77C847C",
    "https://www.gotomypc.com/sc/307DE551850E1F31350E919CE77CBC61",
    "https://www.gotomypc.com/sc/B4785EA4C87D438FFE3E619CE77CF66C",
    "https://www.gotomypc.com/sc/B7A933F48500536E4DC2919CE77D291D",
    "https://www.gotomypc.com/sc/FAED1F6FC836399E61FAE19CE77D6335",
    "https://www.gotomypc.com/sc/594FC4F264A2E591B171919CE77DA5A0",
    "https://www.gotomypc.com/sc/FC4226AB9A5295172333419CE77DE041",
    "https://www.gotomypc.com/sc/991A18E05DF791EC1373A19CE77E2B21",
    "https://www.gotomypc.com/sc/43CED8D5C85D7B77D565D19CE77E645D",
    "https://www.gotomypc.com/sc/E62C483FC8588C46C987219CE77EA6CE",
    "https://www.gotomypc.com/sc/D168B1B47DE8E19EFAFC419CE77F24A4",
    "https://www.gotomypc.com/sc/52953D359DB6D419692BD19CE77F6261",
    "https://www.gotomypc.com/sc/64AC676B830ED3B0E5CB719CE77FDD68",
    "https://www.gotomypc.com/sc/699354C836205DFA3DEDD19CE7805F47",
    "https://www.gotomypc.com/sc/962F69B40D801C195E32319CE7801526",
    "https://www.gotomypc.com/sc/21843321C6DC91F8182FF19CE7809E74",
    "https://www.gotomypc.com/sc/FD6A41B98B99220B0763519CE780D9F4",
    "https://www.gotomypc.com/sc/9D44DF0B0C78E7CB2B1B919CE7811419",
    ""
  ],
  "password1": "virtualroom16@qa.com",
  "password2": "QARemoteClassroom#11",
  "password3": "password7633",
  "students": [
    " Oliver",
    " Thomas",
    " James A",
    " Farzaneh",
    " Muhammad",
    " Jamie C",
    " George",
    " Benjamin C",
    " Kian",
    " Kevin ",
    " Benjamin H",
    " Christopher",
    " Oliver",
    " Jamie",
    " Deivis"
  ],
  "courseDuration": "3"
}

async function saveAll(res, table, data) {
  try {
    await table.deleteMany({});
    await table.insertMany(data);
    res.send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving chats");
  }
}
// Save chat array to MongoDB
app.get("/save", async (req, res) => {
  saveAll(res, chatHistoryTable, chats);
});
app.get("/start/save", async (req, res) => {
  saveAll(res, startDataTable, startData);
});

// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static("public"));

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// Middleware to make common data accessible in all views
// app.use((req, res, next) => {
//   res.locals.commonData = commonData;
//   next();
// });
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var messages = [];
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/student", (req, res) => {
  res.render("studentView");
});

app.get("/start", (req, res) => {
  res.render("start");
});
app.post("/startSubmit", (req, res) => {
  serverUtils.initApp(req, res, fs);
});

app.get("/start/Read", (req, res) => {
  let data = fs.readFileSync("data.json", "utf8");
  res.send(JSON.parse(data));
});

app.get('/start/edit', (req, res) => {
  const obj = {
    data: JSON.parse(fs.readFileSync("data.json", "utf8"))
  };
  res.render('startedit', obj);
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/chat/student", (req, res) => {
  res.render("chat_message_entry");
});
app.get("/chat/trainer", (req, res) => {
  res.render("chat_messages");
});
app.get("/chat/admin", (req, res) => {
  res.render("admin");
});

app.get("/chat/clear", (req, res) => {
  messages.forEach((m) => (m.body = ""));
  //doTrainerCommand({ name: "trainer", body: "clear" });
  res.render("index");
});

app.get("/comments", (req, res) => {
  res.render("comments");
});

app.get("/comments/Read", (req, res) => {
  res.send(fs.readFileSync("comments.txt", "utf8"));
});

app.get("/comments/Delete", (req, res) => {
  commentJS.deleteComments(fs);
  res.send("File deleted");
});

app.get("/comments/Read/names", (req, res) => {
  res.send(commentJS.getNames(fs));
});

// Handle the comment's form submission
app.post("/commentsSave", (req, res) => {
  commentJS.saveComments(req, fs);
  res.send("Thank you 👍 Your comments are saved.");
});

app.get("/customers", function (req, res) {
  res.send(serverUtils.getCustomers());
});

app.get("/customers/:id", function (req, res) {
  let id = req.params.id;
  var customers = serverUtils.getCustomers();
  var data = customers.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

app.get("/orders", function (req, res) {
  res.send(serverUtils.getOrders());
});

app.get("/products", function (req, res) {
  res.send(serverUtils.getProducts());
});

app.get("/orders/:id", function (req, res) {
  let id = req.params.id;
  var orders = serverUtils.getOrders();
  var data = orders.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});
//--------------------------------------------------------New code
["index", "game", "morning", "help", "timer", "login", "login", "getpcs"].forEach(view => {
  app.get(`/${view}`, (req, res) => res.render(view));
});

// --------------------- Drink server! -------------------
app.get('/server', (req, res) => {
  const drink = req.query.drink;
  const milk = req.query.milk;
  const sugar = req.query.sugar;
  res.send(`You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
});

app.post('/server', (req, res) => {
  const drink = req.body.drink;
  const milk = req.body.milk;
  const sugar = req.body.sugar;

  res.send(`POSTed: You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
});

// -------------------------------------------------------

function saveMessage(data) {
  const found = messages.find(
    (m) => m.name.toLowerCase() == data.name.toLowerCase()
  );

  if (found) found.body = data.body;
  else messages.push({ name: data.name, body: data.body });
  saveMessageHistory();
}

function saveMessageHistory() {
  // fs.writeFileSync(historyFile, JSON.stringify(messages, null, 2));
}

server.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is running!`);
  }
);

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    saveMessage(data);
    io.sockets.emit("message", messages);
  });
});
