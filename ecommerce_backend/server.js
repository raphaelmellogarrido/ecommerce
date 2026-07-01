// 1. IMPORTAR AS FERRAMENTAS
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const bcrypt = require("bcrypt");
require("dotenv").config();

// 2. INICIALIZAR A APLICAÇÃO EXPRESS
const app = express();

// 3. CONFIGURAR OS MIDDLEWARES (AJUDANTES)
app.use(cors());
app.use(express.json());

// 4. CONFIGURAÇÃO DO UPLOAD DE IMAGENS (MULTER)
const uploadFolder = "./uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Tornar a pasta 'uploads' pública para o React conseguir aceder às imagens
app.use("/uploads", express.static("uploads"));

// 5. ROTAS DA API

// --- PRODUTOS ---

// Rota GET: Listar todos os produtos
app.get("/api/products", async (req, res) => {
  try {
    const [linhas] = await db.query("SELECT * FROM products");
    res.json(linhas);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    res.status(500).json({ erro: "Erro ao procurar os produtos no banco de dados." });
  }
});

// Rota GET: Listar encomendas globais com PAGINAÇÃO (Admin)
app.get("/api/admin/orders", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5; // Quantas encomendas por página
  const offset = (page - 1) * limit;

  try {
    // 1. Contar o total de encomendas únicas
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM orders");
    const totalOrders = countRows[0].total;
    const totalPages = Math.ceil(totalOrders / limit);

    if (totalOrders === 0) {
      return res.json({ orders: [], totalPages: 0, currentPage: page });
    }

    // 2. Buscar apenas os dados das ordens daquela página específica
    const ordersQuery = `
      SELECT o.id AS order_id, o.total, o.criado_em, u.nome AS cliente_nome, u.email AS cliente_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.criado_em DESC
      LIMIT ? OFFSET ?
    `;
    const [ordersRows] = await db.query(ordersQuery, [limit, offset]);

    if (ordersRows.length === 0) {
      return res.json({ orders: [], totalPages, currentPage: page });
    }

    const orderIds = ordersRows.map((o) => o.order_id);

    // 3. Buscar todos os itens que pertencem a estas ordens
    const itemsQuery = `
      SELECT oi.order_id, oi.quantidade, oi.preco_unitario, p.nome AS produto_nome
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)
    `;
    const [itemsRows] = await db.query(itemsQuery, [orderIds]);

    // 4. Mapear os itens dentro de cada ordem correspondente
    const ordersWithItems = ordersRows.map((order) => {
      return {
        id: order.order_id,
        cliente: order.cliente_nome,
        email: order.cliente_email,
        total: order.total,
        criado_em: order.criado_em,
        itens: itemsRows
          .filter((item) => item.order_id === order.order_id)
          .map((item) => ({
            nome: item.produto_nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
          })),
      };
    });

    res.json({
      orders: ordersWithItems,
      totalPages,
      currentPage: page,
    });
  } catch (erro) {
    console.error("Erro ao procurar encomendas paginadas:", erro);
    res.status(500).json({ erro: "Erro ao ligar à base de dados." });
  }
});

// Rota GET: Procurar um produto específico pelo ID
// Rota para buscar os detalhes de um produto específico
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const querySQL = "SELECT * FROM products WHERE id = ?";
    const [rows] = await db.query(querySQL, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.json(rows[0]); // Retorna apenas o produto encontrado
  } catch (erro) {
    console.error("Erro ao buscar detalhes do produto:", erro);
    res.status(500).json({ erro: "Erro ao ligar à base de dados." });
  }
});

// Rota GET: Histórico de encomendas de um utilizador específico com PAGINAÇÃO
app.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM orders WHERE user_id = ?", [userId]);
    const totalOrders = countRows[0].total;
    const totalPages = Math.ceil(totalOrders / limit);

    if (totalOrders === 0) {
      return res.json({ orders: [], totalPages: 0, currentPage: page });
    }

    const ordersQuery = `
      SELECT id AS order_id, total, criado_em
      FROM orders
      WHERE user_id = ?
      ORDER BY criado_em DESC
      LIMIT ? OFFSET ?
    `;
    const [ordersRows] = await db.query(ordersQuery, [userId, limit, offset]);

    if (ordersRows.length === 0) {
      return res.json({ orders: [], totalPages, currentPage: page });
    }

    const orderIds = ordersRows.map((o) => o.order_id);

    const itemsQuery = `
      SELECT oi.order_id, oi.quantidade, oi.preco_unitario, p.nome AS produto_nome, p.imagem AS produto_imagem
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)
    `;
    const [itemsRows] = await db.query(itemsQuery, [orderIds]);

    const userOrdersWithItems = ordersRows.map((order) => {
      return {
        id: order.order_id,
        total: order.total,
        criado_em: order.criado_em,
        itens: itemsRows
          .filter((item) => item.order_id === order.order_id)
          .map((item) => ({
            nome: item.produto_nome,
            imagem: item.produto_imagem,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
          })),
      };
    });

    res.json({
      orders: userOrdersWithItems,
      totalPages,
      currentPage: page,
    });
  } catch (erro) {
    console.error("Erro ao procurar histórico paginado do utilizador:", erro);
    res.status(500).json({ erro: "Erro ao ligar à base de dados." });
  }
});

// Rota POST: Adicionar um novo produto com upload de imagem e quantidade
app.post("/api/products", upload.single("imagem"), async (req, res) => {
  const { nome, preco, descricao, quantidade } = req.body;
  const imagemUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const querySQL = "INSERT INTO products (nome, preco, descricao, imagem, quantidade) VALUES (?, ?, ?, ?, ?)";
    await db.query(querySQL, [nome, preco, descricao, imagemUrl, quantidade || 0]);

    res.status(201).json({ mensagem: "Produto criado com sucesso! 🚀" });
  } catch (erro) {
    console.error("Erro ao inserir produto:", erro);
    res.status(500).json({ erro: "Erro ao salvar o produto no banco de dados." });
  }
});

// --- AUTENTICAÇÃO (UTILIZADORES) ---

// Rota POST: Registar um novo utilizador comum
app.post("/api/auth/register", async (req, res) => {
  const { nome, email, password } = req.body;

  try {
    const [userExists] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ erro: "Este email já está registado!" });
    }

    // Troca o nome da coluna de 'password' para o nome real (ex: senha) 👇
    const query = "INSERT INTO users (nome, email, senha, role) VALUES (?, ?, ?, ?)";
    await db.query(query, [nome, email, password, "user"]);

    res.status(201).json({ mensagem: "Utilizador registado com sucesso!" });
  } catch (erro) {
    console.error("Erro no registo do servidor:", erro);
    res.status(500).json({ erro: "Erro ao ligar à base de dados." });
  }
});

// Rota POST: Autenticar um utilizador (Login) - 🔥 CORRIGIDA SEGUNDA VERIFICAÇÃO
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Altera no SELECT também 👇
    const query = "SELECT id, nome, email, senha, role FROM users WHERE email = ?";
    const [rows] = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ erro: "Email ou palavra-passe incorretos." });
    }

    const user = rows[0];

    // 2. Compara usando o nome da coluna que veio do banco 👇
    if (user.senha !== password) {
      return res.status(400).json({ erro: "Email ou palavra-passe incorretos." });
    }

    res.json({
      mensagem: "Login efetuado com sucesso!",
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  } catch (erro) {
    console.error("Erro crítico no processo de login:", erro);
    res.status(500).json({ erro: "Erro interno no servidor ao tentar fazer login." });
  }
});

// Rota POST: Finalizar a compra (Checkout)
app.post("/api/checkout", async (req, res) => {
  const { userId, cart, total } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ erro: "O carrinho está vazio." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query("INSERT INTO orders (user_id, total) VALUES (?, ?)", [userId, total]);
    const orderId = orderResult.insertId;

    for (const item of cart) {
      const [prodCheck] = await connection.query("SELECT quantidade FROM products WHERE id = ?", [item.id]);
      if (prodCheck[0].quantidade < item.cartQuantity) {
        throw new Error(`Stock insuficiente para o produto: ${item.nome}`);
      }

      await connection.query("INSERT INTO order_items (order_id, product_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", [orderId, item.id, item.cartQuantity, item.preco]);
      await connection.query("UPDATE products SET quantidade = quantidade - ? WHERE id = ?", [item.cartQuantity, item.id]);
    }

    await connection.commit();
    res.status(201).json({ mensagem: "Encomenda processada com sucesso! 🚀", orderId });
  } catch (erro) {
    await connection.rollback();
    console.error("Erro no checkout:", erro);
    res.status(500).json({ erro: erro.message || "Erro interno ao processar o checkout." });
  } finally {
    connection.release();
  }
});

// Rota PUT: Atualizar os dados de um produto (Nome, Preço e Stock)
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, preco, quantidade, descricao } = req.body; // 🔥 1. Adicionada a descricao aqui

  if (!nome || nome.trim() === "") {
    return res.status(400).json({ erro: "O nome do produto não pode estar vazio." });
  }
  if (preco === undefined || isNaN(preco) || preco < 0) {
    return res.status(400).json({ erro: "Preço inválido." });
  }
  if (quantidade === undefined || isNaN(quantidade) || quantidade < 0) {
    return res.status(400).json({ erro: "Quantidade de stock inválida." });
  }
  // Validação opcional para a descrição não ir nula
  if (!descricao || descricao.trim() === "") {
    return res.status(400).json({ erro: "A descrição do produto não pode estar vazia." });
  }

  try {
    // 🔥 2. Atualizada a query SQL para incluir a descrição
    const querySQL = "UPDATE products SET nome = ?, preco = ?, quantidade = ?, descricao = ? WHERE id = ?";
    const [result] = await db.query(querySQL, [nome, parseFloat(preco), parseInt(quantidade), descricao, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.json({ mensagem: "Produto atualizado com sucesso! 📝✅" });
  } catch (erro) {
    console.error("Erro ao atualizar o produto:", erro);
    res.status(500).json({ erro: "Erro ao ligar à base de dados." });
  }
});

// 6. LIGAR O SERVIDOR
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Portão aberto! Servidor a rodar na porta ${PORT}`);
});
