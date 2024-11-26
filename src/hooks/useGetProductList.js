import { API_BASE_URL, API_KEY } from "@/constants/api";
import { useEffect } from "react";
import { useState } from "react";

export function useGetProductList(query, page, isPickerOpen) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (!isPickerOpen) return;

        async function fetchProducts() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/task/products/search?search=${query}&page=${page}&limit=10`,
                    {
                        headers: {
                            "x-api-key": API_KEY,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch products");
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts()
    }, [query, page, isPickerOpen])


    return { data, loading, error };
}