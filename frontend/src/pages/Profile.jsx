import "./Profile.css";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  ClipboardList,
  IndianRupee,
  Package,
  Utensils,
  ChevronRight,
} from "lucide-react";

function Profile({ orders, customer, onLogout }) {

  const navigate = useNavigate();


  const totalOrders = orders.length;


  const totalSpent = orders
  .filter(
    (order) => order.status === "Delivered"
  )
  .reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );


  function handleLogout() {

    onLogout();

    navigate("/");
  }


  return (

    <div className="profile-page">


      <div className="profile-container">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="profile-heading">

          <h1>
            My Profile
          </h1>

          <p>
            Manage your Dum House account
          </p>

        </div>



        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="profile-card">


          <div className="profile-avatar">
  <UserRound />
</div>


          <div className="profile-info">

            <h2>
              {customer?.name || "Customer"}
            </h2>


            <p>
              +91 {customer?.phone || ""}
            </p>

          </div>


        </div>



        {/* =================================================
            STATS
        ================================================= */}

        <div className="profile-stats">


          <div className="stat-card">

            <span>
  <ClipboardList />
</span>

            <strong>
              {totalOrders}
            </strong>

            <p>
              Total Orders
            </p>

          </div>



          <div className="stat-card">

            <span>
  <IndianRupee />
</span>

            <strong>
              ₹{totalSpent}
            </strong>

            <p>
              Total Spent
            </p>

          </div>


        </div>



        {/* =================================================
            PROFILE MENU
        ================================================= */}

        <div className="profile-menu">


          {/* MY ORDERS */}

          <button
            onClick={() =>
              navigate("/orders")
            }
          >

            <span>
  <Package />
</span>


            <div>

              <strong>
                My Orders
              </strong>

              <p>
                View your previous orders
              </p>

            </div>


            <span>
  <ChevronRight />
</span>

          </button>



          {/* EXPLORE MENU */}

          <button
            onClick={() =>
              navigate("/menu")
            }
          >

            <span>
  <Utensils />
</span>


            <div>

              <strong>
                Explore Menu
              </strong>

              <p>
                Order your favorite food
              </p>

            </div>


            <span>
  <ChevronRight />
</span>

          </button>


        </div>



        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="profile-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>

    </div>

  );
}

export default Profile;