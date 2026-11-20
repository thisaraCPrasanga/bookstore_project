
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api from "../services/api";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [payment, setPayment] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Load order details
  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");
      setOrder(null);
      setPayment(null);

      try {
        const response = await api.get(`/orders/${id}`);

        if (!cancelled) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error("Failed to load order:", error);

        if (!cancelled) {
          if (error.response?.status === 401) {
            setError("Please login to view this order.");
          } else if (error.response?.status === 404) {
            setError("Order not found.");
          } else {
            setError("Failed to load order details.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Prepare payment for an existing order
  async function handlePayNow() {
    if (
      !order ||
      order.status !== "PENDING_PAYMENT" ||
      preparingPayment ||
      payment
    ) {
      return;
    }

    setPreparingPayment(true);
    setPaymentError("");

    try {
      await api.get("/auth/csrf");

      const response = await api.post(
        `/payments/${order.id}/checkout`
      );

      setPayment(response.data);
    } catch (error) {
      console.error("Payment preparation failed:", error);

      setPaymentError(
        error.response?.data?.detail ||
        "Failed to prepare payment."
      );
    } finally {
      setPreparingPayment(false);
    }
  }

  if (loading) {
    return <p className="page-shell max-w-5xl text-sm text-gray-600">Loading order details...</p>;
  }

  if (error) {
    return (
      <section className="page-shell max-w-4xl">
        <p role="alert" className="alert-error">
          {error}
        </p>

        <Link
          to="/my-orders"
          className="mt-5 inline-block text-teal-700 hover:underline"
        >
          Back to My Orders
        </Link>
      </section>
    );
  }

  if (!order) {
    return <p className="page-shell max-w-5xl text-sm text-gray-600">Order not found.</p>;
  }

  return (
    <section className="page-shell max-w-4xl">
      <Link
        to="/my-orders"
        className="text-teal-700 hover:underline"
      >
        ← Back to My Orders
      </Link>

      <h1 className="page-title mt-4">
        Order Details
      </h1>

      {/* Order Information */}
      <div className="surface mt-5 p-4 sm:p-6">
        <h2 className="text-xl font-bold">
          {order.orderNumber}
        </h2>

        <p className="mt-4">
          <strong>Status:</strong>{" "}
          {order.status.replaceAll("_", " ")}
        </p>

        <p className="mt-3">
          <strong>Order Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleString("en-LK")}
        </p>

        <p className="mt-3">
          <strong>Email:</strong>{" "}
          {order.customerEmail}
        </p>
      </div>

      {/* Ordered Books */}
      <div className="surface mt-4 p-4 sm:p-6">
        <h2 className="text-xl font-bold">
          Ordered Books
        </h2>

        <div className="mt-5 space-y-5">
          {order.items.map((item) => (
            <div
              key={item.bookId}
              className="border-b border-gray-200 pb-4 wrap-anywhere last:border-0 last:pb-0"
            >
              <Link
                to={`/books/${item.bookId}`}
                className="font-semibold text-teal-700 hover:underline"
              >
                {item.bookTitle}
              </Link>

              <p className="mt-2 text-sm text-gray-600">
                Format: {item.bookFormat}
              </p>

              <p className="mt-2">
                Quantity: {item.quantity}
              </p>

              <p className="mt-2">
                Unit Price: Rs.{" "}
                {Number(item.unitPrice).toFixed(2)}
              </p>

              <p className="mt-2 font-semibold">
                Line Total: Rs.{" "}
                {Number(item.lineTotal).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Fulfilment:{" "}
                {item.fulfilmentStatus.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Details */}
      {order.address && (
        <div className="surface mt-4 p-4 sm:p-6">
          <h2 className="text-xl font-bold">
            Delivery Details
          </h2>

          <p className="mt-4">{order.address.fullName}</p>
          <p className="mt-2">{order.address.phone}</p>
          <p className="mt-2">{order.address.addressLine1}</p>

          {order.address.addressLine2 && (
            <p className="mt-2">
              {order.address.addressLine2}
            </p>
          )}

          <p className="mt-2">
            {order.address.city}
            {order.address.postalCode &&
              `, ${order.address.postalCode}`}
          </p>

          <p className="mt-2">
            {order.address.country}
          </p>
        </div>
      )}

      {/* Payment Summary */}
      <div className="surface mt-4 p-4 sm:p-6">
        <h2 className="text-xl font-bold">
          Payment Summary
        </h2>

        <div className="mt-4 flex flex-wrap justify-between gap-x-3">
          <span>Subtotal</span>
          <span>
            Rs. {Number(order.subtotal).toFixed(2)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-x-3">
          <span>Delivery Fee</span>
          <span>
            Rs. {Number(order.deliveryFee).toFixed(2)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-x-3 border-t border-gray-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-teal-700">
            Rs. {Number(order.totalAmount).toFixed(2)}
          </span>
        </div>

        {/* Payment Status */}
        {order.status === "PAID" && (
          <p className="alert-success mt-5">
            Payment confirmed.
          </p>
        )}

        {order.status === "PENDING_PAYMENT" && (
          <div className="mt-8">
            <p className="text-amber-700">
              Payment is still pending.
            </p>

            {paymentError && (
              <p role="alert" className="alert-error mt-4">
                {paymentError}
              </p>
            )}

            {!payment ? (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={preparingPayment}
                className="button button-primary mt-5 w-full"
              >
                {preparingPayment
                  ? "Preparing Payment..."
                  : "Pay Now"}
              </button>
            ) : (
              <form
                action={payment.checkoutUrl}
                method="POST"
                className="mt-5"
              >
                <input type="hidden" name="merchant_id" value={payment.merchantId} />
                <input type="hidden" name="return_url" value={payment.returnUrl} />
                <input type="hidden" name="cancel_url" value={payment.cancelUrl} />
                <input type="hidden" name="notify_url" value={payment.notifyUrl} />

                <input type="hidden" name="order_id" value={payment.orderId} />
                <input type="hidden" name="items" value={payment.items} />
                <input type="hidden" name="currency" value={payment.currency} />
                <input type="hidden" name="amount" value={payment.amount} />
                <input type="hidden" name="hash" value={payment.hash} />

                <input type="hidden" name="first_name" value={payment.firstName} />
                <input type="hidden" name="last_name" value={payment.lastName} />
                <input type="hidden" name="email" value={payment.email} />
                <input type="hidden" name="phone" value={payment.phone} />
                <input type="hidden" name="address" value={payment.address} />
                <input type="hidden" name="city" value={payment.city} />
                <input type="hidden" name="country" value={payment.country} />

                <button
                  type="submit"
                  className="button button-primary w-full"
                >
                  Continue to PayHere
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
