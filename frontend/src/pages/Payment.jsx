import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment({
  setCartItems,
  setCartCount,
  setOrders,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================================
     API URL
  ===================================================== */

  const API_URL = ""; 

  /* =====================================================
     PAYMENT METHOD
  ===================================================== */

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  /* =====================================================
     PAYMENT PROCESSING
  ===================================================== */

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  /* =====================================================
     PAYMENT DETAILS
  ===================================================== */

  const [cardNumber, setCardNumber] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  /* =====================================================
     CUSTOMER + TOTAL
  ===================================================== */

  const customer =
    location.state?.customer || {};

  const total =
    location.state?.total || 0;

  const cartItems =
    location.state?.cartItems || [];

  /* =====================================================
     PAYMENT PAGE PROTECTION
  ===================================================== */

  useEffect(() => {
    if (
      !location.state?.cartItems ||
      location.state.cartItems.length === 0
    ) {
      navigate("/cart", {
        replace: true,
      });
    }
  }, [location.state, navigate]);

  /* =====================================================
     CHECK PENDING UPI ORDER
  ===================================================== */

  useEffect(() => {
    const handleReturnFromUpi = () => {
      const savedOrder = localStorage.getItem(
        "dumHousePendingUpiOrder"
      );

      if (!savedOrder) {
        return;
      }

      try {
        JSON.parse(savedOrder);

        setIsProcessing(false);
        setPaymentError(
          "Payment app returned. Automatic UPI payment verification is not connected yet."
        );
      } catch (error) {
        console.error("UPI Return Error:", error);
        setIsProcessing(false);
        setPaymentError(
          error.message ||
            "Payment failed, please try again."
        );
      }
    };

    handleReturnFromUpi();

    window.addEventListener("pageshow", handleReturnFromUpi);
    document.addEventListener("visibilitychange", handleReturnFromUpi);

    return () => {
      window.removeEventListener("pageshow", handleReturnFromUpi);
      document.removeEventListener("visibilitychange", handleReturnFromUpi);
    };
  }, []);

  /* =====================================================
     PAYMENT METHOD CHANGE
  ===================================================== */

  function changePaymentMethod(method) {
    setPaymentMethod(method);

    setCardNumber("");
    setExpiry("");
    setCvv("");

    setIsProcessing(false);
    setPaymentError("");

    if (method !== "upi") {
      localStorage.removeItem("dumHousePendingUpiOrder");
    }
  }

  /* =====================================================
     CARD NUMBER
  ===================================================== */

  function handleCardNumber(e) {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 16);

    setCardNumber(value);
  }

  /* =====================================================
     EXPIRY
  ===================================================== */

  function handleExpiry(e) {
    let value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 4);

    if (value.length >= 3) {
      value =
        value.slice(0, 2) +
        "/" +
        value.slice(2);
    }

    setExpiry(value);
  }

  /* =====================================================
     CVV
  ===================================================== */

  function handleCvv(e) {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 3);

    setCvv(value);
  }

  /* =====================================================
     PAYMENT
  ===================================================== */

  async function handlePayment() {
    setPaymentError("");

    if (isProcessing) {
      return;
    }

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      alert("Your cart is empty.");
      navigate("/cart");
      return;
    }

    /* =================================================
       COD
    ================================================= */

    if (paymentMethod === "cod") {
      setIsProcessing(true);

      const now = new Date();

      const newOrder = {
        id:
          "DH" +
          Math.floor(
            100000 +
            Math.random() * 900000
          ),

        customer: customer,

        total: total,

        paymentMethod: "cod",

        createdAt:
          now.toISOString(),

        date:
          now.toLocaleString(
            "en-IN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          ),

        status: "Confirmed",

        items: cartItems,
      };

      try {
        const token =
          localStorage.getItem(
            "dumHouseToken"
          );

        if (!token) {
          throw new Error(
            "Please login again before placing the order."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                orderId:
                  newOrder.id,

                customer:
                  newOrder.customer,

                items:
                  newOrder.items,

                total:
                  newOrder.total,

                paymentMethod:
                  "cod",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to save order."
          );
        }

        setOrders((prev) => [
          newOrder,
          ...prev,
        ]);

        setCartItems([]);
        setCartCount(0);

        navigate(
          "/order-success",
          {
            state: {
              customer:
                customer,

              total:
                total,

              orderId:
                newOrder.id,
            },
          }
        );
      } catch (error) {
        console.error(
          "COD Order Error:",
          error
        );

        alert(
          error.message ||
          "Order could not be saved. Please try again."
        );

        setIsProcessing(false);
      }

      return;
    }

    /* =================================================
       CARD
    ================================================= */

    if (paymentMethod === "card") {
      alert(
        "Card payment is not available yet. Please use UPI or Cash on Delivery."
      );

      return;
    }

    /* =================================================
       UPI INTENT
    ================================================= */

    setIsProcessing(true);

    try {
      const upiId =
        import.meta.env
          .VITE_DUMHOUSE_UPI_ID;

      if (!upiId) {
        throw new Error(
          "DUM HOUSE UPI ID is not configured."
        );
      }

      const orderId =
        "DH" +
        Math.floor(
          100000 +
          Math.random() * 900000
        );

      const upiUrl =
        `upi://pay?pa=${encodeURIComponent(upiId)}` +
        `&pn=${encodeURIComponent("DUM HOUSE")}` +
        `&am=${encodeURIComponent(total)}` +
        `&cu=INR` +
        `&tr=${encodeURIComponent(orderId)}` +
        `&tn=${encodeURIComponent(`DUM HOUSE Order ${orderId}`)}`;

      /* ===============================================
         CHECK LOGIN BEFORE CREATING PAYMENT ORDER
      =============================================== */

      const token = localStorage.getItem("dumHouseToken");

      if (!token) {
        setIsProcessing(false);
        setPaymentError("Please login again before making payment.");
        return;
      }

      /* ===============================================
         CREATE PENDING UPI ORDER ON SERVER
      =============================================== */

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          customer,
          items: cartItems,
          total,
          paymentMethod: "upi",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to create payment order."
        );
      }

      /* ===============================================
         SAVE PENDING UPI ORDER LOCALLY
      =============================================== */

      localStorage.setItem(
        "dumHousePendingUpiOrder",
        JSON.stringify({
          orderId,
          customer,
          total,
          items: cartItems,
          paymentMethod: "upi",
        })
      );

      /* ===============================================
         OPEN UPI APP
      =============================================== */

      window.location.href = upiUrl;
    } catch (error) {
      console.error(
        "UPI Payment Error:",
        error
      );

      localStorage.removeItem("dumHousePendingUpiOrder");

      setPaymentError(
        error.message ||
        "Unable to start UPI payment."
      );

      setIsProcessing(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="payment-page">

      <div className="payment-container">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="payment-heading">

          <h1>
            Payment
          </h1>

          <p>
            Choose your preferred payment method
          </p>

        </div>

        <div className="payment-layout">

          {/* =================================================
              PAYMENT METHODS
          ================================================= */}

          <div className="payment-box">

            <h2>
              Payment Method
            </h2>

            {/* ================= UPI ================= */}

            <label
              className={`payment-option ${
                paymentMethod === "upi"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="upi"
                checked={
                  paymentMethod === "upi"
                }
                onChange={() =>
                  changePaymentMethod(
                    "upi"
                  )
                }
              />

              <div>

                <h3>
                  UPI Payment
                </h3>

                <p>
                  Google Pay • PhonePe • Paytm
                </p>

              </div>

            </label>

            {/* ================= CARD ================= */}

            <label
              className={`payment-option ${
                paymentMethod === "card"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="card"
                checked={
                  paymentMethod === "card"
                }
                onChange={() =>
                  changePaymentMethod(
                    "card"
                  )
                }
              />

              <div>

                <h3>
                  Credit / Debit Card
                </h3>

                <p>
                  Currently unavailable
                </p>

              </div>

            </label>

            {paymentMethod === "card" && (

              <div className="card-payment-fields">

                <div className="payment-input">

                  <label>
                    Card Number
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Card payment unavailable"
                    value={cardNumber}
                    onChange={
                      handleCardNumber
                    }
                    disabled
                  />

                </div>

                <div className="card-row">

                  <div className="payment-input">

                    <label>
                      Expiry
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={
                        handleExpiry
                      }
                      disabled
                    />

                  </div>

                  <div className="payment-input">

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="CVV"
                      maxLength="3"
                      value={cvv}
                      onChange={
                        handleCvv
                      }
                      disabled
                    />

                  </div>

                </div>

              </div>

            )}

            {/* ================= COD ================= */}

            <label
              className={`payment-option ${
                paymentMethod === "cod"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={() =>
                  changePaymentMethod(
                    "cod"
                  )
                }
              />

              <div>

                <h3>
                  Cash on Delivery
                </h3>

                <p>
                  Pay when your order arrives
                </p>

              </div>

            </label>

            {paymentError && (
              <div className="payment-error" role="alert">
                {paymentError}
              </div>
            )}

            {/* ================= PAY BUTTON ================= */}

            <button
              className="pay-btn"
              onClick={
                handlePayment
              }
              disabled={
                isProcessing ||
                paymentMethod === "card"
              }
            >

              {isProcessing
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : `Pay ₹${total}`}

            </button>
{paymentError && (
  <div className="payment-error">
    {paymentError}
  </div>
)}
          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="payment-summary">

            <h2>
              Order Summary
            </h2>

            <div className="customer-info">

              <h3>
                Delivery To
              </h3>

              <p>
                {customer.name ||
                  "Customer"}
              </p>

              <p>
                {customer.phone}
              </p>

              <p>
                {customer.address}
              </p>

              <p>
                {customer.city} -{" "}
                {customer.pincode}
              </p>

            </div>

            <hr />

            <div className="payment-total">

              <span>
                Total Amount
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

export default Payment;