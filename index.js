const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configura o middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Configuração do Pool para conectar ao PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // URL do banco fornecida pelo Coolify
});

// Testar conexão ao banco
pool.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.stack);
    } else {
        console.log('Conexão ao banco estabelecida com sucesso!');
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de teste está rodando!');
});

// Criar um novo usuário
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Listar todos os usuários
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Buscar um usuário por ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Atualizar um usuário
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Excluir um usuário
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
