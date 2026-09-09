import { useNavigate } from "react-router-dom";
import "./LoginPrompt.css";

function LoginPrompt({
  isLoggedIn,
  show,
  setShow,
}) {

  const navigate = useNavigate();

  if (isLoggedIn || !show) {
    return null;
  }


  function goToLogin() {

    setShow(false);

    navigate("/login");
  }


  return (
    <div className="login-prompt">

      <div className="login-prompt-icon">
        🔐
      </div>


      <div className="login-prompt-content">

        <h3>
          Login to Continue
        </h3>

        <p>
          Please login to add items to your cart
          and place orders.
        </p>

      </div>


      <button
        className="login-prompt-btn"
        onClick={goToLogin}
      >
        Login
      </button>


      <button
        className="login-prompt-close"
        onClick={() =>
          setShow(false)
        }
      >
        ×
      </button>

    </div>
  );
}

export default LoginPrompt;