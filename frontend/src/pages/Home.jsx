  import "./Home.css";
  import Hero from "../components/Hero";
  import { useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

  import {
    BadgePercent,
    Truck,
    CupSoda,
    Clock3,
    ChefHat,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
  } from "lucide-react";

  import {
    FaFacebookF,
    FaInstagram,
    FaWhatsapp,
  } from "react-icons/fa";


  function Home({
    cartItems,
    setCartCount,
    setCartItems,
    requireLogin,
    showCartNotification,
  }) {

    const navigate = useNavigate();

    const [foods, setFoods] = useState([]);
const [foodLoading, setFoodLoading] = useState(true);

useEffect(() => {
    async function fetchFoods() {
        try {
            const response = await fetch(
`/api/foods`)

            const data = await response.json();

            if (data.success) {
                setFoods(data.foods);
            }
        } catch (error) {
            console.error(
                "Failed to fetch foods:",
                error
            );
        } finally {
            setFoodLoading(false);
        }
    }

    fetchFoods();
}, []);

    /* =====================================================
      COMMON ADD TO CART FUNCTION
    ===================================================== */

    function addToCart(item) {

      /* Login check */

      if (!requireLogin()) {
        return;
      }


      setCartItems((prev) => {

        const existingItem = prev.find(
          (cartItem) =>
            cartItem.id === item.id
        );


        /* Already exists */

        if (existingItem) {

          return prev.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
          );

        }


        /* New item */

        return [
          ...prev,
          {
            ...item,
            quantity: 1,
          },
        ];

      });


      /* Cart count */

      setCartCount(
        (prev) => prev + 1
      );


      /* Notification */

      showCartNotification(
        item.name
      );
    }


    /* =====================================================
      ORDER NOW
    ===================================================== */

    /* =====================================================
   ORDER NOW
===================================================== */
/* =====================================================
   ORDER NOW
===================================================== */

function handleOrderNow() {
  const item = {
    id: "chicken-dum-biryani",
    name: "Chicken Dum Biryani",
    price: 149,
    image: "/images/dum-biryani.jpg",
  };

  if (!requireLogin()) {
    return;
  }

  addToCart(item);

  navigate("/cart");
}


    return (
      <>


        {/* =================================================
            HERO
        ================================================= */}

        {/* =================================================
      HERO
  ================================================= */}

  {/* ================= HERO ================= */}
<section className="hero">

  {/* Background overlay */}
  <div className="hero-overlay"></div>

  {/* Hero Content */}
  <div className="hero-content">

    {/* Main Heading */}
    <h1 className="hero-title">
      <span className="hero-title-white">
        AUTHENTIC BIRYANIS,
      </span>

      <span className="hero-title-second">
         DELIVERED <span className="hero-hot">HOT!</span>
      </span>
    </h1>

    {/* Decorative Line */}
    <div className="hero-line">

      <span className="hero-line-left"></span>

      <span className="hero-line-symbol">✦</span>

      <span className="hero-line-right"></span>

    </div>

    {/* Categories */}
    <div className="hero-categories">

      <span>Dum</span>
      <b>•</b>

      <span>Fry Piece</span>
      <b>•</b>

      <span>Mughalai</span>
      <b>•</b>

      <span>Egg</span>
      <b>•</b>

      <span>Veg</span>
      <b>•</b>

      <span>Fried Rice</span>

    </div>

    {/* Buttons */}
    <div className="hero-buttons">

      <Link
        to="/menu"
        className="hero-explore-btn"
      >
        EXPLORE MENU
      </Link>

      <button
  type="button"
  className="hero-order-btn"
  onClick={handleOrderNow}
>
  ORDER NOW
</button>

    </div>

  </div>

</section>


        {/* =================================================
            BEST SELLERS
        ================================================= */}

        <section className="best-sellers">

          <div className="section-heading">

            <h2>
              Our Best Sellers
            </h2>

            <p>
              Freshly Prepared • Hot & Delicious • Customer Favorites
            </p>

          </div>


          <div className="menu-grid">

    {foodLoading ? (

        <p>Loading foods...</p>

    ) : foods.length === 0 ? (

        <p>No foods available.</p>

    ) : (

        foods
    .filter((item) => item.bestSeller)
    .map((item) => (

            <div
                className="menu-card"
                key={item._id}
            >

                <div
                    className={`badge ${
                        item.isVeg
                            ? "veg"
                            : "nonveg"
                    }`}
                >
                    {item.isVeg
                        ? "Veg"
                        : "Non Veg"}
                </div>

                <img
                    src={
                        item.image ||
                        "/images/food-placeholder.jpg"
                    }
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror =
                            null;

                        e.currentTarget.src =
                            "/images/food-placeholder.jpg";
                    }}
                />

                <h3>
                    {item.name}
                </h3>

                <div className="card-bottom">

                    <span className="price">
                        ₹{item.price}
                    </span>

                    <span className="rating">
                        ⭐ {item.rating || "0"}
                    </span>

                </div>

                <button
                    className="add-btn"
                    onClick={() =>
                        addToCart({
                            id: item._id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                        })
                    }
                >
                    Add to Cart
                </button>

            </div>

        ))

    )}

</div>


          <div className="view-menu">

            <button
              className="view-menu-btn"
              onClick={() =>
                navigate("/menu")
              }
            >
              View Full Menu →
            </button>

          </div>

        </section>



        {/* =================================================
            OFFERS
        ================================================= */}

        <section className="offers">

          <div className="section-heading">

            <h2>
              Today's Special Offers
            </h2>

            <p>
              Limited Time Deals • Grab Them Before They're Gone
            </p>

          </div>


          <div className="offers-grid">


            <div className="offer-card">

              <div className="offer-icon">
                <BadgePercent
                  size={55}
                  strokeWidth={2.2}
                />
              </div>

              <h3>
                20% OFF
              </h3>

              <p>
                On Orders Above ₹499
              </p>

              <button
                onClick={() =>
                  navigate("/menu")
                }
              >
                Order Now
              </button>

            </div>


            <div className="offer-card">

              <div className="offer-icon">
                <CupSoda
                  size={55}
                  strokeWidth={2.2}
                />
              </div>

              <h3>
                Free Thums Up 250ml
              </h3>

              <p>
                On Orders Above ₹699
              </p>

              <button
                onClick={() =>
                  navigate("/menu")
                }
              >
                Claim Offer
              </button>

            </div>


            <div className="offer-card">

              <div className="offer-icon">
                <Truck
                  size={55}
                  strokeWidth={2.2}
                />
              </div>

              <h3>
                Free Delivery
              </h3>

              <p>
                Within 5 KM Radius
              </p>

              <button
                onClick={() =>
                  navigate("/menu")
                }
              >
                Order Now
              </button>

            </div>


          </div>

        </section>



        {/* =================================================
            WHY US
        ================================================= */}

        <section className="why-us">

          <div className="section-heading">

            <h2>
              Why Choose Dum House?
            </h2>

            <p>
              Fresh Ingredients • Authentic Taste • Fast Delivery
            </p>

          </div>


          <div className="why-grid">


            <div className="why-card">

              <Clock3 size={48} />

              <h3>
                30 Min Delivery
              </h3>

              <p>
                Your favorite biryani delivered hot and fresh in just 30 minutes.
              </p>

            </div>


            <div className="why-card">

              <ChefHat size={48} />

              <h3>
                Freshly Cooked
              </h3>

              <p>
                Every order is prepared only after you place it.
              </p>

            </div>


            <div className="why-card">

              <ShieldCheck size={48} />

              <h3>
                100% Hygienic
              </h3>

              <p>
                Prepared in a clean kitchen following strict food safety standards.
              </p>

            </div>


          </div>

        </section>



        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="reviews">

          <div className="section-heading">

            <h2>
              What Our Customers Say
            </h2>

            <p>
              Loved by Biryani Lovers Across the City
            </p>

          </div>


          <div className="reviews-grid">


            <div className="review-card">

              <div className="stars">
                ★★★★★
              </div>

              <p>
                "Best Chicken Dum Biryani I've had in a long time. The taste was authentic and the delivery was super fast."
              </p>

              <h4>
                — Rohit
              </h4>

            </div>


            <div className="review-card">

              <div className="stars">
                ★★★★★
              </div>

              <p>
                "Mughalai Biryani was absolutely delicious. Fresh ingredients, premium quality, and excellent packaging."
              </p>

              <h4>
                — Jagan
              </h4>

            </div>


            <div className="review-card">

              <div className="stars">
                ★★★★★
              </div>

              <p>
                "Chicken Fried Rice exceeded my expectations. Definitely ordering again with my family!"
              </p>

              <h4>
                — Priya
              </h4>

            </div>


          </div>

        </section>



        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">

          <div className="footer-container">


            <div className="footer-box">

              <h2>
                DUM HOUSE
              </h2>

              <p>
                Serving authentic biryanis with rich flavors,
                premium ingredients and fast delivery.
              </p>

            </div>


            <div className="footer-box">

              <h3>
                Contact
              </h3>

              <p>
                <Phone size={16} />
                +91 98765 43210
              </p>

              <p>
                <Mail size={16} />
                support@dumhouse.com
              </p>

              <p>
                <MapPin size={16} />
                Hyderabad, Telangana
              </p>

            </div>


            <div className="footer-box">

              <h3>
                Opening Hours
              </h3>

              <p>
                <Clock3 size={16} />
                Mon - Sun
              </p>

              <p>
                10:00 AM - 11:30 PM
              </p>

            </div>


            <div className="footer-box">

              <h3>
                Follow Us
              </h3>

              <div className="social-icons">

                <FaFacebookF />

                <FaInstagram />

                <FaWhatsapp />

              </div>

            </div>


          </div>

        </footer>


      </>
    );
  }


  export default Home;