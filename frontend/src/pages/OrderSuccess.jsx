import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {

  const location = useLocation();
  const navigate = useNavigate();


  const customer =
    location.state?.customer || {};

  const total =
    location.state?.total || 0;

  const orderId =
    location.state?.orderId ||
    "DH000000";


  return (

    <div className="success-page">

      <div className="success-card">


        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <div className="success-icon">
          ✓
        </div>


        <h1>
          Order Confirmed!
        </h1>


        <p className="success-message">
          Thank you for ordering from Dum House.
          Your delicious food is being prepared!
        </p>



        {/* =================================================
            ORDER ID
        ================================================= */}

        <div className="order-id">

          <span>
            Order ID
          </span>

          <strong>
            #{orderId}
          </strong>

        </div>



        {/* =================================================
            ORDER DETAILS
        ================================================= */}

        <div className="success-details">


          <div>

            <span>
              Total Amount
            </span>

            <strong>
              ₹{total}
            </strong>

          </div>


          <div>

            <span>
              Estimated Delivery
            </span>

            <strong>
              30–45 mins
            </strong>

          </div>


        </div>



        {/* =================================================
            DELIVERY ADDRESS
        ================================================= */}

        <div className="delivery-box">

          <h3>
            Delivery Address
          </h3>


          <p>
            <strong>
              {customer.name || "Customer"}
            </strong>
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



        {/* =================================================
            VIEW ORDERS
        ================================================= */}

        <button
          className="view-orders-btn"
          onClick={() =>
            navigate("/orders")
          }
        >
          View My Orders
        </button>



        {/* =================================================
            CONTINUE SHOPPING
        ================================================= */}

        <button
          className="continue-shopping"
          onClick={() =>
            navigate("/menu")
          }
        >
          Continue Shopping
        </button>



        {/* =================================================
            HOME
        ================================================= */}

        <button
          className="home-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Back to Home
        </button>


      </div>

    </div>

  );
}

export default OrderSuccess;