import FoodCard from "./FoodCard";
import menuData from "../data/menuData";

function MenuSection({
  setCartCount,
  setCartItems,
  requireLogin,
  showCartNotification,
}) {
  return (
    <section style={{ padding: "60px" }}>

      <h2
        style={{
          color: "#ff6b00",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        Our Menu
      </h2>

      <div
        style={{
          display: "flex",
          gap: "25px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {menuData.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            setCartCount={setCartCount}
            setCartItems={setCartItems}
            requireLogin={requireLogin}
            showCartNotification={showCartNotification}
          />
        ))}
      </div>

    </section>
  );
}

export default MenuSection;