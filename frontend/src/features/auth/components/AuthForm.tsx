import type { ComponentProps, FormEventHandler, ReactNode } from "react";

interface AuthFormProps {
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  submitLabel: string;
  pendingLabel: string;
  error: string;
  notice?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthForm({
  title,
  description,
  onSubmit,
  isSubmitting,
  submitLabel,
  pendingLabel,
  error,
  notice,
  children,
  footer,
}: AuthFormProps) {
  return (
    <section className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

        {notice && (
          <p role="status" className="mt-5 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            {notice}
          </p>
        )}

        <form className="mt-6" onSubmit={onSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            {children}

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60"
            >
              {isSubmitting ? pendingLabel : submitLabel}
            </button>
          </fieldset>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
      </div>
    </section>
  );
}

type AuthFieldProps = ComponentProps<"input"> & {
  name: string;
  label: string;
  hint?: string;
};

export function AuthField({ name, label, hint, ...inputProps }: AuthFieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        {...inputProps}
        id={name}
        name={name}
        required
        aria-describedby={hintId}
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-700 focus:outline-2 focus:outline-teal-700 disabled:bg-gray-50"
      />
      {hint && <p id={hintId} className="mt-1 text-sm text-gray-600">{hint}</p>}
    </div>
  );
}
