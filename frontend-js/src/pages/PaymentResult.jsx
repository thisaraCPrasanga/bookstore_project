
import { Link, useLocation } from "react-router";

export default function PaymentResult() {
  const location = useLocation();

  const isCancelled = location.pathname === "/payment/cancel";

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">

        {isCancelled ? (
          <>
            <h1 className="text-3xl font-bold text-red-600">
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
            <h1 className="text-3xl font-bold text-teal-700">
              Payment Status
            </h1>

            <p className="mt-5 text-gray-600">
              You have returned from PayHere.
            </p>

            <p className="mt-4 text-gray-600">
              Your payment status must be confirmed
              by our server.
            </p>

            <p className="mt-4 font-medium text-amber-700">
              Returning from PayHere does not
              automatically mean your payment succeeded.
            </p>
          </>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6">
          <Link
            to="/books"
            className="inline-block rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
