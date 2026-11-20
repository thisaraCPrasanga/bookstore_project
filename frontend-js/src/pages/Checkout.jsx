
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  const [order, setOrder] = useState(null);

  // PayHere states
  const [payment, setPayment] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
  });

  // Load cart
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        const response = await api.get("/cart");

        if (!cancelled) {
          setCart(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.response?.status === 401) {
            setLoginRequired(true);
          } else {
            setError("Failed to load cart.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update form values
  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  // Step 1: Create order
  async function handlePlaceOrder(event) {
    event.preventDefault();

    if (submitting || order || !cart?.items?.length) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.get("/auth/csrf");

      const response = await api.post("/orders", {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country,
      });

      setOrder(response.data);
    } catch (error) {
      console.error("Place order failed:", error);

      if (error.response?.status === 401) {
        setLoginRequired(true);
      }

      setError(
        error.response?.data?.detail ||
        "Failed to place order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Prepare PayHere payment
  async function handlePreparePayment() {
    if (!order || preparingPayment || payment) {
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
      console.error("Payment initialization failed:", error);

      setPaymentError(
        error.response?.data?.detail ||
        "Failed to prepare payment."
      );
    } finally {
      setPreparingPayment(false);
    }
  }

  if (loading) {
    return <p className="page-shell max-w-5xl text-sm text-gray-600">Loading checkout...</p>;
  }

  if (loginRequired) {
    return (
      <section className="page-shell max-w-3xl">
        <h1 className="page-title">Checkout</h1>

        <p className="mt-6">
          Please login to continue checkout.
        </p>

        <Link
          to="/login"
          className="button button-primary mt-5"
        >
          Login
        </Link>
      </section>
    );
  }

  // Order created: show payment section
  if (order) {
    return (
      <section className="page-shell max-w-3xl">
        <div className="surface p-5 sm:p-8">

          <h1 className="page-title text-teal-800">
            Order Created!
          </h1>

          <p className="mt-4 text-gray-600">
            Your order was created successfully.
            Please complete the payment.
          </p>

          <div className="mt-5 space-y-4">
            <p>
              <strong>Order Number:</strong>{" "}
              {order.orderNumber}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {order.status.replaceAll("_", " ")}
            </p>

            <p>
              <strong>Subtotal:</strong>{" "}
              Rs. {Number(order.subtotal).toFixed(2)}
            </p>

            <p>
              <strong>Delivery Fee:</strong>{" "}
              Rs. {Number(order.deliveryFee).toFixed(2)}
            </p>

            <p className="text-xl font-bold text-teal-700">
              Total: Rs. {Number(order.totalAmount).toFixed(2)}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold">
              Complete Payment
            </h2>

            <p className="mt-3 text-gray-600">
              Pay securely through PayHere.
            </p>

            {paymentError && (
              <p role="alert" className="alert-error mt-4">
                {paymentError}
              </p>
            )}

            {!payment ? (
              <button
                type="button"
                onClick={handlePreparePayment}
                disabled={preparingPayment}
                className="button button-primary mt-6 w-full"
              >
                {preparingPayment
                  ? "Preparing Payment..."
                  : "Pay with PayHere"}
              </button>
            ) : (
              <form
                action={payment.checkoutUrl}
                method="POST"
                className="mt-6"
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

            <p className="mt-4 text-sm text-gray-500">
              Your order remains unpaid until the payment
              is confirmed by the server.
            </p>
          </div>

          <Link
            to="/books"
            className="mt-8 inline-block text-teal-700 hover:underline"
          >
            Back to Books
          </Link>
        </div>
      </section>
    );
  }

  // Checkout form
  return (
    <section className="page-shell max-w-4xl">
      <h1 className="page-title">
        Checkout
      </h1>

      {error && (
        <p role="alert" className="alert-error mt-5">
          {error}
        </p>
      )}

      {!cart ? (
        <p className="mt-6">Checkout is unavailable.</p>
      ) : cart.items.length === 0 ? (
        <div className="surface mt-5 p-5 sm:p-6">
          <p>Your cart is empty.</p>

          <Link
            to="/books"
            className="mt-4 inline-block text-teal-700 hover:underline"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid items-start gap-4 max-md:grid-cols-1 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-5">

          <form
            onSubmit={handlePlaceOrder}
            className="surface min-w-0 space-y-4 p-4 max-sm:space-y-3 sm:p-6"
          >
            <h2 className="text-xl font-bold">
              Billing / Delivery Details
            </h2>

            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                required
                maxLength={200}
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                pattern="[+]?[0-9]{9,15}"
                title="Enter 9 to 15 digits, optionally starting with +"
                value={form.phone}
                onChange={handleChange}
                placeholder="0771234567"
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="addressLine1" className="form-label">
                Address Line 1
              </label>

              <input
                id="addressLine1"
                name="addressLine1"
                required
                maxLength={255}
                autoComplete="address-line1"
                value={form.addressLine1}
                onChange={handleChange}
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="addressLine2" className="form-label">
                Address Line 2 (Optional)
              </label>

              <input
                id="addressLine2"
                name="addressLine2"
                maxLength={255}
                autoComplete="address-line2"
                value={form.addressLine2}
                onChange={handleChange}
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="city" className="form-label">
                City
              </label>

              <input
                id="city"
                name="city"
                required
                maxLength={100}
                autoComplete="address-level2"
                value={form.city}
                onChange={handleChange}
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="form-label">
                Postal Code (Optional)
              </label>

              <input
                id="postalCode"
                name="postalCode"
                maxLength={20}
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={handleChange}
                className="form-field w-full"
              />
            </div>

            <div>
              <label htmlFor="country" className="form-label">
                Country
              </label>

              <input
                id="country"
                name="country"
                value={form.country}
                readOnly
                className="form-field w-full"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button button-primary w-full"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Cart Summary */}
          <div className="surface p-4 sm:p-6">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <p className="mt-5">
              Total Items: {cart.totalQuantity}
            </p>

            <p className="mt-4 font-semibold">
              Subtotal: Rs. {Number(cart.subtotal).toFixed(2)}
            </p>

            <p className="mt-4 text-sm text-gray-600">
              The server calculates the final total
              including delivery fees.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
