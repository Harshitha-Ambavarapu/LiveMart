// frontend/src/context/WholesaleCartContext.jsx
import { createContext, useContext, useState } from "react";

const WholesaleCartContext = createContext();

/**
 * Wholesale cart provider:
 * - wholesaleItems: array of products with quantity & markup
 * - addWholesaleItem(productOrId, quantity = 1, markup = 0)
 *     accepts either a product object or a productId string
 *     returns a Promise so callers can await it
 * - addToCart alias kept for compatibility with ProductCard usage
 * - removeFromCart alias added to match naming in main CartContext
 */
export const WholesaleCartProvider = ({ children }) => {
  const [wholesaleItems, setWholesaleItems] = useState([]);

  const resolveProductId = (productOrId) => {
    if (!productOrId) return null;
    return typeof productOrId === "string" ? productOrId : productOrId._id;
  };

  /**
   * Add item to wholesale cart.
   * Returns a Promise that resolves once state update is scheduled.
   *
   * Usage:
   *   await addWholesaleItem(product, 1, 0);
   *   navigate('/checkout');
   *
   * Supports product object or productId string.
   */
  const addWholesaleItem = (productOrId, quantity = 1, markup = 0) => {
    const productId = resolveProductId(productOrId);

    // If caller passed only productId (string), we can't store the full product
    // locally unless the caller also provides a product object. For robust behavior,
    // prefer calling with the full product object. If only id is passed, we push
    // a minimal placeholder with _id and quantity.
    return new Promise((resolve) => {
      setWholesaleItems((prev) => {
        // If full object was provided, keep it; otherwise create placeholder
        const providedProduct = typeof productOrId === "object" ? productOrId : null;

        const existing = prev.find((item) => item._id === productId);

        if (existing) {
          const next = prev.map((item) =>
            item._id === productId ? { ...item, quantity: item.quantity + quantity } : item
          );
          // resolve asynchronously so state update is applied
          setTimeout(() => resolve(next), 0);
          return next;
        }

        const newItem = providedProduct
          ? { ...providedProduct, quantity, markup }
          : { _id: productId, quantity, markup };

        const next = [...prev, newItem];
        setTimeout(() => resolve(next), 0);
        return next;
      });
    });
  };

  // alias named like your main CartContext (so components expecting addToCart will work)
  const addToCart = (productOrId, quantity = 1, markup = 0) =>
    addWholesaleItem(productOrId, quantity, markup);

  // Remove item (keeps original name)
  const removeItem = (id) => {
    setWholesaleItems((prev) => prev.filter((item) => item._id !== id));
  };

  // alias to match CartContext naming
  const removeFromCart = (id) => removeItem(id);

  // Clear cart
  const clearCart = () => setWholesaleItems([]);

  return (
    <WholesaleCartContext.Provider
      value={{
        wholesaleItems,
        addWholesaleItem,
        addToCart,      // alias for compatibility with ProductCard usage
        removeItem,
        removeFromCart, // alias so consumers can call removeFromCart like main cart
        clearCart,
      }}
    >
      {children}
    </WholesaleCartContext.Provider>
  );
};

export const useWholesaleCart = () => useContext(WholesaleCartContext);
