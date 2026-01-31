import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #d32f2f",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    color: "#666",
  },
  value: {
    width: "60%",
    color: "#222",
    fontWeight: "bold",
  },
  divider: {
    borderBottom: "1 solid #e0e0e0",
    marginVertical: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    color: "#666",
  },
  priceValue: {
    color: "#222",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #222",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1 solid #e0e0e0",
    textAlign: "center",
    color: "#666",
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoiceNumber: string;
  bookingId: string;
  propertyTitle: string;
  customerEmail: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  subtotal: number;
  extraCharges: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  issuedAt: Date;
}

export function InvoicePDF({
  invoiceNumber,
  bookingId,
  propertyTitle,
  customerEmail,
  checkIn,
  checkOut,
  guests,
  subtotal,
  extraCharges,
  taxAmount,
  totalAmount,
  currency,
  issuedAt,
}: InvoicePDFProps) {
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          <Text>Issued: {issuedAt.toLocaleDateString()}</Text>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>{bookingId.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{propertyTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer Email:</Text>
            <Text style={styles.value}>{customerEmail}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Stay Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Check-in:</Text>
            <Text style={styles.value}>{checkIn.toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Check-out:</Text>
            <Text style={styles.value}>{checkOut.toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nights:</Text>
            <Text style={styles.value}>{nights}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Guests:</Text>
            <Text style={styles.value}>{guests}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Accommodation ({nights} nights)</Text>
            <Text style={styles.priceValue}>
              {subtotal.toFixed(3)} {currency}
            </Text>
          </View>

          {extraCharges > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Extra Guest Charges</Text>
              <Text style={styles.priceValue}>
                {extraCharges.toFixed(3)} {currency}
              </Text>
            </View>
          )}

          {taxAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>
                {taxAmount.toFixed(3)} {currency}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Paid</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toFixed(3)} {currency}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your booking!</Text>
          <Text style={{ marginTop: 5 }}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
