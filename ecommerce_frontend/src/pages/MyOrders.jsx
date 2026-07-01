import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchUserOrders = (page) => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userString);

    fetch(`http://localhost:5000/api/orders/${user.id}?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      })
      .catch((err) => console.error("Erro ao carregar encomendas:", err));
  };

  useEffect(() => {
    fetchUserOrders(1);
  }, [navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUserOrders(newPage);
    }
  };

  return (
    <div className="app-container orders-page-container">
      <h2>📋 As Minhas Encomendas</h2>

      {orders.length === 0 ? (
        <p>Ainda não realizaste nenhuma compra na TechStore. 🛒</p>
      ) : (
        <div className="orders-list-wrapper">
          {orders.map((order) => (
            <div key={order.id} className="order-user-card">
              <div className="order-user-header">
                <span>
                  <strong>Encomenda #{order.id}</strong>
                </span>
                <span className="order-user-date">Data: {new Date(order.criado_em).toLocaleDateString("pt-PT")}</span>
              </div>

              <div className="order-user-items-list">
                {order.itens.map((item, index) => (
                  <div key={index} className="order-user-item-row">
                    <div className="order-user-item-info">
                      <img src={`http://localhost:5000${item.imagem}`} alt="" className="order-user-item-img" />
                      <span>
                        {item.nome} x <strong>{item.quantidade}</strong>
                      </span>
                    </div>
                    <span>€{(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-user-footer">
                <span className="order-user-total-text">
                  Total Pago: <strong className="order-user-total-price">€{parseFloat(order.total).toFixed(2)}</strong>
                </span>
              </div>
            </div>
          ))}

          {/* CONTROLO DA PAGINAÇÃO DO CLIENTE ➡️ */}
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
              ⬅️ Anterior
            </button>

            <span>
              Página <strong>{currentPage}</strong> de {totalPages}
            </span>

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
              Seginte ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
