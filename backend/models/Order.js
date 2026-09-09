const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "cod"],
      required: true,
    },

    status: {
  type: String,
  enum: [
    "Payment Pending",
    "Confirmed",
    "Payment Failed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ],
  default: "Payment Pending",
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);