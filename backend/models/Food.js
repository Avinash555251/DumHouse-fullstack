const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        isVeg: {
            type: Boolean,
            default: true,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        bestSeller: {
    type: Boolean,
    default: false,
},
menuOrder: {
    type: Number,
    default: 0,
},
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Food", foodSchema);