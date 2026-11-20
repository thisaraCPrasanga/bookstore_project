
import { Link, useLocation } from "react-router";

export default function PaymentResult() {
  const location = useLocation();

  const isCancelled = location.pathname === "/payment/cancel";

  return (
    <section className="page-shell flex max-w-6xl justify-center">
      <div className="surface w-full max-w-lg p-5 text-center sm:p-8">

        {isCancelled ? (
          <>
            <h1 className="page-title text-red-700">
              Payment Cancelled
            </h1>

            <p className="mt-5 text-gray-600">
              You returned from PayHere without completing
              the payment process.
            </p>

            <p className="mt-4 text-gray-600">
              Your order may still be pending payment.
              You can check your order status before
              trying again.
            </p>
          </>
        ) : (
          <>
            <h1 className="page-title text-teal-800">
              Payment Status
            </h1>

            <p className="mt-5 text-gray-600">
              You have returned from PayHere.
            </p>

            <p className="mt-4 text-gray-600">
              Your payment status must be confirmed
              by our server.
            </p>

            <p className="alert-warning mt-4">
              Returning from PayHere does not
              automatically mean your payment succeeded.
            </p>
          </>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6">
          <Link
            to="/books"
            className="button button-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
