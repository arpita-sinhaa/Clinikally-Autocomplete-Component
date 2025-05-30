import { useState, useEffect } from "react";

interface Product {
  id: number;
  title: string;
}

const Autocomplete: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);

  const limit = 10;

  //Fetch product data
  const fetchData = async (newQuery: string, isLoadMore = false) => {
    if (newQuery.length < 2) {
      setSuggestions([]);
      setSkip(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${newQuery}&limit=${limit}&skip=${
          isLoadMore ? skip : 0
        }`
      );
      const data = await response.json();

      if (isLoadMore) {
        setSuggestions((prev) => [...prev, ...data.products]);
      } else {
        setSuggestions(data.products);
        setSkip(limit); //Reset skip on new search
      }
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  //Debounce effect for user input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleLoadMore = () => {
    fetchData(query, true);
    setSkip((prev) => prev + limit);
  };

  return (
    <div style={{ position: "relative", width: "300px" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        style={{
          padding: "0.5rem",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {loading && <div style={{ marginTop: "4px" }}>Loading...</div>}
      {error && <div style={{ color: "red", marginTop: "4px" }}>{error}</div>}

      {/* Showing "No products found" if no results */}
      {query.length >= 2 && !loading && suggestions.length === 0 && (
        <div style={{ marginTop: "4px", color: "#666" }}>
          No products found.
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <ul
            style={{
              position: "absolute",
              top: "105%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 10,
            }}
          >
            {suggestions.map((product) => (
              <li
                key={product.id}
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => setQuery(product.title)}
              >
                {product.title}
              </li>
            ))}
          </ul>

          <button
            onClick={handleLoadMore}
            style={{
              marginTop: "8px",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Load More
          </button>
        </>
      )}
    </div>
  );
};

export default Autocomplete;


