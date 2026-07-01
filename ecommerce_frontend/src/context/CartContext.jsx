import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 1. Adicionar / Aumentar Quantidade (Já tinhas esta)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.cartQuantity >= product.quantidade) {
          alert("Quantidade máxima em stock atingida! ⚠️");
          return prevCart;
        }
        return prevCart.map((item) => (item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
      }
      return [...prevCart, { ...product, cartQuantity: 1 }];
    });
  };

  // 2. Diminuir Quantidade (Se chegar a 0, remove do carrinho)
  const decreaseQuantity = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);

      if (existingItem.cartQuantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      }

      return prevCart.map((item) => (item.id === productId ? { ...item, cartQuantity: item.cartQuantity - 1 } : item));
    });
  };

  // 3. Remover o produto completamente (Botão de Eliminar)
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((total, item) => total + item.cartQuantity, 0);

  return <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, totalItems }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
