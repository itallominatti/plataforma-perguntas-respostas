const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

// Database
connection.authenticate()
    .then(() => console.log("Conexão feita com o banco de dados"))
    .catch(console.log);

// Configurações
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rotas
app.get("/", async (req, res, next) => {
    try {
        const perguntas = await Pergunta.findAll({ raw: true, order: [['id', 'DESC']] });
        res.render("index", { perguntas });
    } catch (error) {
        next(error);
    }
});

app.get("/pergunta/:id", async (req, res, next) => {
    try {
        const pergunta = await Pergunta.findOne({ raw: true, where: { id: req.params.id } });
        
        if (pergunta) {
            const respostas = await Resposta.findAll({ where: { perguntaId: pergunta.id }, order: [['id', 'DESC']] });
            res.render("pergunta", { pergunta, respostas });
        } else {
           res.render("/404")
        }
    } catch (error) {
        next(error);
    }
});

app.post("/responder", async (req, res, next) => {
    try {
        const { corpo, pergunta: perguntaId } = req.body;
        await Resposta.create({ corpo, perguntaId });
        res.redirect(`/pergunta/${perguntaId}`);
    } catch (error) {
        next(error);
    }
});

app.get("/perguntar",(req, res) => {
    res.render("perguntar");
})

app.post("/salvarpergunta", async (req, res, next) => {
    try {
        const { titulo, descricao } = req.body;
        await Pergunta.create({ titulo, descricao });
        res.redirect("/");
    } catch (error) {
        next(error);
    }
});


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

app.listen(8080, () => console.log("App rodando!"));
