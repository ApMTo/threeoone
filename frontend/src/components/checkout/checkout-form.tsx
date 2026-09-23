"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { useForm } from "react-hook-form";

import { SaveAddressDialog } from "@/components/checkout/save-address-dialog";
import { siteConfig } from "@/config/site";
import { CHECKOUT_SHIPPING_COST, US_STATES } from "@/constants/checkout";
import { routes } from "@/constants/routes";
import { useAddresses, useCreateAddress } from "@/features/account";
import { useCurrentUser } from "@/features/auth";
import { ArrowLeftIcon, SearchIcon } from "@/icons";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";
import {
  checkoutFormSchema,
  toShippingAddressPayload,
  type CheckoutFormInput,
} from "@/schemas/checkout.schema";
import type { UserAddress } from "@/services/users.service";
import { useCartStore } from "@/store/cart.store";
import { useUiStore } from "@/store/ui.store";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0] ?? "", lastName: "" };
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function formatAddressOption(address: UserAddress): string {
  const parts = [address.line1, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");
  return `${address.fullName} · ${parts}`;
}

function addressToFormValues(
  address: UserAddress,
  email: string,
): CheckoutFormInput {
  const names = splitFullName(address.fullName);
  return {
    email,
    emailNews: true,
    country: address.country || "United States",
    firstName: names.firstName,
    lastName: names.lastName,
    company: address.company ?? "",
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state ?? "",
    postalCode: address.postalCode,
    phone: address.phone,
    textNews: false,
    discountCode: "",
  };
}

function FloatingInput({
  label,
  error,
  className,
  id,
  endAdornment,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasValue = Boolean(props.value != null && String(props.value).length > 0);

  return (
    <div className="relative">
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          "peer w-full rounded-lg border bg-white px-3.5 pt-5 pb-2 text-[15px] text-zinc-950 outline-none transition",
          "placeholder:text-transparent focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-zinc-300",
          endAdornment != null ? "pr-11" : undefined,
          className,
        )}
        {...props}
        placeholder=" "
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-3.5 origin-left text-zinc-500 transition-all",
          "top-1/2 -translate-y-1/2 text-[15px]",
          "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-zinc-500",
          "peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[11px]",
          hasValue ? "top-2 translate-y-0 text-[11px]" : undefined,
        )}
      >
        {label}
      </label>
      {endAdornment ? (
        <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-400">
          {endAdornment}
        </span>
      ) : null}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function FloatingSelect({
  label,
  error,
  className,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hasValue = Boolean(props.value != null && String(props.value).length > 0);

  return (
    <div className="relative">
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          "peer w-full appearance-none rounded-lg border bg-white px-3.5 pt-5 pb-2 text-[15px] text-zinc-950 outline-none transition",
          "focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-zinc-300",
          !hasValue && "text-transparent",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={selectId}
        className={cn(
          "pointer-events-none absolute left-3.5 origin-left text-zinc-500 transition-all",
          hasValue
            ? "top-2 translate-y-0 text-[11px]"
            : "top-1/2 -translate-y-1/2 text-[15px]",
          "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px]",
        )}
      >
        {label}
      </label>
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-500">
        ▾
      </span>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="mt-3 flex cursor-pointer items-start gap-2.5">
      <span className="relative mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span className="pointer-events-none size-4 rounded border border-zinc-400 bg-white peer-checked:border-zinc-950 peer-checked:bg-zinc-950" />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute size-2.5 text-white opacity-0 peer-checked:opacity-100"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M4.7 9.2 1.8 6.3l1-1 1.9 1.9 4.5-4.5 1 1z"
          />
        </svg>
      </span>
      <span className="text-[14px] text-zinc-700">{label}</span>
    </label>
  );
}

const emptyFormValues = (email = ""): CheckoutFormInput => ({
  email,
  emailNews: true,
  country: "United States",
  firstName: "",
  lastName: "",
  company: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  textNews: false,
  discountCode: "",
});

export function CheckoutForm() {
  const router = useRouter();
  const openBag = useUiStore((state) => state.openBag);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const { data: user } = useCurrentUser();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const createAddress = useCreateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [hydrated, setHydrated] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<CheckoutFormInput | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [discountDraft, setDiscountDraft] = useState("");

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: emptyFormValues(),
  });

  const values = watch();

  useEffect(() => {
    if (addressesLoading || hydrated) return;

    const email = user?.email ?? "";

    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      reset(addressToFormValues(defaultAddress, email));
    } else if (user) {
      const names = splitFullName(user.fullName);
      reset({
        ...emptyFormValues(email),
        firstName: names.firstName,
        lastName: names.lastName,
      });
      setSelectedAddressId("new");
    } else {
      reset(emptyFormValues());
    }

    setHydrated(true);
  }, [addressesLoading, defaultAddress, hydrated, reset, user]);

  useEffect(() => {
    if (!hydrated || !user?.email) return;
    if (!values.email) {
      setValue("email", user.email);
    }
  }, [hydrated, setValue, user?.email, values.email]);

  const applyAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    const email = user?.email ?? values.email ?? "";

    if (addressId === "new") {
      const names = user ? splitFullName(user.fullName) : { firstName: "", lastName: "" };
      reset({
        ...emptyFormValues(email),
        firstName: names.firstName,
        lastName: names.lastName,
      });
      return;
    }

    const address = addresses.find((entry) => entry.id === addressId);
    if (address) {
      reset(addressToFormValues(address, email));
    }
  };

  const currency = items[0]?.unitPrice.currency ?? "USD";
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice.amount * item.quantity,
    0,
  );
  const shipping = items.length > 0 ? CHECKOUT_SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const finishCheckout = () => {
    clearCart();
    setSavePromptOpen(false);
    setPendingValues(null);
    router.push(`${routes.orders}?placed=1`);
  };

  const onContinue = handleSubmit((formValues) => {
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Your bag is empty.");
      return;
    }

    if (addresses.length === 0) {
      setPendingValues(formValues);
      setSavePromptOpen(true);
      return;
    }

    finishCheckout();
  });

  const handleSaveAddress = async () => {
    if (!pendingValues) return;

    try {
      await createAddress.mutateAsync({
        ...toShippingAddressPayload(pendingValues),
        isDefault: true,
      });
      finishCheckout();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setSavePromptOpen(false);
    }
  };

  const emailRegister = register("email");
  const firstNameRegister = register("firstName");
  const lastNameRegister = register("lastName");
  const companyRegister = register("company");
  const line1Register = register("line1");
  const line2Register = register("line2");
  const cityRegister = register("city");
  const stateRegister = register("state");
  const postalCodeRegister = register("postalCode");
  const phoneRegister = register("phone");
  const countryRegister = register("country");

  if (items.length === 0 && !savePromptOpen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-950">Your bag is empty</h1>
        <p className="mt-2 text-zinc-600">Add something before checking out.</p>
        <Link
          href={routes.products}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 text-[15px] font-medium text-white transition hover:bg-brand/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:pl-[max(3rem,calc((100vw-1100px)/2))]">
          <Link
            href={routes.home}
            className="inline-block font-fraunces text-2xl font-semibold tracking-tight text-zinc-950"
          >
            {siteConfig.name}
          </Link>

          <form onSubmit={onContinue} className="mt-10 max-w-xl space-y-8" noValidate>
            <div>
              <h2 className="text-[17px] font-semibold text-zinc-950">Contact</h2>
              <div className="mt-3">
                <FloatingInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...emailRegister}
                  value={values.email}
                />
              </div>
              <CheckboxField
                id="emailNews"
                checked={values.emailNews}
                onChange={(value) => setValue("emailNews", value)}
                label="Email me with news and offers"
              />
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-zinc-950">
                Shipping address
              </h2>

              {addresses.length > 0 ? (
                <div className="mt-3">
                  <FloatingSelect
                    label="Saved address"
                    value={selectedAddressId}
                    onChange={(event) => applyAddressSelection(event.target.value)}
                  >
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {formatAddressOption(address)}
                      </option>
                    ))}
                    <option value="new">Use a new address</option>
                  </FloatingSelect>
                </div>
              ) : null}

              <div className={cn("space-y-3", addresses.length > 0 ? "mt-3" : "mt-3")}>
                <FloatingSelect
                  label="Country/Region"
                  error={errors.country?.message}
                  {...countryRegister}
                  value={values.country}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </FloatingSelect>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FloatingInput
                    label="First Name"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...firstNameRegister}
                    value={values.firstName}
                  />
                  <FloatingInput
                    label="Last Name"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...lastNameRegister}
                    value={values.lastName}
                  />
                </div>

                <FloatingInput
                  label="Company (optional)"
                  autoComplete="organization"
                  {...companyRegister}
                  value={values.company ?? ""}
                />

                <FloatingInput
                  label="Address"
                  autoComplete="street-address"
                  error={errors.line1?.message}
                  endAdornment={<SearchIcon />}
                  {...line1Register}
                  value={values.line1}
                />

                <FloatingInput
                  label="Apartment, suite, etc. (optional)"
                  {...line2Register}
                  value={values.line2 ?? ""}
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <FloatingInput
                    label="City"
                    autoComplete="address-level2"
                    error={errors.city?.message}
                    {...cityRegister}
                    value={values.city}
                  />
                  <FloatingSelect
                    label="State"
                    error={errors.state?.message}
                    {...stateRegister}
                    value={values.state ?? ""}
                  >
                    <option value="" />
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </FloatingSelect>
                  <FloatingInput
                    label="ZIP code"
                    autoComplete="postal-code"
                    error={errors.postalCode?.message}
                    {...postalCodeRegister}
                    value={values.postalCode}
                  />
                </div>

                <FloatingInput
                  label="Phone"
                  autoComplete="tel"
                  type="tel"
                  error={errors.phone?.message}
                  {...phoneRegister}
                  value={values.phone}
                />

                <CheckboxField
                  id="textNews"
                  checked={values.textNews}
                  onChange={(value) => setValue("textNews", value)}
                  label="Text me with news and offers"
                />
              </div>
            </div>

            {submitError ? (
              <p className="text-sm text-red-600">{submitError}</p>
            ) : null}

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => openBag()}
                className="inline-flex items-center gap-2 text-[14px] text-brand transition hover:opacity-80"
              >
                <ArrowLeftIcon className="h-3 w-2" />
                Return to cart
              </button>

              <button
                type="submit"
                disabled={isSubmitting || createAddress.isPending}
                className="inline-flex h-14 min-w-40 items-center justify-center rounded-xl bg-brand px-8 text-[15px] font-medium text-white transition hover:bg-brand/90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </form>
        </section>

        <aside className="border-t border-zinc-200 bg-[#f5f5f5] px-4 py-8 sm:px-8 lg:border-t-0 lg:border-l lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:sticky lg:top-10">
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.lineId} className="flex items-start gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-zinc-200" />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-medium text-white tabular-nums">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold tracking-wide text-zinc-950 uppercase">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-[13px] text-zinc-500">
                          Size: {item.sizeLabel}
                        </p>
                      </div>
                      <p className="shrink-0 text-[14px] font-medium text-zinc-950 tabular-nums">
                        {formatMoney({
                          amount: item.unitPrice.amount * item.quantity,
                          currency: item.unitPrice.currency,
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <FloatingInput
                label="Discount code or gift card"
                value={discountDraft}
                onChange={(event) => setDiscountDraft(event.target.value)}
                className="pr-20"
                endAdornment={
                  <button
                    type="button"
                    disabled={!discountDraft.trim()}
                    className="rounded-md bg-zinc-300 px-2.5 py-1 text-[12px] font-medium text-white enabled:bg-zinc-700"
                  >
                    Apply
                  </button>
                }
              />
            </div>

            <dl className="mt-6 space-y-3 border-t border-zinc-300/70 pt-5 text-[14px]">
              <div className="flex items-center justify-between text-zinc-700">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-zinc-950">
                  {formatMoney({ amount: subtotal, currency })}
                </dd>
              </div>
              <div className="flex items-center justify-between text-zinc-700">
                <dt className="inline-flex items-center gap-1.5">
                  Shipping
                  <span
                    title="Flat rate shipping"
                    className="inline-flex size-4 items-center justify-center rounded-full border border-zinc-400 text-[10px] text-zinc-500"
                  >
                    i
                  </span>
                </dt>
                <dd className="tabular-nums text-zinc-950">
                  {formatMoney({ amount: shipping, currency })}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-zinc-300/70 pt-4">
                <dt className="text-[15px] font-medium text-zinc-950">Total</dt>
                <dd className="text-right">
                  <span className="mr-1.5 text-xs text-zinc-500">{currency}</span>
                  <span className="text-xl font-semibold tabular-nums text-zinc-950">
                    {formatMoney({ amount: total, currency })}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <SaveAddressDialog
        open={savePromptOpen}
        isSaving={createAddress.isPending}
        onSave={handleSaveAddress}
        onSkip={finishCheckout}
      />
    </>
  );
}
