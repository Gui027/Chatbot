const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const bodyParser = require("body-parser");

let db = null;
const url = "mongodb://localhost:27017";
const dbName = "chatbotdb";

const jsonParser = bodyParser.json();
const urlencodeParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodeParser);

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  assert.equal(null, err);
  console.log("banco de dados conectado com sucesso.");

  db = client.db(dbName);
});

app.listen(3000);
console.log("servidor rodando em: localhost: 3000");

app.post("/insert", urlencodesParser, function (req, res) {
  let objJSON = {};
  if (req.body.code_user) objJSON.code_user = req.body.code_user;
  else objJSON.code_user = 0;
  if (req.body.code_session) objJSON.code_session = req.body.code_session;
  else objJSON.code_session = 0;
  if (req.body.code_current) objJSON.code_current = req.body.code_current;
  else objJSON.code_current = cod();
  if (req.body.code_before) objJSON.code_before = req.body.code_before;
  else objJSON.code_before = 0;
  if (req.body.input) objJSON.input = req.body.input;
  else objJSON.input = "";
  if (req.body.output) objJSON.output = req.body.output;
  else objJSON.output = "Desculpe, mas não entendi.";

  insertData(objJSON, function (result) {
    res.send(result);
  });
});
