
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
    return <p className="page-shell max-w-5xl text-sm text-gray-600">Loading cart...</p>;
  }

  if (loginRequired) {
    return (
      <section className="page-shell max-w-4xl">
        <h1 className="page-title">Shopping Cart</h1>

        <p className="mt-6">
          Please login to view your cart.
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

  return (
    <section className="page-shell max-w-4xl">
      <h1 className="page-title">
        Shopping Cart
      </h1>

      {error && (
        <p
          role="alert"
          className="alert-error mt-5"
        >
          {error}
        </p>
      )}

      {!cart ? (
        <p className="mt-6">Cart is unavailable.</p>
      ) : cart.items.length === 0 ? (
        <div className="surface mt-5 p-6 text-center sm:p-8">
          <p className="text-gray-600">
            Your cart is empty.
          </p>

          <Link
            to="/books"
            className="button button-primary mt-5"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mt-5 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.bookId}
                className="surface min-w-0 p-4 wrap-anywhere sm:p-6"
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
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={updating || item.quantity <= 1}
                    onClick={() =>
                      changeQuantity(
                        item.bookId,
                        item.quantity - 1
                      )
                    }
                    className="button button-secondary max-sm:min-w-11"
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
                    className="button button-secondary max-sm:min-w-11"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => removeItem(item.bookId)}
                    className="button button-danger ml-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="surface mt-5 p-4 sm:p-6">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-4 flex flex-wrap justify-between gap-x-3">
              <span>Total Items</span>
              <span>{cart.totalQuantity}</span>
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-x-3 border-t border-gray-200 pt-4 text-lg font-bold">
              <span>Subtotal</span>
              <span>
                Rs. {Number(cart.subtotal).toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            {canCheckout && !updating ? (
              <Link
                to="/checkout"
                className="button button-primary mt-6 w-full"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="button button-secondary mt-6 w-full"
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
              className="button button-danger mt-4"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </section>
  );
}
