import { useEffect, useState, useRef } from "react";
import "./Admin.css";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
const [currentPage, setCurrentPage] = useState(1);

const ordersPerPage = 10;

  const [newOrder, setNewOrder] = useState(null);
  const [knownOrderIds, setKnownOrderIds] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);

  /* =====================================================
     DASHBOARD STATISTICS
  ===================================================== */

  const totalOrders = orders.length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const outForDeliveryOrders = orders.filter(
    (order) => order.status === "Out for Delivery"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

  /* =====================================================
     FETCH ORDERS
  ===================================================== */

  async function fetchOrders() {
  try {
    const token = localStorage.getItem("dumHouseToken");

    const response = await fetch(
      "http://localhost:5000/api/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setOrders(data.orders);

      const currentOrderIds = data.orders.map(
        (order) => order._id
      );

      /* NEW ORDER DETECTION */

      if (!firstLoad) {
        const newlyAddedOrder = data.orders.find(
          (order) =>
            !knownOrderIds.includes(order._id)
        );

        if (newlyAddedOrder) {
          setNewOrder(newlyAddedOrder);

          setTimeout(() => {
            setNewOrder(null);
          }, 6000);
        }
      }

      setKnownOrderIds(currentOrderIds);
      setFirstLoad(false);
    } else {
      console.error(
        "Admin Orders Error:",
        data.message
      );
    }
  } catch (error) {
    console.error(
      "Admin Orders Error:",
      error
    );
  } finally {
    setLoading(false);
  }
}

  /* =====================================================
     AUTO REFRESH
  ===================================================== */

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  async function updateStatus(orderId, status) {
  try {
    const token = localStorage.getItem("dumHouseToken");

    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } else {
      alert(
        data.message ||
          "Unable to update status"
      );
    }
  } catch (error) {
    console.error(
      "Update Status Error:",
      error
    );

    alert(
      "Unable to update order status."
    );
  }
}

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">

          <div className="admin-heading">
            <h1>Admin Dashboard</h1>
            <p>Manage customer orders</p>
          </div>

          <div className="admin-empty">
            <div className="admin-empty-icon">
              ⏳
            </div>

            <h2>Loading Orders...</h2>

            <p>
              Please wait while orders are loading.
            </p>
          </div>

        </div>
      </div>
    );
  }
  const filteredOrders = orders.filter((order) => {
  const matchesStatus =
    selectedStatus === "All" ||
    order.status === selectedStatus;

  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    !search ||
    String(order.orderId || "")
      .toLowerCase()
      .includes(search) ||
    String(order.customer?.name || "")
      .toLowerCase()
      .includes(search) ||
    String(order.customer?.phone || "")
      .includes(search);

  return matchesStatus && matchesSearch;
});

const totalPages = Math.ceil(
  filteredOrders.length / ordersPerPage
);

const startIndex =
  (currentPage - 1) * ordersPerPage;

const paginatedOrders = filteredOrders.slice(
  startIndex,
  startIndex + ordersPerPage
);

  /* =====================================================
     MAIN DASHBOARD
  ===================================================== */

  return (
    <div className="admin-page">

      {/* =====================================================
          NEW ORDER NOTIFICATION
      ===================================================== */}

      {newOrder && (
        <div className="new-order-notification">

          <div className="new-order-icon">
            🔔
          </div>

          <div className="new-order-content">

            <strong>
              New Order Received!
            </strong>

            <span>
              Order #{newOrder.orderId}
            </span>

            <small>
              ₹{newOrder.total} •{" "}
              {newOrder.customer?.name}
            </small>

          </div>

          <button
            type="button"
            onClick={() => setNewOrder(null)}
            aria-label="Close notification"
          >
            ×
          </button>

        </div>
      )}

      <div className="admin-container">

        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="admin-heading">

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Manage customer orders
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchOrders}
          >
            ↻ Refresh
          </button>

        </div>


        {/* =====================================================
            DASHBOARD STATS
        ===================================================== */}

        <div className="admin-stats">

          {/* TOTAL ORDERS */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "All"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus("All")
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus("All");
              }
            }}
          >
            <span>📦</span>

            <div>
              <small>Total Orders</small>
              <strong>{totalOrders}</strong>
            </div>
          </div>


          {/* CONFIRMED */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "Confirmed"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus("Confirmed")
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus("Confirmed");
              }
            }}
          >
            <span>🆕</span>

            <div>
              <small>Confirmed</small>
              <strong>{confirmedOrders}</strong>
            </div>
          </div>


          {/* PREPARING */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "Preparing"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus("Preparing")
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus("Preparing");
              }
            }}
          >
            <span>🍳</span>

            <div>
              <small>Preparing</small>
              <strong>{preparingOrders}</strong>
            </div>
          </div>


          {/* OUT FOR DELIVERY */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "Out for Delivery"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus(
                "Out for Delivery"
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus(
                  "Out for Delivery"
                );
              }
            }}
          >
            <span>🚚</span>

            <div>
              <small>Out for Delivery</small>
              <strong>
                {outForDeliveryOrders}
              </strong>
            </div>
          </div>


          {/* DELIVERED */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "Delivered"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus("Delivered")
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus("Delivered");
              }
            }}
          >
            <span>✅</span>

            <div>
              <small>Delivered</small>
              <strong>{deliveredOrders}</strong>
            </div>
          </div>


          {/* CANCELLED */}

          <div
            className={`admin-stat-card ${
              selectedStatus === "Cancelled"
                ? "stat-active"
                : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedStatus("Cancelled")
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setSelectedStatus("Cancelled");
              }
            }}
          >
            <span>❌</span>

            <div>
              <small>Cancelled</small>
              <strong>{cancelledOrders}</strong>
            </div>
          </div>


          {/* TOTAL SALES */}

          <div className="admin-stat-card sales-card">
            <span>💰</span>

            <div>
              <small>Total Sales</small>
              <strong>
                ₹{totalSales}
              </strong>
            </div>
          </div>

        </div>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="admin-search">

          <input
            type="text"
            placeholder="Search by order ID, name or phone..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

        </div>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="admin-filters">

          <button
            type="button"
            className={
              selectedStatus === "All"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus("All")
            }
          >
            All ({orders.length})
          </button>


          <button
            type="button"
            className={
              selectedStatus === "Confirmed"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus("Confirmed")
            }
          >
            Confirmed ({confirmedOrders})
          </button>


          <button
            type="button"
            className={
              selectedStatus === "Preparing"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus("Preparing")
            }
          >
            Preparing ({preparingOrders})
          </button>


          <button
            type="button"
            className={
              selectedStatus === "Out for Delivery"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus(
                "Out for Delivery"
              )
            }
          >
            Out for Delivery (
            {outForDeliveryOrders}
            )
          </button>


          <button
            type="button"
            className={
              selectedStatus === "Delivered"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus("Delivered")
            }
          >
            Delivered ({deliveredOrders})
          </button>


          <button
            type="button"
            className={
              selectedStatus === "Cancelled"
                ? "admin-filter active"
                : "admin-filter"
            }
            onClick={() =>
              setSelectedStatus("Cancelled")
            }
          >
            Cancelled ({cancelledOrders})
          </button>

        </div>


        {/* =====================================================
            ORDERS
        ===================================================== */}

        {orders.length === 0 ? (

          <div className="admin-empty">

            <div className="admin-empty-icon">
              📦
            </div>

            <h2>No Orders</h2>

            <p>
              There are no customer orders yet.
            </p>

          </div>

        ) : (

          <div className="admin-orders">

              {paginatedOrders.map((order) => (

                <div
                  key={order._id}
                  className={`admin-order-card status-${order.status
                    ?.toLowerCase()
                    .replaceAll(" ", "-")}`}
                >

                  {/* =====================================================
                      TOP
                  ===================================================== */}

                  <div className="admin-order-top">

                    <div>

                      <span>
                        Order ID
                      </span>

                      <h3>
                        #{order.orderId}
                      </h3>

                      <small className="admin-order-date">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString(
                              "en-IN",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              }
                            )
                          : "Date not available"}
                      </small>
                      {order.items?.length > 0 && (
  <div className="admin-item-preview">

    <img
      src={order.items[0].image}
      alt={order.items[0].name}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "/images/food-placeholder.jpg";
      }}
    />

    <div className="admin-item-preview-info">

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
        <small className="admin-more-items">
          +{order.items.length - 1} more items
        </small>
      )}

    </div>

  </div>
)}
                            
                    </div>


                    {/* STATUS */}

                    <div className="admin-status-wrapper">

  <span
    className={`admin-status-badge ${
      (order.status || "Confirmed")
        .toLowerCase()
        .replaceAll(" ", "-")
    }`}
  >
    {order.status || "Confirmed"}
  </span>

  {order.status !== "Delivered" &&
    order.status !== "Cancelled" && (
      <select
        className={`status-select ${
          order.status
            ?.toLowerCase()
            .replaceAll(" ", "-")
        }`}
        value={order.status}
        onChange={(e) =>
          updateStatus(
            order._id,
            e.target.value
          )
        }
      >

        <option value="Confirmed">
          ✓ Confirmed
        </option>

        <option value="Preparing">
          🍳 Preparing
        </option>

        <option value="Out for Delivery">
          🛵 Out for Delivery
        </option>

        <option value="Delivered">
          🎉 Delivered
        </option>

        <option value="Cancelled">
          ✕ Cancelled
        </option>

      </select>
    )}

</div>

                  </div>

{/* =====================================================
    ORDER STATUS TIMELINE
===================================================== */}

{order.status !== "Cancelled" && (
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

      const currentIndex =
        statusOrder.indexOf(order.status);

      const stepIndex =
        statusOrder.indexOf(step.status);

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
            {isCompleted
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


{order.status === "Cancelled" && (
  <div className="cancelled-timeline">
    <span>✕</span>
    <strong>Order Cancelled</strong>
  </div>
)}

                  {/* =====================================================
                      VIEW DETAILS
                  ===================================================== */}

                  <button
                    type="button"
                    className="order-details-toggle"
                    onClick={() =>
                      setExpandedOrders(
                        (prev) => ({
                          ...prev,
                          [order._id]:
                            !prev[order._id],
                        })
                      )
                    }
                  >
                    {expandedOrders[order._id]
                      ? "Hide Details ↑"
                      : "View Details ↓"}
                  </button>


                  {/* =====================================================
                      CUSTOMER + ITEMS
                  ===================================================== */}

                  {expandedOrders[
                    order._id
                  ] && (
                    <div className="order-expanded-content">

                      {/* CUSTOMER */}

                      <div className="admin-customer">

                        <strong>
                          {order.customer?.name ||
                            "Customer"}
                        </strong>

                        <p>
                          📱{" "}
                          {order.customer?.phone ||
                            "N/A"}
                        </p>

                        <p>
                          📍{" "}
                          {order.customer?.address ||
                            "N/A"}

                          {order.customer?.city
                            ? `, ${order.customer.city}`
                            : ""}

                          {order.customer?.pincode
                            ? ` - ${order.customer.pincode}`
                            : ""}
                        </p>

                      </div>


                      {/* ITEMS */}

                      <div className="admin-items">

                        {order.items?.map(
                          (item, index) => (

                            <div
                              className="admin-item"
                              key={`${order._id}-${
                                item.id ||
                                item._id ||
                                index
                              }`}
                            >

                              <span>
                                {item.name}
                              </span>

                              <span>
                                {item.quantity} × ₹
                                {item.price}
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    </div>
                  )}


                  {/* =====================================================
                      BOTTOM
                  ===================================================== */}

                  

                </div>

              ))}

          </div>

        )}

      </div>
      {totalPages > 1 && (
  <div className="admin-pagination">

    <button
      type="button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((prev) => prev - 1)
      }
    >
      ← Previous
    </button>

    <div className="pagination-pages">
      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((page) => (
        <button
          type="button"
          key={page}
          className={
            currentPage === page
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(page)
          }
        >
          {page}
        </button>
      ))}
    </div>

    <button
      type="button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((prev) => prev + 1)
      }
    >
      Next →
    </button>

  </div>
)}

    </div>
  );
}

export default Admin;