import { useState } from "react";
import "./FoodCard.css";
import { FaHeart } from "react-icons/fa";

function FoodCard({
  item,
  setCartCount,
  setCartItems,
  requireLogin,
  showCartNotification,
}) {

  const [liked, setLiked] = useState(false);

  const [quantity, setQuantity] = useState(1);


  /* =====================================================
     ADD TO CART
  ===================================================== */

  function addItem() {

    /* Login check */

    if (!requireLogin()) {
      return;
    }


    /* Add item */

    setCartItems((prev) => {

      const existingItem =
        prev.find(
          (cartItem) =>
            cartItem.id === item.id
        );


      /* Existing item */

      if (existingItem) {

        return prev.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity +
                    quantity,
                }
              : cartItem
        );
      }


      /* New item */

      return [
        ...prev,
        {
          ...item,
          quantity: quantity,
        },
      ];

    });


    /* Update cart count */

    setCartCount(
      (prev) =>
        prev + quantity
    );


    /* Notification */

    showCartNotification(
      item.name
    );


    /* Reset quantity */

    setQuantity(1);
  }


  return (

    <div className="food-card">


      {/* =================================================
          BESTSELLER
      ================================================= */}

      {item.bestSeller && (

        <span className="best-badge">
          🔥 Bestseller
        </span>

      )}



      {/* =================================================
          WISHLIST
      ================================================= */}

      <div
        className={`wishlist-icon ${
          liked ? "liked" : ""
        }`}
        onClick={() =>
          setLiked(!liked)
        }
      >
        <FaHeart />
      </div>



      {/* =================================================
          FOOD IMAGE
      ================================================= */}

      <img
        src={item.image}
        alt={item.name}
        className="food-img"
      />



      <div className="food-content">


        {/* =================================================
            FOOD NAME
        ================================================= */}

        <h3>
          {item.name}
        </h3>



        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p className="food-desc">
          Authentic Taste • Freshly Prepared
        </p>



        {/* =================================================
            RATING + PRICE
        ================================================= */}

        <div className="food-info">

          <span className="rating">
            ⭐ {item.rating}
          </span>

          <span className="price">
            ₹{item.price}
          </span>

        </div>



        {/* =================================================
            QUANTITY
        ================================================= */}

        <div className="quantity-control">

          <button
            type="button"
            onClick={() => {

              if (quantity > 1) {

                setQuantity(
                  quantity - 1
                );

              }

            }}
          >
            −
          </button>


          <span>
            {quantity}
          </span>


          <button
            type="button"
            onClick={() =>
              setQuantity(
                quantity + 1
              )
            }
          >
            +
          </button>

        </div>



        {/* =================================================
            ADD TO CART
        ================================================= */}

        <button
          type="button"
          onClick={addItem}
        >
          Add to Cart
        </button>


      </div>

    </div>

  );
}

export default FoodCard;