const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const bodyParser = require("body-parser");

let db = null;
const url = "mongodb://localhost:27017";
const dbName = "chatbotdb";

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  assert.equal(null, err);
  console.log("banco de dados conectado com sucesso.");

  db = client.db(dbName);
});

app.listen(3000);
console.log("servidor rodando em: localhost: 3000");

app.post("/insert", urlencodedParser, function (req, res) {
  //Através desse post o usuário será capaz de inserir dados ao nosso cadastro.
  let objJSON = {};
  if (req.body.code_user) objJSON.code_user = req.body.code_user;
  // Verifica se o usuário contratou o serviço de chatbot
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

function cod() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();
  const hora = data.getHours();
  const minuto = data.getMinutes();
  const segundo = data.getSeconds();
  const milesegundos = data.getMilliseconds();
  const result = parseInt(
    Number(
      ano +
        "" +
        mes +
        "" +
        dia +
        "" +
        hora +
        "" +
        minuto +
        "" +
        segundo +
        "" +
        milesegundos
    ) / 2
  );
  return result;
}

app.post("/update", urlencodedParser, function (req, res) {
  let objJSON = {};
  if (req.body.code_user) objJSON.code_user = req.body.code_user;
  if (req.body.code_session) objJSON.code_session = req.body.code_session;
  if (req.body.code_current) objJSON.code_current = req.body.code_current;
  if (req.body.code_before) objJSON.code_before = req.body.code_before;
  if (req.body.input) objJSON.input = req.body.input;
  if (req.body.output) objJSON.output = req.body.output;

  updateData(objJSON, function (result) {
    res.send(result);
  });
});

app.post("/delete", urlencodedParser, function (req, res) {
  let objJSON = {};
  if (req.body.code_user) objJSON.code_user = req.body.code_user;
  if (req.body.code_session) objJSON.code_session = req.body.code_session;
  if (req.body.code_current) objJSON.code_current = req.body.code_current;
  if (req.body.code_before) objJSON.code_before = req.body.code_before;
  if (req.body.input) objJSON.input = req.body.input;
  if (req.body.output) objJSON.output = req.body.output;

  deleteData(objJSON, function (result) {
    res.send(result);
  });
});

app.post("/find", urlencodedParser, function (req, res) {
  let objJSON = {};
  if (req.body.code_user) objJSON.code_user = req.body.code_user;
  if (req.body.code_session) objJSON.code_session = req.body.code_session;
  if (req.body.code_current) objJSON.code_current = req.body.code_current;
  if (req.body.code_before) objJSON.code_before = req.body.code_before;
  if (req.body.input) objJSON.input = req.body.input;
  if (req.body.output) objJSON.output = req.body.output;

  findData(objJSON, function (result) {
    res.send(result);
  });
});

const insertData = function (objJSON, callback) {
  const collection = db.collection("chatbot");
  collection.insertOne(objJSON, function (err, result) {
    assert.equal(null, err);
    callback(result);
  });
};

const updateData = function (objJSON, callback) {
  const collection = db.collection("chatbot");
  const code_current = objJSON.code_current;
  collection.updateOne(
    { code_current: code_current },
    { $set: objJSON },
    function (err, result) {
      assert.equal(null, err);
      callback(result);
    }
  );
};

const deleteData = function (objJSON, callback) {
  const collection = db.collection("chatbot");
  collection.deleteOne(objJSON, function (err, result) {
    assert.equal(null, err);
    callback(result);
  });
};

const findData = function (objJSON, callback) {
  const collection = db.collection("chatbot");
  collection.find(objJSON).toArray(function (err, result) {
    assert.equal(null, err);
    callback(result);
  });
};
