const express       = require('express');
const exphbs        = require('express-handlebars');
const app           = express();
const path          = require('path')
const db            = require('./db/connection');
const bodyParser    = require('body-parser');
const Job           = require('./models/job');
const Sequelize     = require('sequelize');
const Op            = Sequelize.Op;

const PORT = 4000;

app.listen(PORT, function() {
    console.log(`O express está rodando na porta ${PORT}`);
});

//using body parser
app.use(bodyParser.urlencoded({ extended: false}));

//hanlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'})); //onde ta o layout principal
app.set('view engine', 'handlebars'); //definindo é o framework utilizado para renderizar as views

//static folder
app.use(express.static(path.join(__dirname, 'public')));

// db connection
db
    .authenticate()
    .then(() => {
        console.log("conectou ao banco com sucesso");
    })
    .catch(err => {
        console.log("ocorreu um erro ao conectar", err);
    });

// routes
app.get('/', (req, res) => {

    let search = req.query.job; //quando a requisição é get ela nao vem do query
    let query  = ''+search+'%'; // PH -> PHP, WORD -> WORDPRESS

    if(!search) {
        Job.findAll({order: [
            ['createdAt', 'DESC']
        ]})
        .then(jobs => {
            res.render ('index', {
                jobs
            }) //renderiza o index para o arquivo handlebars que é o corpo do main
        })
        .catch(err => console.log(err));
    } else {
        Job.findAll({
            where: {title: {[Op.like]: query}},
            order: [
            ['createdAt', 'DESC']
        ]})
        .then(jobs => {
            res.render ('index', {
                jobs,search
            }); //renderiza o index para o arquivo handlebars que é o corpo do main
        })
        .catch(err => console.log(err));
    }
    

});

//jobs routes
app.use('/jobs', require('./routes/jobs'));