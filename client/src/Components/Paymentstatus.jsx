import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import backend_url from "../config/api";
function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderDetails, setOrderDetails] = useState(null);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        const response = await axios.get(
          `${backend_url}/api/order-status/${orderId}`,
        );

        if (response.data.success) {
          setOrderDetails(response.data);
          setStatus(response.data.orderStatus.toLowerCase());
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
        setStatus("error");
      }
    };

    fetchOrderStatus();
  }, [orderId]);

  const handleBackToHome = () => {
    navigate("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your transaction has been completed successfully.
            </p>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Pending
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please check back later.
            </p>
          </>
        )}

        {(status === "failure" || status === "error") && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              Something went wrong with your payment. Please try again.
            </p>
          </>
        )}

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-sm font-mono font-semibold text-gray-800 break-all">
              {orderId}
            </p>
          </div>
        )}

        {orderDetails &&
          orderDetails.payments &&
          orderDetails.payments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Payment Details
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    ₹{orderDetails.payments[0].payment_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold">
                    {orderDetails.payments[0].payment_group || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">
                    {new Date(
                      orderDetails.payments[0].payment_time,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        <button
          onClick={handleBackToHome}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default PaymentStatus;
