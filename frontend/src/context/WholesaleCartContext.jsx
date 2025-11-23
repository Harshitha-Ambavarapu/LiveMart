import { createContext, useContext, useState } from "react";

const WholesaleCartContext = createContext();

export const WholesaleCartProvider = ({ children }) => {
  const [wholesaleItems, setWholesaleItems] = useState([]);

  // Add item to wholesale cart
  const addWholesaleItem = (product, quantity = 1, markup = 0) => {
    setWholesaleItems(prev => {
      const existing = prev.find(item => item._id === product._id);

      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
    
      return [
        ...prev,
        {
          ...product,
          quantity,
          markup,
        },
      ];
    });
  };

  // Remove item
  const removeItem = (id) => {
    setWholesaleItems(prev => prev.filter(item => item._id !== id));
  };

  // Clear cart
  const clearCart = () => setWholesaleItems([]);

  return (
    <WholesaleCartContext.Provider
      value={{
        wholesaleItems,
        addWholesaleItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </WholesaleCartContext.Provider>
  );
};

export const useWholesaleCart = () => useContext(WholesaleCartContext);
