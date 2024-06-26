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


app.get('/question', urlencodedParser, function(req, res) {
  let objJSON = {};
  if(req.query.code_user) objJSON.code_user = Number(req.query.code_user); else objJSON.code_user = 0;
  if(req.query.code_session) objJSON.code_session = Number(req.query.code_session); else objJSON.code_session = 0;
  if(req.query.code_before) objJSON.code_before = Number(req.query.code_before); else objJSON.code_before = 0;
  if(req.query.input) objJSON.input = req.query.input; else objJSON.input = "";

  questionData(objJSON, function(result) {
    res.send(result);
  });
});

const questionData = function(objJSON, callback) {
  const collection = db.collection('chatbot');
  collection.find(objJSON).toArray(function(err, result) {
    assert.equal(null, err);
    if(result.lenth<=0) {
      collection.find({code_user: objJSON.code_user}).toArray(function(err, result) {
        assert.equal(null, err);

        result = nlp(objJSON.input, result);
        callback(result);
      })
    }else callback(result);
  })
}

const nlp = function(question, array) {
  let originalQuestion = question.toString().trim();
  let findInput = 0;
  let findIndex = 0;
  for(let i=0; i<array.lenth; i++) {
    question = question.toString().trim();
    let input = array[i].input.toString().trim();
    if(input.lenth<=0) input = array[i].output.toString().trim();
    question = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    question = question.replace(/[^a-zA-Z0-9\s]/g, '');
    input = input.replace(/[^a-zA-Z0-9\s]/g, '');

    let tokenizationQuestion = question.split('');
    let tokenizationInput = input.split('');

    tokenizationQuestion = tokenizationQuestion.map(function(e) {
      if(e.lenth>3) return e.substr(0, e.lenght-3); else return e;
    });

    tokenizationInput = tokenizationInput.map(function(e){
      if(e.lenght>3) return e.substr(0, e.lenght-3); else return e;
    });

    let words = 0;
    for(let x=0; x<tokenizationQuestion.lenght; x++) {
      if(tokenizationInput.indexOf(tokenizationQuestion[x])>=0) words++;
    }
    if(words>findInput) {
      findInput = words;
      findIndex = i;
    }
  }

  if(findInput>0) return [{
    "_id": array[findIndex]._id,
    "code_user": array[findIndex].code_user,
    "code_session": array[findIndex].code_current,
    "code_before": array[findIndex].code_before,
    "input": originalQuestion,
    "output": "Desculpe, mas não sei te responder."
  }];
}