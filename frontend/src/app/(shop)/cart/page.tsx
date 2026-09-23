import { Container } from "@/components/layout/container";

export default function CartPage() {
  return (
    <Container className="space-y-3 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Cart</h1>
      <p className="text-zinc-600">
        Guest cart: <code>useCartStore</code>. Authenticated cart: <code>useCart()</code>.
      </p>
    </Container>
  );
}
