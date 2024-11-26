import { useEffect } from "react";
import ProductManager from "./components/product-manager";
import { API_BASE_URL, API_KEY } from "./constants/api";

export default function App() {
  useEffect(() => {
    fetch(`${API_BASE_URL}/task/products/search?search=Hat&page=2&limit=1`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    return () => {};
  }, []);

  return (
    <div className="container mx-auto py-10">
      <ProductManager />
    </div>
  );
}
