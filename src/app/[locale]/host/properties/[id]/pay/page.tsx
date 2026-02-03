import { createPaymentIntent } from "./actions";
import { requireRole } from "@/lib/auth/require-role";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("HOST");
  const { id } = await params;
  
  const { clientSecret } = await createPaymentIntent(id);

  return (
    <div>
      <p>Client secret generated:</p>
      <code>{clientSecret}</code>
      <p>
        (Stripe Elements UI will be added later)
      </p>
    </div>
  );
}
