import { useEffect, useState } from "react";
import "./Menu.css";
import FoodCard from "../components/FoodCard";

function Menu({
  setCartCount,
  setCartItems,
  requireLogin,
  showCartNotification,
}) {
  const [foods, setFoods] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  /* ================= FETCH FOODS ================= */

  useEffect(() => {
    async function fetchFoods() {
      try {
        const response = await fetch(
`/api/foods`)

        const data = await response.json();

        if (data.success) {
          setFoods(data.foods);
        }
      } catch (error) {
        console.error(
          "Failed to fetch foods:",
          error
        );
      } finally {
        setFoodLoading(false);
      }
    }

    fetchFoods();
  }, []);

  /* ================= FILTER ================= */

  const filteredItems = foods.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /* ================= CATEGORIES ================= */

  const categories = [
    "All",
    ...new Set(
      foods.map((item) => item.category)
    ),
  ];

  return (
    <div className="menu-page">

      <h2 className="menu-title">
        Our Menu
      </h2>

      {/* SEARCH */}

      <div className="search-container">

        <input
          type="text"
          placeholder="Search your favorite food..."
          className="search-input"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

      </div>

      {/* CATEGORY */}

      <div className="category-filter">

        {categories.map((category) => (

          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSelectedCategory(category)
            }
          >
            {category}
          </button>

        ))}

      </div>

      {/* MENU ITEMS */}

      <div className="menu-grid">

        {foodLoading ? (

          <div className="no-items">
            <h3>Loading menu...</h3>
          </div>

        ) : filteredItems.length > 0 ? (

          filteredItems.map((item) => (

            <FoodCard
              key={item._id}
              item={{
  id: item._id,
  name: item.name,
  price: item.price,
  image: item.image,
  category: item.category,
  isVeg: item.isVeg,
  rating: item.rating,
  description: item.description,
  bestSeller: item.bestSeller,
}}
              setCartCount={setCartCount}
              setCartItems={setCartItems}
              requireLogin={requireLogin}
              showCartNotification={
                showCartNotification
              }
            />

          ))

        ) : (

          <div className="no-items">

            <h3>
              No items found
            </h3>

            <p>
              Try searching for another dish.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Menu;