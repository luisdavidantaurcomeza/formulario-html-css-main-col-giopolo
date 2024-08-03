const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuração do body-parser para processar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da conexão com o PostgreSQL usando postgres
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

// Teste de conexão com o banco de dados
async function getPgVersion() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Conexão com o banco de dados bem-sucedida:', result);
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
}

getPgVersion();

// Configurar o middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Workshop.html'));
});

// Rota para lidar com o envio do formulário
app.post('/submit', async (req, res) => {
  const { nome, email, telefone, genero, data_nascimento, turma } = req.body;

  // Verificando se todos os campos estão presentes
  if (!nome || !email || !telefone || !genero || !data_nascimento || !turma) {
    console.error('Erro: Todos os campos do formulário devem ser preenchidos');
    return res.send('Erro: Todos os campos do formulário devem ser preenchidos');
  }

  try {
    const query = 'INSERT INTO participantes (nome, email, telefone, genero, data_nascimento, turma) VALUES ($1, $2, $3, $4, $5, $6)';
    await sql.unsafe(query, [nome, email, telefone, genero, data_nascimento, turma]);
    res.send('Dados inseridos com sucesso!');
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.send('Erro ao inserir dados');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});