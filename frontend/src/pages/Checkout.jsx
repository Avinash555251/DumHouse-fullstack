  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import "./Checkout.css";
  import {
  MapPin,
  UserRound,
  Phone,
  House,
  Building2,
  MapPinned,
ShieldCheck,
  CheckCircle2,
} from "lucide-react";


  
  function Checkout({ cartItems ,customer }) {

    const navigate = useNavigate();


    /* ================= FORM DATA ================= */

    const [formData, setFormData] = useState({
  name: customer?.name || "",
  phone: String(customer?.phone || ""),
  address: "",
  city: "",
  pincode: "",
});


    /* ================= TOTAL ================= */

    const total = cartItems.reduce(
  (sum, item) =>
    sum +
    Number(item.price || 0) *
    Number(item.quantity || 0),
  0
);


    /* ================= ITEM COUNT ================= */

    const itemCount = cartItems.reduce(
  (sum, item) =>
    sum + Number(item.quantity || 0),
  0
);


    /* ================= INPUT CHANGE ================= */

    /* ================= INPUT CHANGE ================= */

function handleChange(e) {
  const { name, value } = e.target;

  /* ================= PHONE ================= */

  if (name === "phone") {
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly.length > 10) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      phone: numbersOnly,
    }));

    return;
  }

  /* ================= PINCODE ================= */

  if (name === "pincode") {
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly.length > 6) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      pincode: numbersOnly,
    }));

    return;
  }

  /* ================= ADDRESS / CITY / NORMAL INPUTS ================= */

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
}


    /* ================= SUBMIT ================= */

    function handleSubmit(e) {
  e.preventDefault();

  /* Empty cart protection */
  if (cartItems.length === 0) {
    navigate("/menu");
    return;
  }

  /* Clean phone number */
  const phone = String(formData.phone || "")
    .replace(/\D/g, "");

  /* Mobile validation */
  if (phone.length !== 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  /* Pincode validation */
  const pincode = String(formData.pincode || "")
    .replace(/\D/g, "");

  if (pincode.length !== 6) {
    alert("Please enter a valid 6-digit pincode.");
    return;
  }

  /* Navigate to payment */
  navigate("/payment", {
    state: {
      customer: {
        ...formData,
        phone: phone,
        pincode: pincode,
      },
      total: total,
      cartItems: cartItems,
    },
  });
}


    /* ================= EMPTY CART ================= */

    if (cartItems.length === 0) {

      return (

        <div className="checkout-page">

          <div className="checkout-container">

            <div className="empty-cart">

              <div className="empty-cart-icon">
                🛒
              </div>

              <h2>
                Your Cart is Empty
              </h2>

              <p>
                Add some delicious food before checkout.
              </p>

              <button
                onClick={() =>
                  navigate("/menu")
                }
              >
                Explore Menu
              </button>

            </div>

          </div>

        </div>

      );
    }


    return (

      <div className="checkout-page">

        <div className="checkout-container">


          {/* ================= HEADING ================= */}

          <div className="checkout-heading">

            <h1>
              Checkout
            </h1>

            <p>
              Enter your delivery details
            </p>

          </div>



          <div className="checkout-layout">


            {/* =================================================
                DELIVERY FORM
            ================================================= */}

            <form
              className="checkout-form"
              onSubmit={handleSubmit}
            >

              <div className="checkout-form-heading">
  <div className="checkout-heading-icon">
    <MapPin />
  </div>

  <div>
    <h2>Delivery Details</h2>
    <p>Please enter your delivery information</p>
  </div>
</div>


              {/* FULL NAME */}

              <div className="form-group">
  <label>
    <span className="form-label-icon">
      <UserRound />
    </span>
    <span>Full Name</span>

    <span className="field-badge blue">
      <CheckCircle2 />
      Auto filled
    </span>
  </label>

  <input
    type="text"
    name="name"
    placeholder="Enter your full name"
    value={formData.name}
    readOnly
    required
  />
</div>


              {/* MOBILE */}

              <div className="form-group">
  <label>
    <span className="form-label-icon">
      <Phone />
    </span>
    <span>Mobile Number</span>

    <span className="field-badge green">
      <CheckCircle2 />
      10 digits required
    </span>
  </label>

  <input
    type="tel"
    name="phone"
    placeholder="Enter 10-digit mobile number"
    value={formData.phone}
    onChange={handleChange}
    maxLength="10"
    required
  />
</div>


              {/* ADDRESS */}

              <div className="form-group">
  <label>
    <span className="form-label-icon">
      <House />
    </span>
    <span>Delivery Address</span>
  </label>

  <textarea
    name="address"
    placeholder="House No, Street, Area"
    value={formData.address}
    onChange={handleChange}
    rows="4"
    required
  />
</div>


              {/* CITY + PINCODE */}

              <div className="form-group">
  <label>
    <span className="form-label-icon">
      <Building2 />
    </span>
    <span>City</span>
  </label>

  <input
    type="text"
    name="city"
    placeholder="City"
    value={formData.city}
    onChange={handleChange}
    required
  />
</div>

<div className="form-group">
  <label>
    <span className="form-label-icon">
      <MapPinned />
    </span>
    <span>Pincode</span>

    <span className="field-badge green">
      <CheckCircle2 />
      6 digits required
    </span>
  </label>

  <input
    type="text"
    name="pincode"
    placeholder="6-digit pincode"
    value={formData.pincode}
    onChange={handleChange}
    maxLength="6"
    inputMode="numeric"
    required
  />
</div>

              {/* PAYMENT BUTTON */}

              <button
  type="submit"
  className="payment-btn"
>
  Continue to Payment →
</button>
<div className="checkout-security">
  <ShieldCheck />
  <span>Your information is secure with us</span>
</div>



            </form>



            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="checkout-summary">

              <h2>
                Order Summary
              </h2>


              {/* ITEM COUNT */}

              <div className="summary-item-count">

                <span>
                  Items
                </span>

                <strong>
                  {itemCount}
                </strong>

              </div>


              {/* ITEMS */}

              {cartItems.map((item) => (

                <div
                  className="checkout-item"
                  key={item.id}
                >


                  <img
  src={item.image}
  alt={item.name}
  loading="lazy"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "/images/food-placeholder.jpg";
  }}
/>


                  <div>

                    <h4>
                      {item.name}
                    </h4>

                    <p>
                      ₹{item.price} × {item.quantity}
                    </p>

                  </div>


                  <strong>
                    ₹
                    {item.price *
                      item.quantity}
                  </strong>


                </div>

              ))}


              <hr />


              {/* SUBTOTAL */}

              <div className="checkout-summary-row">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{total}
                </span>

              </div>


              {/* DELIVERY */}

              <div className="checkout-summary-row">

                <span>
                  Delivery
                </span>

                <span className="free">
                  FREE
                </span>

              </div>


              <hr />


              {/* TOTAL */}

              <div className="checkout-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total}
                </strong>

              </div>


            </div>


          </div>

        </div>

      </div>

    );
  }


  export default Checkout;