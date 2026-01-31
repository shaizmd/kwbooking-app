export function calculateBookingPrice({
  basePrice,
  nights,
  guests,
  baseGuests,
  extraGuestPrice = 0,
}: {
  basePrice: number;
  nights: number;
  guests: number;
  baseGuests: number;
  extraGuestPrice?: number;
}) {
  if (nights <= 0) {
    throw new Error("Invalid number of nights");
  }

  const baseTotal = basePrice * nights;

  const extraGuests = Math.max(0, guests - baseGuests);
  const extraTotal = extraGuests * extraGuestPrice * nights;

  return {
    subtotal: baseTotal,
    extraCharges: extraTotal,
    total: baseTotal + extraTotal,
  };
}
