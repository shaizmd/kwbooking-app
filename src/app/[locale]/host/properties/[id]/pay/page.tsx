import { createPaymentIntent } from "./actions";

export default async function PayPage({
  params,
}: {
  params: { id: string };
}) {
  const { clientSecret } =
    await createPaymentIntent(params.id);

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
