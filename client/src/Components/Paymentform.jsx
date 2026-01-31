import { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import axios from "axios";
import { useEffect } from "react";
import backend_url from "../config/api";
function PaymentForm() {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cashfree, setCashfree] = useState(null);

  // Initialize Cashfree SDK
  const initializeSDK = async () => {
    try {
      const cf = await load({
        mode: "sandbox", 
      });
      setCashfree(cf);
    } catch (err) {
      console.error("Failed to initialize Cashfree SDK:", err);
      setError("Failed to initialize payment system");
    }
  };

  useEffect(() => {
    initializeSDK();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (
      !formData.customer_email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)
    ) {
      setError("Please enter a valid email");
      return false;
    }
    if (
      !formData.customer_phone.trim() ||
      !/^[0-9]{10}$/.test(formData.customer_phone)
    ) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.order_amount || parseFloat(formData.order_amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cashfree) {
      setError("Payment system not initialized. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call backend API to create order
      const response = await axios.post(`${backend_url}/api/create-order`, {
        order_amount: parseFloat(formData.order_amount),
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
      });

      if (response.data.success) {
        const { payment_session_id } = response.data.data;

        // Open Cashfree checkout
        const checkoutOptions = {
          paymentSessionId: payment_session_id,
          redirectTarget: "_self",
        };

        cashfree.checkout(checkoutOptions);
      } else {
        setError(response.data.message || "Failed to create order");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to process payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Payment Gateway
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your details to proceed
        </p>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="9876543210"
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              name="order_amount"
              value={formData.order_amount}
              onChange={handleInputChange}
              placeholder="100.00"
              step="0.01"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Proceed to Pay"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Secured by Cashfree Payments
        </p>
      </div>
    </div>
  );
}

export default PaymentForm;
