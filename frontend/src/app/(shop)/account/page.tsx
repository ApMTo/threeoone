import { AccountProfile } from "@/components/account/account-profile";
import { Container } from "@/components/layout/container";

export default function AccountPage() {
  return (
    <Container className="space-y-8 py-10">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
          Account
        </h1>
        <p className="mt-2 text-[15px] text-zinc-600">
          Manage your profile and sign out of your account.
        </p>
      </div>

      <AccountProfile />
    </Container>
  );
}
