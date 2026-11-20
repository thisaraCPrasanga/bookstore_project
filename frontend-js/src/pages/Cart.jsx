
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  // Load Cart
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

  // Change Quantity
  async function changeQuantity(bookId, quantity) {
    if (updating || quantity < 1 || quantity > 99) {
      return;
    }

    setUpdating(true);
    setError("");

    try {
      await api.get("/auth/csrf");

      const response = await api.patch(
        `/cart/items/${bookId}`,
        { quantity }
      );

      setCart(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Failed to update quantity."
      );
    } finally {
      setUpdating(false);
    }
  }

  // Remove Book
  async function removeItem(bookId) {
    if (updating) return;

    setUpdating(true);
    setError("");

    try {
      await api.get("/auth/csrf");

      await api.delete(`/cart/items/${bookId}`);

      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to remove book.");
    } finally {
      setUpdating(false);
    }
  }

  // Clear Cart
  async function clearCart() {
    if (updating) return;

    setUpdating(true);
    setError("");

    try {
      await api.get("/auth/csrf");

      await api.delete("/cart");

      setCart({
        items: [],
        totalQuantity: 0,
        subtotal: 0,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to clear cart.");
    } finally {
      setUpdating(false);
    }
  }

  // Check whether all books are available
  const canCheckout =
    cart?.items?.length > 0 &&
    cart.items.every((item) => item.available);

  if (loading) {
    return <p className="p-8">Loading cart...</p>;
  }

  if (loginRequired) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <p className="mt-6">
          Please login to view your cart.
        </p>

        <Link
          to="/login"
          className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
        >
          Login
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        Shopping Cart
      </h1>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!cart ? (
        <p className="mt-6">Cart is unavailable.</p>
      ) : cart.items.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-8 text-center">
          <p className="text-gray-600">
            Your cart is empty.
          </p>

          <Link
            to="/books"
            className="mt-5 inline-block rounded-lg bg-teal-700 px-6 py-3 text-white"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mt-8 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.bookId}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <Link
                  to={`/books/${item.bookId}`}
                  className="text-lg font-bold text-gray-900 hover:text-teal-700"
                >
                  {item.title}
                </Link>

                <p className="mt-2 text-gray-600">
                  Unit Price: Rs.{" "}
                  {Number(item.unitPrice).toFixed(2)}
                </p>

                <p className="mt-2 text-gray-600">
                  Line Total: Rs.{" "}
                  {Number(item.lineTotal).toFixed(2)}
                </p>

                {!item.available && (
                  <p className="mt-2 text-red-600">
                    This book is currently unavailable.
                  </p>
                )}

                {/* Quantity Controls */}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    disabled={updating || item.quantity <= 1}
                    onClick={() =>
                      changeQuantity(
                        item.bookId,
                        item.quantity - 1
                      )
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    disabled={
                      updating ||
                      item.quantity >= 99 ||
                      (item.format === "EBOOK" &&
                        item.quantity >= 1)
                    }
                    onClick={() =>
                      changeQuantity(
                        item.bookId,
                        item.quantity + 1
                      )
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => removeItem(item.bookId)}
                    className="ml-auto text-red-600 hover:underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between">
              <span>Total Items</span>
              <span>{cart.totalQuantity}</span>
            </div>

            <div className="mt-4 flex justify-between text-xl font-bold">
              <span>Subtotal</span>
              <span>
                Rs. {Number(cart.subtotal).toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            {canCheckout && !updating ? (
              <Link
                to="/checkout"
                className="mt-6 block rounded-lg bg-teal-700 px-6 py-3 text-center font-semibold text-white hover:bg-teal-800"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 w-full rounded-lg bg-gray-400 px-6 py-3 font-semibold text-white"
              >
                Proceed to Checkout
              </button>
            )}

            {!canCheckout && (
              <p className="mt-3 text-sm text-red-600">
                Remove unavailable books before checkout.
              </p>
            )}

            <button
              type="button"
              disabled={updating}
              onClick={clearCart}
              className="mt-4 rounded-lg border border-red-300 px-5 py-3 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </section>
  );
}
