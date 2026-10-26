import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from "react";

import api from "../api";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopnova_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopnova_user") || "null");
    } catch {
      return null;
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopnova_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    localStorage.setItem("shopnova_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("shopnova_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const token = localStorage.getItem("shopnova_token");
    if (!token) {
      setAuthReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("shopnova_user", JSON.stringify(data.user));
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("shopnova_token");
          localStorage.removeItem("shopnova_user");
          setUser(null);
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  const addToCart = (product, variant = {}) => {
    setCart((old) => {
      const cartKey = `${product._id}:${variant.variantId || variant.size || ""}:${variant.color || ""}`;
      const found = old.find((x) => (x.cartKey || x._id) === cartKey);

      if (found) {
        return old.map((x) =>
          (x.cartKey || x._id) === cartKey
            ? {
                ...x,
                quantity: Math.min(x.quantity + 1, product.stock || 99),
              }
            : x,
        );
      }

      return [...old, { ...product, ...variant, cartKey, quantity: 1 }];
    });
  };

  const updateQty = (id, quantity) => {
    setCart((old) =>
      old.map((x) =>
        (x.cartKey || x._id) === id
          ? {
              ...x,
              quantity: Math.max(
                1,
                Math.min(Number(quantity) || 1, x.stock || 99),
              ),
            }
          : x,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((old) => old.filter((x) => (x.cartKey || x._id) !== id));
  };
  const toggleWishlist = (product) => {
    setWishlist((old) =>
      old.some((item) => item._id === product._id)
        ? old.filter((item) => item._id !== product._id)
        : [...old, product],
    );
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("shopnova_token", data.token);
    localStorage.setItem("shopnova_user", JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post("/auth/register", form);

    localStorage.setItem("shopnova_token", data.token);
    localStorage.setItem("shopnova_user", JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("shopnova_token");
    localStorage.removeItem("shopnova_user");
    setUser(null);
    setCart([]);
  };

  const value = useMemo(
    () => ({
      cart,
      setCart,
      user,
      authReady,
      setUser,
      addToCart,
      updateQty,
      removeFromCart,
      wishlist,
      toggleWishlist,
      login,
      register,
      logout,
      cartCount: cart.reduce((n, x) => n + x.quantity, 0),
      cartTotal: cart.reduce((n, x) => n + x.price * x.quantity, 0),
    }),
    [cart, user, wishlist, authReady],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside a StoreProvider");
  }

  return context;
};
