import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

/* =====================================================
   MSG91 WIDGET LOADER
===================================================== */

let msg91LoadPromise = null;

function loadMSG91Widget() {
    const tokenAuth =
        import.meta.env.VITE_MSG91_WIDGET_TOKEN;

    if (!tokenAuth) {
        return Promise.reject(
            new Error(
                "MSG91 widget token is missing. Check my-app/.env"
            )
        );
    }

    /* Already loaded */
    if (
        typeof window.initSendOTP === "function" &&
        window.__dumHouseMSG91Initialized
    ) {
        return Promise.resolve();
    }

    /* Prevent duplicate script loading */
    if (msg91LoadPromise) {
        return msg91LoadPromise;
    }

    msg91LoadPromise = new Promise(
        (resolve, reject) => {

            const configuration = {

                widgetId:
                    "3668726a7a50303236393532",

                tokenAuth: tokenAuth,

                exposeMethods: true,

                success: (data) => {

                    /* MSG91 returns the verified JWT/access token here
                       after OTP verification. Keep it available for the
                       login flow instead of depending on a particular
                       response shape from verifyOtp(). */
                    const accessToken =
                        getMSG91AccessToken(data);

                    if (accessToken) {
                        window.__dumHouseMSG91AccessToken =
                            accessToken;
                    }

                    console.log(
                        "MSG91 Widget Success:",
                        data
                    );

                },

                failure: (error) => {

                    console.error(
                        "MSG91 Widget Failure:",
                        error
                    );

                },
            };


            window.__dumHouseMSG91Config =
                configuration;


            const existingScript =
                document.querySelector(
                    'script[data-msg91-widget="true"]'
                );


            const initialize = () => {

                try {

                    if (
                        typeof window.initSendOTP !==
                        "function"
                    ) {

                        reject(
                            new Error(
                                "MSG91 initSendOTP is not available."
                            )
                        );

                        return;
                    }


                    if (
                        !window.__dumHouseMSG91Initialized
                    ) {

                        window.initSendOTP(
                            configuration
                        );

                        window.__dumHouseMSG91Initialized =
                            true;
                    }


                    resolve();

                } catch (error) {

                    reject(error);

                }

            };


            if (existingScript) {

                if (
                    typeof window.initSendOTP ===
                    "function"
                ) {

                    initialize();

                } else {

                    existingScript.addEventListener(
                        "load",
                        initialize,
                        { once: true }
                    );

                    existingScript.addEventListener(
                        "error",
                        () =>
                            reject(
                                new Error(
                                    "MSG91 script failed to load."
                                )
                            ),
                        { once: true }
                    );

                }

                return;
            }


            const script =
                document.createElement(
                    "script"
                );

            script.type =
                "text/javascript";

            script.src =
                "https://verify.msg91.com/otp-provider.js";

            script.async = true;

            script.dataset.msg91Widget =
                "true";


            script.onload = initialize;


            script.onerror = () => {

                reject(
                    new Error(
                        "Unable to load MSG91 OTP service."
                    )
                );

            };


            document.head.appendChild(
                script
            );

        }
    );


    return msg91LoadPromise;
}


/* =====================================================
   GET ACCESS TOKEN FROM MSG91 RESPONSE
===================================================== */

function getMSG91AccessToken(data) {

    /* MSG91 has returned the token under slightly different keys/shapes
       across widget versions. Handle the documented forms plus common
       snake_case / nested forms. */
    const directToken =
        data?.message ||
        data?.accessToken ||
        data?.["access-token"] ||
        data?.access_token ||
        data?.token ||
        data?.jwt ||
        data?.data?.accessToken ||
        data?.data?.["access-token"] ||
        data?.data?.access_token ||
        data?.data?.token ||
        data?.data?.jwt ||
        data?.response?.accessToken ||
        data?.response?.["access-token"] ||
        data?.response?.access_token ||
        data?.response?.token ||
        data?.response?.jwt ||
        null;

    return directToken ||
        window.__dumHouseMSG91AccessToken ||
        null;
}


async function waitForMSG91AccessToken(data) {
    const immediateToken =
        getMSG91AccessToken(data);

    if (immediateToken) {
        return immediateToken;
    }

    /* The widget can fire its configuration success callback immediately
       after verifyOtp() succeeds. Give that callback a short window to
       publish the JWT. */
    for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) =>
            setTimeout(resolve, 50)
        );

        const accessToken =
            getMSG91AccessToken(data);

        if (accessToken) {
            return accessToken;
        }
    }

    return null;
}


/* =====================================================
   LOGIN COMPONENT
===================================================== */

function Login({ onLogin }) {

    const navigate =
        useNavigate();


    /* =====================================================
       BACKEND URL
    ===================================================== */

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;


    /* =====================================================
       SCREEN
    ===================================================== */

    const [screen, setScreen] =
        useState("new");


    /* =====================================================
       USER DATA
    ===================================================== */

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [otp, setOtp] =
        useState("");


    /* =====================================================
       LOADING
    ===================================================== */

    const [loading, setLoading] =
        useState(false);
    const msg91ReqId = useRef(null);

    /* =====================================================
       LOAD MSG91 ONCE
    ===================================================== */

    useEffect(() => {

        loadMSG91Widget()
            .then(() => {

                console.log(
                    "MSG91 Widget Loaded Successfully"
                );

            })
            .catch((error) => {

                console.error(
                    "MSG91 Widget Load Error:",
                    error.message
                );

            });

    }, []);


    /* =====================================================
       PHONE CHANGE
    ===================================================== */

    function handlePhoneChange(e) {

        const value =
            e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

        setPhone(value);
    }


    /* =====================================================
       OTP CHANGE
    ===================================================== */

    function handleOtpChange(e) {

        const value =
            e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

        setOtp(value);
    }


    /* =====================================================
       SEND REAL OTP
    ===================================================== */

    function sendRealOTP(
        mobileNumber,
        successCallback,
        failureCallback
    ) {

        loadMSG91Widget()
            .then(() => {

                if (
                    typeof window.sendOtp !==
                    "function"
                ) {

                    throw new Error(
                        "MSG91 sendOtp is not available."
                    );

                }


                const identifier =
                    `91${mobileNumber}`;

                /* A new OTP request must not reuse an old verified token. */
                window.__dumHouseMSG91AccessToken = null;
                msg91ReqId.current = null;

                window.sendOtp(

                    identifier,

                    (data) => {

                        console.log(
                            "OTP Sent Successfully:",
                            data
                        );
                        msg91ReqId.current =
    data?.reqId ||
    data?.requestId ||
    data?.request_id ||
    null;

console.log(
    "MSG91 Request ID:",
    msg91ReqId.current
);
                        successCallback(data);

                    },

                    (error) => {

                        console.error(
                            "OTP Send Failed:",
                            error
                        );

                        failureCallback(error);

                    }

                );

            })
            .catch((error) => {

                console.error(
                    "MSG91 Send OTP Error:",
                    error
                );

                failureCallback(error);

            });

    }


    /* =====================================================
       VERIFY REAL OTP
    ===================================================== */

    function verifyRealOTP(
    otpValue,
    successCallback,
    failureCallback
) {

    if (
        typeof window.verifyOtp !==
        "function"
    ) {

        failureCallback(
            new Error(
                "MSG91 verifyOtp is not available."
            )
        );

        return;
    }


    window.verifyOtp(

        otpValue,

        (data) => {

            console.log(
                "MSG91 OTP Verified:",
                data
            );

            successCallback(data);

        },

        (error) => {

            console.error(
                "MSG91 OTP Verification Failed:",
                error
            );

            failureCallback(error);

        },
msg91ReqId.current
    );

}


    /* =====================================================
       VERIFY ACCESS TOKEN WITH BACKEND
    ===================================================== */

    async function verifyAccessToken(
        accessToken
    ) {

        const response =
            await fetch(
                `${API_URL}/api/auth/verify-msg91`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        accessToken,
                    }),
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "MSG91 access token verification failed."
            );

        }


        return data;
    }


    /* =====================================================
       NEW USER - CHECK USER + SEND OTP
    ===================================================== */

    async function handleNewUser(e) {

        e.preventDefault();


        if (!name.trim()) {

            alert(
                "Please enter your name."
            );

            return;
        }


        if (phone.length !== 10) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        try {

            setLoading(true);


            /* =============================================
               CHECK USER IN MONGODB
            ============================================= */

            const response =
                await fetch(
                    `${API_URL}/api/users/${phone}`
                );


            /* =============================================
               USER ALREADY EXISTS
            ============================================= */

            if (response.ok) {

                alert(
                    "This mobile number is already registered. Please use Existing User Login."
                );

                setScreen(
                    "existing"
                );

                setOtp("");

                return;
            }


            /* =============================================
               SEND REAL OTP
            ============================================= */

            sendRealOTP(

                phone,

                () => {

                    setOtp("");

                    setScreen(
                        "newOtp"
                    );

                    setLoading(false);

                },

                (error) => {

                    setLoading(false);

                    alert(
                        error?.message ||
                        "Unable to send OTP. Please try again."
                    );

                }

            );


        } catch (error) {

            console.error(
                "New User Error:",
                error
            );

            alert(
                "Unable to connect to server. Please make sure backend is running."
            );

            setLoading(false);

        }

    }


    /* =====================================================
       EXISTING USER - CHECK USER + SEND OTP
    ===================================================== */

    async function handleExistingUser(e) {

        e.preventDefault();


        if (phone.length !== 10) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        try {

            setLoading(true);


            /* =============================================
               FIND USER IN MONGODB
            ============================================= */

            const response =
                await fetch(
                    `${API_URL}/api/users/${phone}`
                );


            /* =============================================
               USER NOT FOUND
            ============================================= */

            if (!response.ok) {

                alert(
                    "No account found with this mobile number. Please create a new account."
                );

                setScreen(
                    "new"
                );

                setName("");

                setOtp("");

                setLoading(false);

                return;
            }


            const data =
                await response.json();

                if (data.success && data.token) {
    localStorage.setItem("dumHouseToken", data.token);
}

            /* =============================================
               SAVE CURRENT USER TEMPORARILY
            ============================================= */

            if (
                data.success &&
                data.user
            ) {

                localStorage.setItem(

                    "dumHousePendingUser",

                    JSON.stringify(
                        data.user
                    )

                );

            }


            /* =============================================
               SEND REAL OTP
            ============================================= */

            sendRealOTP(

                phone,

                () => {

                    setOtp("");

                    setScreen(
                        "existingOtp"
                    );

                    setLoading(false);

                },

                (error) => {

                    setLoading(false);

                    alert(
                        error?.message ||
                        "Unable to send OTP. Please try again."
                    );

                }

            );


        } catch (error) {

            console.error(
                "Existing User Error:",
                error
            );

            alert(
                "Unable to connect to server. Please make sure backend is running."
            );

            setLoading(false);

        }

    }


    /* =====================================================
       VERIFY NEW USER
    ===================================================== */

    async function verifyNewUser(e) {

        e.preventDefault();


        if (otp.length !== 6) {

            alert(
                "Please enter the 6-digit OTP."
            );

            return;
        }


        try {

            setLoading(true);


            /* =============================================
               VERIFY OTP WITH MSG91
            ============================================= */

            verifyRealOTP(

                otp,

                async (msg91Data) => {

                    try {

                        /* =================================
                           GET ACCESS TOKEN
                        ================================= */

                        const accessToken =
                            await waitForMSG91AccessToken(
                                msg91Data
                            );


                        if (!accessToken) {

                            console.error(
                                "MSG91 response:",
                                msg91Data
                            );

                            throw new Error(
                                "MSG91 did not return an access token."
                            );

                        }


                        /* =================================
                           VERIFY ACCESS TOKEN ON BACKEND
                        ================================= */

                        await verifyAccessToken(
                            accessToken
                        );


                        /* =================================
                           CREATE USER IN MONGODB
                        ================================= */

                        const response =
                            await fetch(`${API_BASE_URL}/api/users/login`, {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },

                                    body:
                                        JSON.stringify(
                                            {
                                                name:
                                                    name.trim(),

                                                phone:
                                                    phone,
                                            }
                                        ),
                                }
                            );


                        const data =
                            await response.json();

                            if (data.success && data.token) {
    localStorage.setItem("dumHouseToken", data.token);
}

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Unable to create account."
                            );

                        }


                        /* =================================
                           SAVE USER
                        ================================= */

                        const newUser =
                            data.user;


                        localStorage.setItem(

                            "dumHouseUser",

                            JSON.stringify(
                                newUser
                            )

                        );


                        localStorage.removeItem(
                            "dumHousePendingUser"
                        );


                        /* =================================
                           LOGIN APP
                        ================================= */

                        onLogin(
                            newUser
                        );


                        navigate(
                            "/"
                        );


                    } catch (error) {

                        console.error(
                            "New User Verification Error:",
                            error
                        );

                        alert(
                            error.message ||
                            "Unable to verify OTP."
                        );

                    } finally {

                        setLoading(
                            false
                        );

                    }

                },

                (error) => {

                    setLoading(
                        false
                    );

                    alert(
                        error?.message ||
                        "Invalid or expired OTP."
                    );

                }

            );


        } catch (error) {

            console.error(
                "OTP Error:",
                error
            );

            alert(
                error.message ||
                "Unable to verify OTP."
            );

            setLoading(
                false
            );

        }

    }


    /* =====================================================
       VERIFY EXISTING USER
    ===================================================== */

    async function verifyExistingUser(e) {

    e.preventDefault();


    if (otp.length !== 6) {

        alert(
            "Please enter the 6-digit OTP."
        );

        return;
    }


    try {

        setLoading(true);


        /* =============================================
           VERIFY OTP WITH MSG91
        ============================================= */

        verifyRealOTP(

            otp,

            async (msg91Data) => {

                try {

                    /* =================================
                       GET ACCESS TOKEN FROM MSG91
                    ================================= */

                    const accessToken =
                        await waitForMSG91AccessToken(
                            msg91Data
                        );


                    if (!accessToken) {

                        console.error(
                            "MSG91 response:",
                            msg91Data
                        );

                        throw new Error(
                            "MSG91 did not return an access token."
                        );

                    }


                    /* =================================
                       VERIFY MSG91 TOKEN ON BACKEND
                    ================================= */

                    await verifyAccessToken(
                        accessToken
                    );


                    /* =================================
                       GET CURRENT USER
                    ================================= */

                    const savedPendingUser =
                        localStorage.getItem(
                            "dumHousePendingUser"
                        );


                    if (
                        !savedPendingUser
                    ) {

                        throw new Error(
                            "Session expired. Please login again."
                        );

                    }


                    let user;


                    try {

                        user =
                            JSON.parse(
                                savedPendingUser
                            );

                    } catch {

                        localStorage.removeItem(
                            "dumHousePendingUser"
                        );

                        throw new Error(
                            "Account data is invalid. Please login again."
                        );

                    }


                    /* =================================
                       FINAL PHONE CHECK
                    ================================= */

                    if (
                        !user ||
                        String(user.phone) !== String(phone)
                    ) {

                        throw new Error(
                            "User verification failed. Please try again."
                        );

                    }


                    /* =================================
                       CREATE APP LOGIN SESSION
                       GET JWT FROM BACKEND
                    ================================= */

                    const loginResponse =
                        await fetch(
                            `${API_URL}/api/users/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify({
                                        name:
                                            user.name,

                                        phone:
                                            user.phone,
                                    }),
                            }
                        );


                    const loginData =
                        await loginResponse.json();


                    /* =================================
                       BACKEND LOGIN ERROR
                    ================================= */

                    if (
                        !loginResponse.ok ||
                        !loginData.success
                    ) {

                        throw new Error(
                            loginData.message ||
                            "Unable to create login session."
                        );

                    }


                    /* =================================
                       SAVE JWT TOKEN
                    ================================= */

                    if (
                        !loginData.token
                    ) {

                        throw new Error(
                            "Login token was not received from server."
                        );

                    }


                    localStorage.setItem(
                        "dumHouseToken",
                        loginData.token
                    );


                    /* =================================
                       SAVE CURRENT USER
                    ================================= */

                    localStorage.setItem(
                        "dumHouseUser",
                        JSON.stringify(
                            loginData.user ||
                            user
                        )
                    );


                    /* =================================
                       REMOVE TEMPORARY USER
                    ================================= */

                    localStorage.removeItem(
                        "dumHousePendingUser"
                    );


                    /* =================================
                       LOGIN APP
                    ================================= */

                    onLogin(
                        loginData.user ||
                        user
                    );


                    /* =================================
                       GO TO HOME
                    ================================= */

                    navigate(
                        "/"
                    );


                } catch (error) {

                    console.error(
                        "Existing User Verification Error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to verify OTP."
                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            },

            (error) => {

                setLoading(
                    false
                );

                alert(
                    error?.message ||
                    "Invalid or expired OTP."
                );

            }

        );


    } catch (error) {

        console.error(
            "OTP Error:",
            error
        );

        alert(
            error.message ||
            "Unable to verify OTP."
        );

        setLoading(
            false
        );

    }

}


    /* =====================================================
       RESEND OTP
    ===================================================== */

    function handleResendOTP() {

        if (
            typeof window.retryOtp !==
            "function"
        ) {

            alert(
                "OTP service is not ready. Please try again."
            );

            return;
        }


        setLoading(true);

window.retryOtp(

    "11",

    (data) => {

        console.log(
            "OTP resent successfully:",
            data
        );

        setLoading(false);

        alert(
            "OTP resent successfully."
        );

    },

    (error) => {

        console.error(
            "Resend OTP Error:",
            error
        );

        setLoading(false);

        alert(
            error?.message ||
            "Unable to resend OTP."
        );

    },

    msg91ReqId.current
  
);

          

    }


    /* =====================================================
       NEW USER SCREEN
    ===================================================== */

    if (screen === "new") {

        return (

            <div className="login-page">

                <div className="login-container">

                    <div className="login-heading">

                        <h1>
                            Welcome to Dum House
                        </h1>

                        <p>
                            Create your account
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={handleNewUser}
                    >

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter 10-digit mobile number"
                                value={phone}
                                onChange={
                                    handlePhoneChange
                                }
                                maxLength="10"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Sending OTP..."
                                : "Continue"}

                        </button>


                    </form>


                    <div className="login-switch">

                        <p>
                            Already have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() => {

                                setPhone("");

                                setOtp("");

                                setScreen(
                                    "existing"
                                );

                            }}
                        >

                            Existing User Login

                        </button>

                    </div>


                </div>

            </div>

        );
    }


    /* =====================================================
       NEW USER OTP
    ===================================================== */

    if (screen === "newOtp") {

        return (

            <div className="login-page">

                <div className="login-container">

                    <div className="login-heading">

                        <h1>
                            Verify Mobile Number
                        </h1>

                        <p>
                            Enter the OTP sent to
                        </p>

                        <strong>
                            +91 {phone}
                        </strong>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={verifyNewUser}
                    >

                        <div className="form-group">

                            <label>
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={
                                    handleOtpChange
                                }
                                maxLength="6"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Verifying..."
                                : "Verify & Login"}

                        </button>


                    </form>


                    <button
                        type="button"
                        className="back-login-btn"
                        onClick={
                            handleResendOTP
                        }
                        disabled={loading}
                    >

                        Resend OTP

                    </button>


                    <button
                        type="button"
                        className="back-login-btn"
                        onClick={() => {

                            setOtp("");

                            setScreen(
                                "new"
                            );

                        }}
                    >

                        ← Back

                    </button>


                </div>

            </div>

        );
    }


    /* =====================================================
       EXISTING USER SCREEN
    ===================================================== */

    if (screen === "existing") {

        return (

            <div className="login-page">

                <div className="login-container">

                    <div className="login-heading">

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Login with your registered
                            mobile number
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={
                            handleExistingUser
                        }
                    >

                        <div className="form-group">

                            <label>
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter 10-digit mobile number"
                                value={phone}
                                onChange={
                                    handlePhoneChange
                                }
                                maxLength="10"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Sending OTP..."
                                : "Send OTP"}

                        </button>


                    </form>


                    <div className="login-switch">

                        <p>
                            Don't have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() => {

                                setName("");

                                setPhone("");

                                setOtp("");

                                setScreen(
                                    "new"
                                );

                            }}
                        >

                            Create New Account

                        </button>

                    </div>


                </div>

            </div>

        );
    }


    /* =====================================================
       EXISTING USER OTP
    ===================================================== */

    return (

        <div className="login-page">

            <div className="login-container">

                <div className="login-heading">

                    <h1>
                        Verify Mobile Number
                    </h1>

                    <p>
                        Enter the OTP sent to
                    </p>

                    <strong>
                        +91 {phone}
                    </strong>

                </div>


                <form
                    className="login-form"
                    onSubmit={
                        verifyExistingUser
                    }
                >

                    <div className="form-group">

                        <label>
                            Enter OTP
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={
                                handleOtpChange
                            }
                            maxLength="6"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify & Login"}

                    </button>


                </form>


                <button
                    type="button"
                    className="back-login-btn"
                    onClick={
                        handleResendOTP
                    }
                    disabled={loading}
                >

                    Resend OTP

                </button>


                <button
                    type="button"
                    className="back-login-btn"
                    onClick={() => {

                        setOtp("");

                        setScreen(
                            "existing"
                        );

                    }}
                >

                    ← Back

                </button>


            </div>

        </div>

    );

}


export default Login;