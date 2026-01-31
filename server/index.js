const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Cashfree, CFEnvironment } = require("cashfree-pg");
const joi = require("joi");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Cashfree
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
);

// Validation schema
const orderSchema = joi.object({
  order_amount: joi.number().positive().required(),
  customer_name: joi.string().required(),
  customer_email: joi.string().email().required(),
  customer_phone: joi.string().pattern(/^[0-9]{10}$/).required(),
  customer_id: joi.string().optional(),
});

// API endpoint to create order
app.post("/api/create-order", async (req, res) => {
  try {
    console.log("Received request body:", req.body); 

    // Validate request body
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message); 
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }

    // Generate unique order ID
    const orderID = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const request = {
      order_amount: value.order_amount,
      order_currency: "INR",
      order_id: orderID,
      customer_details: {
        customer_id: value.customer_id || `customer_${Date.now()}`,
        customer_phone: value.customer_phone,
        customer_name: value.customer_name,
        customer_email: value.customer_email,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/payment-status?order_id={order_id}`,
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      order_note: "Payment for order",
    };

    console.log("Sending to Cashfree:", JSON.stringify(request, null, 2)); 

    // Create order
    const response = await cashfree.PGCreateOrder(request);

    console.log("Cashfree response:", response.data); 

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error response data:", error.response?.data); 
    console.error("Error status:", error.response?.status); 
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to create order",
      error: error.response?.data || error.message,
    });
  }
});

// API endpoint to fetch order status
app.get("/api/order-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await cashfree.PGOrderFetchPayments(orderId);

    let orderStatus = "Failure";
    const payments = response.data || [];

    if (payments.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
      orderStatus = "Success";
    } else if (payments.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
      orderStatus = "Pending";
    }

    res.status(200).json({
      success: true,
      orderStatus,
      payments: response.data,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch order status",
      error: error.response?.data || error.message,
    });
  }
});

// Webhook endpoint for Cashfree payment notifications
app.post("/api/webhook", async (req, res) => {
  try {
    const { order_id, order_status, payment_status } = req.body;

    console.log("Webhook received:", {
      order_id,
      order_status,
      payment_status,
    });

    

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});