import { useState, useEffect } from "react";

function AdminPanel() {
  const [newProduct, setNewProduct] = useState({ nome: "", preco: "", descricao: "", quantidade: "" });
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  };

  const fetchAdminOrders = (page) => {
    fetch(`http://localhost:5000/api/admin/orders?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setAdminOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      })
      .catch((err) => console.error("Erro ao buscar encomendas:", err));
  };

  useEffect(() => {
    fetchProducts();
    fetchAdminOrders(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) fetchAdminOrders(newPage);
  };

  const handleChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nome", newProduct.nome);
    formData.append("preco", newProduct.preco);
    formData.append("descricao", newProduct.descricao);
    formData.append("quantidade", newProduct.quantidade);
    if (image) formData.append("imagem", image);

    try {
      const res = await fetch("http://localhost:5000/api/products", { method: "POST", body: formData });
      if (res.ok) {
        alert("Produto adicionado com sucesso! 🎉");
        setNewProduct({ nome: "", preco: "", descricao: "", quantidade: "" });
        setImage(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (id, produtoAtualizado) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: produtoAtualizado.nome,
          preco: parseFloat(produtoAtualizado.preco),
          quantidade: parseInt(produtoAtualizado.quantidade),
          descricao: produtoAtualizado.descricao,
        }),
      });
      if (res.ok) {
        alert("Produto atualizado com sucesso! 💾🔥");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mantivemos a tua função original para que o código seja familiar
  const handleTableInputChange = (id, campo, valor) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  return (
    <div className="admin-container">
      <h2>Painel Administrativo</h2>

      <div className="admin-card">
        <h3>Adicionar Novo Produto</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <input type="text" name="nome" placeholder="Nome" value={newProduct.nome} onChange={handleChange} required />
          <input type="number" step="0.01" name="preco" placeholder="Preço (€)" value={newProduct.preco} onChange={handleChange} required />
          <input type="number" name="quantidade" placeholder="Stock" value={newProduct.quantidade} onChange={handleChange} required />
          <input type="file" onChange={handleImageChange} required />
          <textarea name="descricao" placeholder="Descrição" value={newProduct.descricao} onChange={handleChange} required></textarea>
          <button type="submit" className="btn-save">
            Salvar Produto
          </button>
        </form>
      </div>

      <div className="admin-inventory-section">
        <h3>Gestão de Produtos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Imagem</th>
                <th className="compact-input">Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Stock</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={`http://localhost:5000${p.imagem}`} alt="" className="prod-img" />
                  </td>
                  <td>
                    <input type="text" value={p.nome} onChange={(e) => handleTableInputChange(p.id, "nome", e.target.value)} />
                  </td>
                  <td>
                    <textarea value={p.descricao || ""} onChange={(e) => handleTableInputChange(p.id, "descricao", e.target.value)} style={{ width: "250px", height: "80px", resize: "vertical" }} />
                  </td>
                  <td>
                    <input type="number" value={p.preco} onChange={(e) => handleTableInputChange(p.id, "preco", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={p.quantidade} onChange={(e) => handleTableInputChange(p.id, "quantidade", e.target.value)} />
                  </td>
                  <td>
                    <button onClick={() => handleUpdateProduct(p.id, p)} className="btn-update">
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-orders-section">
        <h3>Histórico Global de Vendas</h3>
        {adminOrders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <strong>Encomenda #{order.id}</strong> —<span className="user-historico">Cliente: {order.cliente}</span>
              <span>{new Date(order.criado_em).toLocaleString()}</span>
            </div>
            <div className="order-items">
              {order.itens.map((item, idx) => (
                <div key={idx}>
                  • {item.nome} x {item.quantidade}
                </div>
              ))}
            </div>
            <div className="order-total">Total: €{parseFloat(order.total).toFixed(2)}</div>
          </div>
        ))}

        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Seguinte
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
