const express = require("express");
const cors = require("cors");
const { Pool } = require('pg')
require('dotenv').config();


const app = express()
app.use(express.json())
app.use(cors())



const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.connect()
    .then(() => console.log('Conexão bem-sucedida!'))
    .catch(err => console.error('Erro ao conectar ao banco de DDados:', err))


app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_login');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao executar a consulta', err.stack);
        res.status(500).send('Erro ao consultar o banco de dados');
    }
});

app.post('/signup', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    try {
        const result = await pool.query(`
            insert into user_login (firstname, lastname, email,password)
            values ($1, $2, $3, $4) returning *`,
            [firstname, lastname, email, password]
        );


        res.status(201).send(`Usuario "${result.rows[0].username}" cadastrado com sucesso`);
        console.log(result.rows[0])
    } catch (err) {
        console.error('Erro ao executar ao inserir', err.stack);
        res.status(500).send('Erro ao inserir no o banco de dados');
    }
});
app.post('/signin', async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    try {
        const result = await pool.query(
            'SELECT * FROM user_login WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            const hasProfile = await
                pool.query('SELECT * FROM user_login WHERE email = $1',
                    [email]
                )
            return hasProfile.rows.length === 0 ? res.status(404).send({id:0, msg:'Nenhum usuário encontrado.'}) : res.status(404).send({id:1, msg:'Senha incorreta'});
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.log('Error', err)
    }


});


app.get('/', async (req, res) => {
    res.json({
        saudacao: 'Olá Aurora Doree'
    })
})

app.listen(3535)