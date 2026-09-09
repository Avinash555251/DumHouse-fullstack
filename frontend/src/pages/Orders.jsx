import { useEffect, useState } from "react";
import "./Orders.css";
import { useNavigate } from "react-router-dom";

function Orders({ orders }) {
  const navigate = useNavigate();

  const [expandedOrders, setExpandedOrders] = useState({});
  /* =====================================================
     LIVE ORDERS
  ===================================================== */

  const [liveOrders, setLiveOrders] = useState(
    orders || []
  );


  /* =====================================================
     UPDATE WHEN ORDERS PROP CHANGES
  ===================================================== */

  useEffect(() => {
  setLiveOrders((currentOrders) => {
    const incomingOrders = orders || [];

    return incomingOrders.map((incomingOrder) => {
      const existingOrder = currentOrders.find(
        (currentOrder) =>
          String(currentOrder.id) ===
          String(
            incomingOrder.id ||
              incomingOrder.orderId ||
              incomingOrder._id
          )
      );

      if (!existingOrder) {
        return incomingOrder;
      }

      return {
        ...incomingOrder,

        // Keep the latest status already received
        // by the customer page.
        status:
          existingOrder.status ||
          incomingOrder.status,
      };
    });
  });
}, [orders]);


 /* =====================================================
   SECURE CUSTOMER ORDER REFRESH
===================================================== */

useEffect(() => {
  async function refreshOrders() {
    try {
      const savedUser =
        localStorage.getItem("dumHouseUser");

      const token =
        localStorage.getItem("dumHouseToken");

      if (!savedUser || !token) {
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user?.phone) {
        return;
      }

      const response = await fetch(
`${window.location.protocol}//${window.location.hostname}:5000/api/orders/customer/${user.phone}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error(
          "Customer Orders Error:",
          data.message || "Unable to fetch orders."
        );
        return;
      }

      const customerOrders =
        Array.isArray(data.orders)
          ? data.orders.map((order) => ({
              ...order,

              // MongoDB orderId → frontend id
              id: order.orderId,
            }))
          : [];

      setLiveOrders(customerOrders);

    } catch (error) {
      console.error(
        "Customer Order Refresh Error:",
        error
      );
    }
  }

  /* First load */
  refreshOrders();

  /* Refresh every 10 seconds */
  const interval = setInterval(
    refreshOrders,
    10000
  );

  return () => {
    clearInterval(interval);
  };
}, []);


  /* =====================================================
     PAYMENT NAME
  ===================================================== */

  function getPaymentName(method) {

    if (method === "upi") {
      return "UPI Payment";
    }


    if (method === "card") {
      return "Credit / Debit Card";
    }


    if (method === "cod") {
      return "Cash on Delivery";
    }


    return method || "Payment";
  }

function getStatusMessage(status) {
  if (status === "Confirmed") {
    return "Your order has been confirmed 🎉";
  }

  if (status === "Preparing") {
    return "Your order is being prepared 🍳";
  }

  if (status === "Out for Delivery") {
    return "Your order is on the way 🚚";
  }

  if (status === "Delivered") {
    return "Your order has been delivered successfully 🎉";
  }

  if (status === "Cancelled") {
    return "Your order has been cancelled";
  }

  return "";
}
  /* =====================================================
     FORMAT DATE
  ===================================================== */

  function formatOrderDate(order) {

    /* New orders */

    if (order.createdAt) {

      const date =
        new Date(order.createdAt);


      if (!isNaN(date.getTime())) {

        return date.toLocaleDateString(
          "en-GB"
        );

      }

    }


    /* Old orders */

    if (!order.date) {
      return "";
    }


    const dateString =
      String(order.date).trim();


    const parts =
      dateString.split("/");


    if (parts.length !== 3) {
      return dateString;
    }


    const first =
      Number(parts[0]);


    const second =
      Number(parts[1]);


    const year =
      parts[2];


    /* DD/MM/YYYY */

    if (first > 12) {

      return (
        `${String(first).padStart(2, "0")}/` +
        `${String(second).padStart(2, "0")}/` +
        `${year}`
      );

    }


    /* MM/DD/YYYY */

    if (second > 12) {

      return (
        `${String(second).padStart(2, "0")}/` +
        `${String(first).padStart(2, "0")}/` +
        `${year}`
      );

    }


    /* Ambiguous */

    return dateString;
  }


  /* =====================================================
     FORMAT TIME
  ===================================================== */

  function formatOrderTime(order) {

    if (!order.createdAt) {
      return "";
    }


    const date =
      new Date(order.createdAt);


    if (isNaN(date.getTime())) {
      return "";
    }


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }


  /* =====================================================
     SORT ORDERS
     Latest order first
  ===================================================== */

  const sortedOrders =
    [...liveOrders].sort(
      (a, b) => {

        const timeA =
          a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : NaN;


        const timeB =
          b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : NaN;


        /* Both have createdAt */

        if (
          !isNaN(timeA) &&
          !isNaN(timeB)
        ) {

          return timeB - timeA;

        }


        /* New order first */

        if (
          !isNaN(timeA) &&
          isNaN(timeB)
        ) {

          return -1;

        }


        if (
          isNaN(timeA) &&
          !isNaN(timeB)
        ) {

          return 1;

        }


        /* Old orders */

        const idA =
          Number(a.id);


        const idB =
          Number(b.id);


        if (
          !isNaN(idA) &&
          !isNaN(idB)
        ) {

          return idB - idA;

        }


        return 0;

      }
    );


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="orders-page">

      <div className="orders-container">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="orders-heading">

          <h1>
            My Orders
          </h1>

          <p>
            Track and view your previous orders
          </p>

        </div>


        {/* =================================================
            NO ORDERS
        ================================================= */}

        {sortedOrders.length === 0 ? (

          <div className="no-orders">

            <div className="no-orders-icon">
              🧾
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed any orders yet.
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

          /* =================================================
             ORDERS LIST
          ================================================= */

          <div className="orders-list">

            {sortedOrders.map(
              (order) => (

                <div
                  className="order-card"
                  key={order.id}
                >


                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="order-top">

  {/* =================================================
      LEFT SIDE - ORDER ID + FIRST ITEM
  ================================================= */}

  <div className="order-left">

    <span className="order-id-label">
      Order ID
    </span>

    <h3>
      #{order.id}
    </h3>

    {/* FIRST ITEM PREVIEW */}

    {order.items?.length > 0 && (
      <div className="order-item-preview">

        <img
          src={order.items[0].image}
          alt={order.items[0].name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "/images/food-placeholder.jpg";
          }}
        />

        <div className="order-item-preview-info">

          <strong>
            {order.items[0].name}
          </strong>

          <span>
            ₹{order.items[0].price} ×{" "}
            {order.items[0].quantity}
          </span>

          <b>
            ₹
            {Number(order.items[0].price || 0) *
              Number(order.items[0].quantity || 0)}
          </b>
{order.items.length > 1 && (
  <small className="order-more-items">
    +{order.items.length - 1} more items
  </small>
)}
        </div>

      </div>
    )}

  </div>


  {/* =================================================
      RIGHT SIDE - STATUS + TIMELINE
  ================================================= */}

  <div className="order-status-section">

    {/* CURRENT STATUS */}

    <div className="order-status-area">

      <span className="order-status">
        {order.status}
      </span>

      {getStatusMessage(order.status) && (
        <p className="order-status-message">
          {getStatusMessage(order.status)}
        </p>
      )}

    </div>


    {/* =================================================
        CANCELLED
    ================================================= */}

    {order.status === "Cancelled" ? (

      <div className="cancelled-order-status">

        <div className="cancelled-icon">
          ✕
        </div>

        <div>

          <strong>
            Order Cancelled
          </strong>

          <small>
            This order has been cancelled
          </small>

        </div>

      </div>

    ) : (

      /* =================================================
         ORDER PROGRESS
      ================================================= */

      <div className="order-timeline">

        {[
          {
            status: "Confirmed",
            icon: "✓",
          },
          {
            status: "Preparing",
            icon: "🍳",
          },
          {
            status: "Out for Delivery",
            icon: "🛵",
          },
          {
            status: "Delivered",
            icon: "🎉",
          },
        ].map((step, index) => {

          const statusOrder = [
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
          ];

          const normalizedStatus = String(
            order.status || "Confirmed"
          ).trim();

          const currentIndex =
            statusOrder.indexOf(
              normalizedStatus
            );

          const stepIndex =
            statusOrder.indexOf(
              step.status
            );

          const isCompleted =
            stepIndex <= currentIndex;

          const isCurrent =
            stepIndex === currentIndex &&
            order.status !== "Delivered";

          return (
            <div
              className={`timeline-step
                ${isCompleted ? "completed" : ""}
                ${isCurrent ? "current" : ""}
              `}
              key={step.status}
            >

              <div className="timeline-icon">

                {order.status === "Delivered"
                  ? "✓"
                  : isCurrent
                    ? step.icon
                    : isCompleted
                      ? "✓"
                      : step.icon}

              </div>

              <small>
                {step.status}
              </small>

              {index < 3 && (
                <div
                  className={`timeline-line ${
                    stepIndex < currentIndex
                      ? "completed"
                      : ""
                  }`}
                />
              )}

            </div>
          );

        })}

      </div>

    )}

  </div>

</div>

<button
  type="button"
  className="customer-order-details-toggle"
  onClick={() =>
    setExpandedOrders((prev) => ({
      ...prev,
      [order.id]: !prev[order.id],
    }))
  }
>
  {expandedOrders[order.id]
    ? "Hide Details ↑"
    : "View Details ↓"}
</button>
{expandedOrders[order.id] && (
  <>
                  {/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="order-details">


                    {/* DATE + TIME */}

                    <div>

                      <span>
                        Date
                      </span>

                      <strong>

                        {formatOrderDate(
                          order
                        )}

                        {formatOrderTime(
                          order
                        ) && (

                          <>
                            {" • "}
                            {formatOrderTime(
                              order
                            )}
                          </>

                        )}

                      </strong>

                    </div>


                    {/* PAYMENT */}

                    <div>

                      <span>
                        Payment
                      </span>

                      <strong>
                        {getPaymentName(
                          order.paymentMethod
                        )}
                      </strong>

                    </div>


                    {/* TOTAL */}

                    <div>

                      <span>
                        Total
                      </span>

                      <strong className="order-price">
                        ₹{order.total}
                      </strong>

                    </div>


                  </div>


                  {/* =================================================
                      CUSTOMER
                  ================================================= */}

                  <div className="order-customer">

                    <h4>
                      Delivery To
                    </h4>


                    <p>

                      <strong>
                        {order.customer?.name ||
                          "Customer"}
                      </strong>

                    </p>


                    <p>

                      📱{" "}

                      {order.customer?.phone ||
                        "Not available"}

                    </p>


                    <p>

                      📍{" "}

                      {order.customer?.address ||
                        ""}

                      {order.customer?.city
                        ? `, ${order.customer.city}`
                        : ""}

                      {order.customer?.pincode
                        ? ` - ${order.customer.pincode}`
                        : ""}

                    </p>

                  </div>


                  {/* =================================================
                      ORDERED ITEMS
                  ================================================= */}

                  {order.items &&
                    order.items.length > 0 && (

                      <div className="ordered-items">

                        <h4>
                          Ordered Items
                        </h4>


                        {order.items.map(
                          (item) => (

                            <div
                              className="ordered-item"
                              key={`${order.id}-${item.id || item._id || item.name}-${item.price}`}
                            >


                              {/* IMAGE */}

                              <img
                                src={item.image}
                                alt={item.name}
                                onError={(e) => {

                                  e.currentTarget.onerror =
                                    null;

                                  e.currentTarget.src =
                                    "/images/food-placeholder.jpg";

                                }}
                              />


                              {/* ITEM INFO */}

                              <div className="ordered-item-info">

                                <strong>
                                  {item.name}
                                </strong>

                                <span>
                                  ₹{item.price} ×{" "}
                                  {item.quantity}
                                </span>

                              </div>


                              {/* ITEM TOTAL */}

                              <strong className="ordered-item-total">

                                ₹
                                {item.price *
                                  item.quantity}

                              </strong>


                            </div>

                          )
                          
                        )}

                      </div>

                    )}
                      </>
)}

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );
}

export default Orders;