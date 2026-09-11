import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  useState,
  useEffect,
} from "react";

import "./App.css";


import Navbar from "./components/Navbar";
import LoginPrompt from "./components/LoginPrompt";


import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {


  /* =====================================================
     CART
  ===================================================== */

  const [cartItems, setCartItems] =
    useState(() => {

      try {

        const savedCart =
          localStorage.getItem(
            "dumHouseCart"
          );

        return savedCart
          ? JSON.parse(savedCart)
          : [];

      } catch {

        return [];

      }

    });


  const [cartCount, setCartCount] =
    useState(() => {

      try {

        const savedCart =
          localStorage.getItem(
            "dumHouseCart"
          );

        const cart =
          savedCart
            ? JSON.parse(savedCart)
            : [];

        return cart.reduce(
          (sum, item) =>
            sum +
            Number(item.quantity || 0),
          0
        );

      } catch {

        return 0;

      }

    });


  /* =====================================================
     SAVE CART
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "dumHouseCart",
      JSON.stringify(cartItems)
    );


    const count =
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0),
        0
      );


    setCartCount(count);

  }, [cartItems]);


  /* =====================================================
     ORDERS
  ===================================================== */

  const [orders, setOrders] =
    useState(() => {

      try {

        const savedOrders =
          localStorage.getItem(
            "dumHouseOrders"
          );

        return savedOrders
          ? JSON.parse(savedOrders)
          : [];

      } catch {

        return [];

      }

    });


  /* =====================================================
     SAVE ORDERS
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "dumHouseOrders",
      JSON.stringify(orders)
    );

  }, [orders]);


  /* =====================================================
     LOGIN STATE
  ===================================================== */

  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {

      return (
        localStorage.getItem(
          "dumHouseLoggedIn"
        ) === "true"
      );

    });


  /* =====================================================
     CUSTOMER
  ===================================================== */

  const [customer, setCustomer] =
    useState(() => {

      try {

        const savedUser =
          localStorage.getItem(
            "dumHouseUser"
          );

        return savedUser
          ? JSON.parse(savedUser)
          : null;

      } catch {

        return null;

      }

    });


  /* =====================================================
     LOGIN
  ===================================================== */

  function handleLogin(userFromLogin = null) {


    /*
      IMPORTANT:
      Use the user passed from Login.jsx.
      This prevents old customer data.
    */

    let user =
      userFromLogin;


    /*
      Fallback:
      If Login didn't pass user,
      load current saved user.
    */

    if (!user) {

      try {

        const savedUser =
          localStorage.getItem(
            "dumHouseUser"
          );

        user =
          savedUser
            ? JSON.parse(savedUser)
            : null;

      } catch {

        user = null;

      }

    }


    if (!user) {

      alert(
        "Unable to load customer account."
      );

      return;

    }


    /* Save current customer */

    localStorage.setItem(
      "dumHouseUser",
      JSON.stringify(user)
    );


    localStorage.setItem(
      "dumHouseLoggedIn",
      "true"
    );


    /* Update React state immediately */

    setCustomer(user);

    setIsLoggedIn(true);


    /*
      IMPORTANT:
      Do NOT clear orders here.
      Orders belong to users and are
      filtered below.
    */

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {


    localStorage.removeItem("dumHouseLoggedIn");
    localStorage.removeItem("dumHouseUser");
    localStorage.removeItem("dumHouseToken");   // 👈 Add this
    localStorage.removeItem("dumHouseCart");

    setIsLoggedIn(false);

    setCustomer(null);


    /*
      Clear current cart on logout
    */

    setCartItems([]);

    setCartCount(0);


    /*
      Close login prompt
    */

    setShowLoginPrompt(false);

  }


  /* =====================================================
     CURRENT CUSTOMER ORDERS
  ===================================================== */

  const customerOrders =
    customer?.phone
      ? orders.filter(
          (order) =>
            order.customer?.phone ===
            customer.phone
        )
      : [];

      /* =====================================================
   AUTO REFRESH CUSTOMER ORDERS
===================================================== */

/* =====================================================
   AUTO REFRESH CUSTOMER ORDER STATUSES
===================================================== */

useEffect(() => {
  if (!customer?.phone) {
    return;
  }

  const refreshOrderStatuses = async () => {
    try {
      const token = localStorage.getItem("dumHouseToken");

const response = await fetch(
  `/api/orders/customer/${customer.phone}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
); 

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      setOrders((previousOrders) => {
        return previousOrders.map((oldOrder) => {

          const latestOrder = data.orders.find(
            (newOrder) =>
              String(newOrder._id) ===
              String(oldOrder._id)
          );

          if (!latestOrder) {
            return oldOrder;
          }

          return {
            ...oldOrder,
            status: latestOrder.status,
          };
        });
      });

    } catch (error) {
      console.error(
        "Customer Order Status Refresh Error:",
        error
      );
    }
  };

  refreshOrderStatuses();

  const interval = setInterval(
    refreshOrderStatuses,
    10000
  );

  return () => {
    clearInterval(interval);
  };

}, [customer?.phone]);

/* =====================================================
   LOAD ORDERS FROM MONGODB
===================================================== */

useEffect(() => {

  async function fetchOrders() {
if (!customer?.phone) return;
    try {

      const token = localStorage.getItem("dumHouseToken");

const response = await fetch(
  `/api/orders/customer/${customer.phone}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const data = await response.json();
  
      if (data.success) {

        const mongoOrders =
          data.orders.map((order) => ({
            ...order,

            // MongoDB ID → frontend order ID
            id: order.orderId,
          }));

        setOrders(mongoOrders);
      }

    } catch (error) {

      console.error(
        "Fetch Orders Error:",
        error
      );

    }

  }

  fetchOrders();

}, []);
  /* =====================================================
     LOGIN PROMPT
  ===================================================== */

  const [
    showLoginPrompt,
    setShowLoginPrompt,
  ] = useState(false);


  function requireLogin() {

    if (!isLoggedIn) {

      setShowLoginPrompt(true);

      return false;

    }

    return true;

  }


  /* =====================================================
     CART NOTIFICATION
  ===================================================== */

  const [
    cartNotification,
    setCartNotification,
  ] = useState({

    show: false,

    message: "",

  });


  function showCartNotification(
    itemName
  ) {

    setCartNotification({

      show: true,

      message:
        `${itemName} added to your cart`,

    });


    setTimeout(() => {

      setCartNotification({

        show: false,

        message: "",

      });

    }, 2500);

  }


  return (

    <BrowserRouter>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        customer={customer}
        onLogout={handleLogout}
      />


      {/* =================================================
          LOGIN PROMPT
      ================================================= */}

      <LoginPrompt
        isLoggedIn={isLoggedIn}
        show={showLoginPrompt}
        setShow={setShowLoginPrompt}
      />


      {/* =================================================
          CART NOTIFICATION
      ================================================= */}

      {cartNotification.show && (

        <div className="cart-notification">

          <div className="cart-notification-icon">
            🛒
          </div>


          <div className="cart-notification-content">

            <strong>
              Added to Cart!
            </strong>

            <p>
              {cartNotification.message}
            </p>

          </div>

        </div>

      )}


      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>


        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={

            <Home
              cartItems={cartItems}
              setCartItems={setCartItems}
              setCartCount={setCartCount}

              requireLogin={
                requireLogin
              }

              showCartNotification={
                showCartNotification
              }
            />

          }
        />


        {/* =================================================
            MENU
        ================================================= */}

        <Route
          path="/menu"
          element={

            <Menu
              setCartCount={
                setCartCount
              }

              setCartItems={
                setCartItems
              }

              requireLogin={
                requireLogin
              }

              showCartNotification={
                showCartNotification
              }
            />

          }
        />

<Route
  path="/admin"
  element={<Admin />}
/>
        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={

            <Login
              onLogin={handleLogin}
            />

          }
        />


        {/* =================================================
            CART
        ================================================= */}

        <Route
          path="/cart"
          element={

            <Cart
              cartItems={
                cartItems
              }

              setCartItems={
                setCartItems
              }

              setCartCount={
                setCartCount
              }
            />

          }
        />


        {/* =================================================
            CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={

            isLoggedIn ? (

              <Checkout
                cartItems={
                  cartItems
                }

                customer={
                  customer
                }
              />

            ) : (

              <Login
                onLogin={
                  handleLogin
                }
              />

            )

          }
        />


        {/* =================================================
            PAYMENT
        ================================================= */}

        <Route
          path="/payment"
          element={

            isLoggedIn ? (

              <Payment
                setCartItems={
                  setCartItems
                }

                setCartCount={
                  setCartCount
                }

                setOrders={
                  setOrders
                }
              />

            ) : (

              <Login
                onLogin={
                  handleLogin
                }
              />

            )

          }
        />


        {/* =================================================
            ORDER SUCCESS
        ================================================= */}

        <Route
          path="/order-success"
          element={
            <OrderSuccess />
          }
        />


        {/* =================================================
            ORDERS
        ================================================= */}

        <Route
          path="/orders"
          element={

            isLoggedIn ? (

              <Orders
                orders={
                  customerOrders
                }
              />

            ) : (

              <Login
                onLogin={
                  handleLogin
                }
              />

            )

          }
        />


        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={

            isLoggedIn ? (

              <Profile
                orders={
                  customerOrders
                }

                customer={
                  customer
                }

                onLogout={
                  handleLogout
                }
              />

            ) : (

              <Login
                onLogin={
                  handleLogin
                }
              />

            )

          }
        />


      </Routes>


    </BrowserRouter>

  );
}


export default App;