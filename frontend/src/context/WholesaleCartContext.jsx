import { createContext, useContext, useState } from "react";

const WholesaleCartContext = createContext();

export const WholesaleCartProvider = ({ children }) => {
  const [wholesaleItems, setWholesaleItems] = useState([]);

  // Add item with quantity & markup
  const addItem = (product, quantity = 1, markup = 0) => {
    setWholesaleItems((prev) => {
      const existing = prev.find((p) => p._id === product._id);

      if (existing) {
        return prev.map((p) =>
          p._id === product._id
            ? { ...p, quantity: p.quantity + quantity, markup }
            : p
        );
      }

      return [...prev, { ...product, quantity, markup }];
    });
  };

  // remove item
  const removeItem = (id) => {
    setWholesaleItems((prev) => prev.filter((p) => p._id !== id));
  };

  // clear entire wholesale cart
  const clearCart = () => setWholesaleItems([]);

  return (
    <WholesaleCartContext.Provider
      value={{
        wholesaleItems,
        addItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </WholesaleCartContext.Provider>
  );
};

export const useWholesaleCart = () => useContext(WholesaleCartContext);
