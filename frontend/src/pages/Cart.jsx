import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart({
  cartItems,
  setCartItems,
  setCartCount,
}) {

  const navigate = useNavigate();


  /* ================= TOTAL ================= */

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );


  /* ================= UPDATE QUANTITY ================= */

  function updateQuantity(id, change) {

    const item = cartItems.find(
      (cartItem) => cartItem.id === id
    );


    if (!item) {
      return;
    }


    /* Quantity 1 + Minus = Remove Item */

    if (
      item.quantity === 1 &&
      change === -1
    ) {

      const updatedCart =
        cartItems.filter(
          (cartItem) =>
            cartItem.id !== id
        );


      setCartItems(updatedCart);


      setCartCount(
        updatedCart.reduce(
          (sum, cartItem) =>
            sum + cartItem.quantity,
          0
        )
      );


      return;
    }


    /* Normal Quantity Update */

    const updatedCart =
      cartItems.map(
        (cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + change,
              }
            : cartItem
      );


    setCartItems(updatedCart);


    setCartCount(
      updatedCart.reduce(
        (sum, cartItem) =>
          sum + cartItem.quantity,
        0
      )
    );
  }


  /* ================= REMOVE ALL ================= */

  function removeAllItems() {

    setCartItems([]);

    setCartCount(0);
  }


  return (
    <div className="cart-page">

      <div className="cart-container">


        {/* ================= HEADING ================= */}

        <div className="cart-heading">

          <h1>
            Your Cart
          </h1>

          <p>
            Review your delicious choices before checkout
          </p>

        </div>


        {/* ================= EMPTY CART ================= */}

        {cartItems.length === 0 ? (

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Your Cart is Empty
            </h2>

            <p>
              Looks like you haven't added anything yet.
            </p>

            <button
              onClick={() =>
                navigate("/menu")
              }
            >
              Explore Menu
            </button>

          </div>

        ) : (


          /* ================= CART ================= */

          <div className="cart-layout">


            {/* ================= LEFT SIDE ================= */}

            <div className="cart-items">


              {cartItems.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >


                  {/* IMAGE */}

                  <img
  src={item.image}
  alt={item.name}
  className="cart-item-image"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "/images/food-placeholder.jpg";
  }}
/>


                  {/* DETAILS */}

                  <div className="cart-item-details">

                    <h3>
                      {item.name}
                    </h3>


                    <p className="cart-item-price">
                      ₹{item.price}
                    </p>


                    {/* QUANTITY */}

                    <div className="cart-item-actions">

                      <div className="cart-quantity">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              -1
                            )
                          }
                        >
                          −
                        </button>


                        <span>
                          {item.quantity}
                        </span>


                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>


                  {/* SUBTOTAL */}

                  <div className="cart-item-subtotal">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {item.price *
                        item.quantity}
                    </strong>

                  </div>


                </div>

              ))}


              {/* ================= REMOVE ALL ================= */}

              <div className="remove-all-container">

                <button
                  className="remove-all-btn"
                  onClick={removeAllItems}
                >
                  Remove All
                </button>

              </div>


            </div>


            {/* ================= RIGHT SIDE ================= */}

            <div className="cart-summary">

              <h2>
                Order Summary
              </h2>


              <div className="summary-row">

                <span>
                  Items
                </span>

                <span>
                  {cartItems.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}
                </span>

              </div>


              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{total}
                </span>

              </div>


              <div className="summary-row">

                <span>
                  Delivery
                </span>

                <span className="free">
                  FREE
                </span>

              </div>


              <hr />


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total}
                </strong>

              </div>


              <button
                className="checkout-btn"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Proceed to Checkout
              </button>


              <button
                className="continue-btn"
                onClick={() =>
                  navigate("/menu")
                }
              >
                ← Continue Shopping
              </button>


            </div>


          </div>

        )}

      </div>

    </div>
  );
}

export default Cart;