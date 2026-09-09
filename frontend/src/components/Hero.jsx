import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      style={{
        width: "100%",
        height: "calc(100vh - 78px)",
        minHeight: "650px",
        position: "relative",
        overflow: "hidden",
        backgroundImage: 'url("/images/hero-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, rgba(0,0,0,.80) 0%, rgba(0,0,0,.68) 30%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.08) 100%)",
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,

          /* MAIN POSITION */
          left: "6.3%",
          top: "50%",
          transform: "translateY(-50%)",

          width: "570px",

          color: "#fff",
        }}
      >

        {/* =========================
            MAIN HEADING
        ========================= */}

        <div
          style={{
            margin: 0,
            padding: 0,

            fontFamily:
              'Impact, "Arial Narrow", sans-serif',

            fontSize: "68px",
            fontWeight: 400,
            lineHeight: "1.02",

            letterSpacing: "1px",

            textTransform: "uppercase",

            textShadow:
              "3px 4px 8px rgba(0,0,0,.85)",
          }}
        >

          {/* AUTHENTIC BIRYANI, DELIVERED */}

          <div
            style={{
              whiteSpace: "nowrap",
              color: "#fff",
            }}
          >
            AUTHENTIC BIRYANI, DELIVERED
          </div>

          {/* HOT CENTER */}

          <div
            style={{
              width: "570px",

              textAlign: "center",

              color: "#ff5a00",

              fontFamily:
                'Impact, "Arial Narrow", sans-serif',

              fontSize: "68px",

              lineHeight: "1",

              marginTop: "2px",
            }}
          >
            HOT!
          </div>

        </div>


        {/* =========================
            DECORATIVE LINE
        ========================= */}

        <div
          style={{
            width: "570px",
            height: "20px",

            marginTop: "25px",
            marginBottom: "20px",

            display: "flex",
            alignItems: "center",

            gap: "10px",
          }}
        >

          {/* LEFT */}

          <div
            style={{
              flex: 1,
              height: "2px",

              background:
                "linear-gradient(90deg, transparent, #ff6500)",
            }}
          />

          {/* STAR */}

          <div
            style={{
              width: "18px",
              textAlign: "center",

              color: "#ff6500",

              fontSize: "18px",

              lineHeight: "1",

              transform: "rotate(45deg)",
            }}
          >
            ✦
          </div>

          {/* RIGHT */}

          <div
            style={{
              flex: 1,
              height: "2px",

              background:
                "linear-gradient(90deg, #ff6500, transparent)",
            }}
          />

        </div>


        {/* =========================
            ITEMS
        ========================= */}

        <div
          style={{
            width: "570px",

            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",

            whiteSpace: "nowrap",

            color: "#f3e8dd",

            fontFamily:
              '"Arial Narrow", Arial, sans-serif',

            fontSize: "21px",

            fontWeight: 400,

            lineHeight: "1.5",

            textShadow:
              "0 3px 8px rgba(0,0,0,.85)",
          }}
        >

          <span>Dum</span>

          <span
            style={{
              color: "#ff5a00",
              margin: "0 10px",
            }}
          >
            •
          </span>

          <span>Fry Piece</span>

          <span
            style={{
              color: "#ff5a00",
              margin: "0 10px",
            }}
          >
            •
          </span>

          <span>Mughalai</span>

          <span
            style={{
              color: "#ff5a00",
              margin: "0 10px",
            }}
          >
            •
          </span>

          <span>Egg</span>

          <span
            style={{
              color: "#ff5a00",
              margin: "0 10px",
            }}
          >
            •
          </span>

          <span>Veg</span>

          <span
            style={{
              color: "#ff5a00",
              margin: "0 10px",
            }}
          >
            •
          </span>

          <span>Fried Rice</span>

        </div>


        {/* =========================
            BUTTONS
        ========================= */}

        <div
          style={{
            width: "570px",

            display: "flex",
            alignItems: "center",

            justifyContent: "flex-start",

            gap: "35px",

            marginTop: "34px",
          }}
        >

          {/* EXPLORE MENU */}

          <Link
            to="/menu"
            style={{
              width: "300px",
              height: "76px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              boxSizing: "border-box",

              background: "#f4510b",

              color: "#fff",

              border: "2px solid #f4510b",

              borderRadius: "40px",

              textDecoration: "none",

              fontFamily:
                '"Arial Narrow", Arial, sans-serif',

              fontSize: "22px",

              fontWeight: 700,

              letterSpacing: "0.5px",
            }}
          >
            EXPLORE MENU
          </Link>


          {/* ORDER NOW */}

          <Link
            to="/menu"
            style={{
              width: "270px",
              height: "76px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              boxSizing: "border-box",

              background: "rgba(0,0,0,.12)",

              color: "#fff",

              border: "2px solid #ff6500",

              borderRadius: "40px",

              textDecoration: "none",

              fontFamily:
                '"Arial Narrow", Arial, sans-serif',

              fontSize: "22px",

              fontWeight: 700,

              letterSpacing: "0.5px",
            }}
          >
            ORDER NOW
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Hero;