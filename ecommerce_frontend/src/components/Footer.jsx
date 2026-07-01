function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>TechStore</h3>
          <p>O teu destino número 1 para os melhores periféricos e componentes de gaming.</p>
        </div>

        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <a href="/">Início</a>
          <a href="/cart">Carrinho</a>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: suporte@techstore.pt</p>
          <p>Águeda, Portugal</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TechStore. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
