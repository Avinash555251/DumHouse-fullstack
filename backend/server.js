const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
/* =====================================================
   JWT AUTHENTICATION MIDDLEWARE
===================================================== */

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required.",
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, user) => {
            if (error) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token.",
                });
            }

            req.user = user;

            next();
        }
    );
}
function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required."
      });
    }

    next();
  });
}

const Food = require("./models/Food");
const User = require("./models/User");
const Order = require("./models/Order");


const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   HOME ROUTE
===================================================== */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Dum House Backend is running",
    });
});

/* =====================================================
   FOOD ROUTES
===================================================== */

// Get all foods
app.get("/api/foods", async (req, res) => {
    try {
        const foods = await Food.find({
            isAvailable: true,
        }).sort({
            menuOrder: 1,
        });

        res.json({
            success: true,
            foods,
        });
    } catch (error) {
        console.error("Get Foods Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch foods",
        });
    }
});

// Add food
app.post("/api/foods", async (req, res) => {
    try {
        const food = await Food.create(req.body);

        res.status(201).json({
            success: true,
            message: "Food added successfully",
            food,
        });
    } catch (error) {
        console.error("Add Food Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add food",
            error: error.message,
        });
    }
});

// Fix Chicken Fried Rice
app.put("/api/foods/fix-chicken-fried-rice", async (req, res) => {
    try {
        const food = await Food.findOneAndUpdate(
            {
                name: "Chicken Fried Rice",
                image: "/images/chicken-fried-rice.jpg",
            },
            {
                menuOrder: 6,
                bestSeller: true,
            },
            {
                new: true,
            }
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Chicken Fried Rice not found",
            });
        }

        res.json({
            success: true,
            message: "Chicken Fried Rice order fixed",
            food,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update food",
        });
    }
});

// Fix menu order
app.put("/api/foods/fix-menu-order", async (req, res) => {
    try {
        const order = [
            "Chicken Dum Biryani",
            "Fry Piece Biryani",
            "Mughalai Biryani",
            "Egg Biryani",
            "Veg Biryani",
            "Chicken Fried Rice",
            "Kaju Fried Rice",
            "Veg Fried Rice",
            "Thums Up 250ml",
            "Sprite 250ml",
        ];

        for (let i = 0; i < order.length; i++) {
            await Food.findOneAndUpdate(
                {
                    name: order[i],
                },
                {
                    menuOrder: i + 1,
                }
            );
        }

        res.json({
            success: true,
            message: "Menu order updated successfully",
        });
    } catch (error) {
        console.error("Fix Menu Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update menu order",
        });
    }
});

/* =====================================================
   RAZORPAY PAYMENT VERIFICATION
===================================================== */

const crypto = require("crypto");

/* =====================================================
   UPI PAYMENT STATUS
===================================================== */

app.get(
    "/api/payment/status/:orderId",
    authenticateToken,
    async (req, res) => {
        try {
            const { orderId } = req.params;

            const order = await Order.findOne({ orderId });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Payment order not found.",
                });
            }

            if (
                order.customer.phone !== req.user.phone
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to access this payment.",
                });
            }

            /*
             * IMPORTANT:
             * Real UPI verification provider will be
             * connected here later.
             *
             * Until then, existing order status is returned.
             */

            return res.json({
                success: true,
                orderId: order.orderId,
                status: order.status,
            });

        } catch (error) {
            console.error(
                "UPI Payment Status Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to check payment status.",
            });
        }
    }
);

/* =====================================================
   ORDER ROUTES
===================================================== */

// Create Order
app.post("/api/orders", async (req, res) => {
    try {
        const {
            orderId,
            customer,
            items,
            total,
            paymentMethod,
        } = req.body;

        // Validation
        if (
            !orderId ||
            !customer ||
            !customer.name ||
            !customer.phone ||
            !customer.address ||
            !customer.city ||
            !customer.pincode ||
            !items ||
            items.length === 0 ||
            total === undefined ||
            !paymentMethod
        ) {
            return res.status(400).json({
                success: false,
                message: "Required order details are missing.",
            });
        }
        // Validate payment method
        const allowedPaymentMethods = ["upi", "card", "cod"];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method.",
            });
        }

        // Validate items
        for (const item of items) {
            if (
                !item.id ||
                !item.name ||
                item.price === undefined ||
                item.quantity === undefined ||
                Number(item.price) < 0 ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order item.",
                });
            }
        }

        // Calculate total on backend
        const calculatedTotal = items.reduce((sum, item) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            return sum + price * quantity;
        }, 0);

        // Compare frontend total with backend calculated total
        if (Math.abs(Number(total) - calculatedTotal) > 0.01) {
                return res.status(400).json({
                success: false,
                message: "Order total mismatch.",
            });
        }
        // Create order
        const order = await Order.create({
            orderId,
            customer,
            items,
            total: calculatedTotal,
            paymentMethod,
status: paymentMethod === "upi"
    ? "Payment Pending"
    : "Confirmed",
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order,
        });
        } catch (error) {
        console.error("Create Order Error:", error);

        // Duplicate order ID
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Order ID already exists. Please try again.",
            });
        }

        // Mongoose validation error
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid order details.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create order.",
        });
    }
});

/* =====================================================
   CONFIRM UPI PAYMENT / ORDER
===================================================== */

app.post(
  "/api/orders/confirm-payment",
  authenticateToken,
  async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
      }

      const order = await Order.findOne({ orderId });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      // Make sure this order belongs to logged-in customer
      if (order.customer.phone !== req.user.phone) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to confirm this order.",
        });
      }

      // Already confirmed
      if (order.status === "Confirmed") {
        return res.json({
          success: true,
          message: "Order already confirmed.",
          order,
        });
      }

      // Only pending UPI orders can be confirmed
      if (
        order.paymentMethod !== "upi" ||
        order.status !== "Payment Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order cannot be confirmed as a UPI payment.",
        });
      }

      // Confirm order
      order.status = "Confirmed";

      await order.save();

      return res.json({
        success: true,
        message: "UPI order confirmed successfully.",
        order,
      });

    } catch (error) {
      console.error(
        "Confirm UPI Order Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to confirm UPI order.",
      });
    }
  }
);

/* =====================================================
   UPDATE ORDER STATUS
===================================================== */

app.put("/api/orders/:id/status", authenticateAdmin, async (req, res) => {
        try {
        const { id } = req.params;
        const { status } = req.body;

        /* ===============================
           ALLOWED STATUSES
        =============================== */

        const allowedStatuses = [
            "Payment Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        /* ===============================
           FIND ORDER
        =============================== */
const existingOrder = await Order.findById(id);

if (!existingOrder) {
    return res.status(404).json({
        success: false,
        message: "Order not found.",
    });
}

if (
    existingOrder.status === "Delivered" ||
    existingOrder.status === "Cancelled"
) {
    return res.status(400).json({
        success: false,
        message: `Order is already ${existingOrder.status}. Status cannot be changed.`,
    });
}
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        /* =================================================
           COMPLETED / CANCELLED ORDER LOCK
        ================================================= */

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `This order is already ${order.status} and cannot be changed.`,
            });
        }

        /* =================================================
           STATUS PROGRESSION
        ================================================= */

        const statusFlow = {
            Confirmed: [
                "Preparing",
                "Cancelled",
            ],

            Preparing: [
                "Out for Delivery",
                "Cancelled",
            ],

            "Out for Delivery": [
                "Delivered",
                "Cancelled",
            ],
        };

        /* =================================================
           CHECK STATUS PROGRESSION
        ================================================= */

        if (
            !statusFlow[order.status] ||
            !statusFlow[order.status].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change order from ${order.status} to ${status}.`,
            });
        }

        /* ===============================
           UPDATE STATUS
        =============================== */

        order.status = status;

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully.",
            order,
        });
    } catch (error) {
        console.error(
            "Update Order Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to update order status.",
        });
    }
});

// Get orders for a specific customer
app.get(
    "/api/orders/customer/:phone",
    authenticateToken,
    async (req, res) => {
            try {
        const { phone } = req.params;
                if (req.user.phone !== phone) {
    return res.status(403).json({
        success: false,
        message: "You are not allowed to access these orders.",
    });
}

        const orders = await Order.find({
            "customer.phone": phone,
        }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            orders,
        });

    } catch (error) {
        console.error(
            "Get Customer Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch customer orders.",
        });
    }
});
/* =====================================================
   GET ALL ORDERS
===================================================== */

app.get("/api/orders", authenticateAdmin, async (req, res) => {    try {
        const orders = await Order.find()
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Get Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch orders.",
        });
    }
});

/* =====================================================
   UPDATE FOOD
===================================================== */

app.put("/api/foods/:id", async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found",
            });
        }

        res.json({
            success: true,
            message: "Food updated successfully",
            food,
        });
    } catch (error) {
        console.error("Update Food Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update food",
            error: error.message,
        });
    }
});

/* =====================================================
   FIND USER BY PHONE
===================================================== */

app.get("/api/users/:phone", async (req, res) => {
    try {
        const { phone } = req.params;

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number.",
            });
        }

        const user = await User.findOne({
            phone,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,

            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error(
            "Find User Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
});

/* =====================================================
   VERIFY MSG91 ACCESS TOKEN
===================================================== */

app.post("/api/auth/verify-msg91", async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: "Access token is required.",
            });
        }

        const response = await fetch(
            "https://control.msg91.com/api/v5/widget/verifyAccessToken",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    authkey:
                        process.env.MSG91_AUTH_KEY,

                    "access-token":
                        accessToken,
                }),
            }
        );

        const data = await response.json();

        console.log(
            "MSG91 verification response:",
            data
        );

        if (!response.ok) {
            return res.status(401).json({
                success: false,
                message:
                    "MSG91 token verification failed.",
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Mobile number verified successfully.",

            msg91: data,
        });
    } catch (error) {
        console.error(
            "MSG91 Verification Error:",
            error.message
        );

        return res.status(500).json({
            success: false,

            message:
                "Unable to verify OTP.",
        });
    }
});

/* =====================================================
   USER LOGIN
===================================================== */

app.post("/api/users/login", async (req, res) => {
    try {
        const { name, phone } = req.body;

        /* ===============================
           VALIDATION
        =============================== */

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message:
                    "Name and phone number are required.",
            });
        }

        /* ===============================
           PHONE VALIDATION
        =============================== */

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid 10-digit mobile number.",
            });
        }

        /* ===============================
           FIND USER
        =============================== */

        let user =
            await User.findOne({
                phone,
            });

        /* ===============================
           CREATE USER
        =============================== */

        if (!user) {
            user =
                await User.create({
                    name: name.trim(),
                    phone: phone,
                });
        }

        /* ===============================
   GENERATE JWT TOKEN
=============================== */

const token = jwt.sign(
    {
        userId: user._id,
        phone: user.phone,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d",
    }
);
        /* ===============================
           RESPONSE
        =============================== */

        res.status(200).json({
            success: true,

            message:
                "Login successful.",

            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
            },
            token: token,
        });
    } catch (error) {
        console.error(
            "User Login Error:",
            error.message
        );

        res.status(500).json({
            success: false,

            message:
                "Server error. Please try again.",
        });
    }
});

/* =====================================================
   MONGODB CONNECTION
===================================================== */

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log(
            "MongoDB Connected Successfully"
        );

        const PORT =
            process.env.PORT || 5000;

        app.listen(
            PORT,
            () => {
                console.log(
                    `Dum House Backend running on port ${PORT}`
                );
            }
        );
    })
    .catch((error) => {
        console.error(
            "MongoDB Connection Failed:",
            error.message
        );
    });

/* =====================================================
   DATABASE NAME
===================================================== */

mongoose.connection.once("open", () => {
    console.log(
        "DATABASE NAME:",
        mongoose.connection.name
    );
});