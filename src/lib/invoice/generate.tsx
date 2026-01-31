import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "./template";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/storage/r2";

interface GenerateInvoicePDFParams {
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
}

/**
 * Generates an invoice PDF and uploads it to R2 storage.
 * Returns the public URL of the stored PDF.
 * 
 * @throws Error if PDF generation or upload fails
 */
export async function generateInvoicePDF(params: GenerateInvoicePDFParams): Promise<string> {
  try {
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF
        {...params}
        issuedAt={new Date()}
      />
    );

    // Upload to R2
    const key = `invoices/${params.invoiceNumber}.pdf`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ContentDisposition: `attachment; filename="${params.invoiceNumber}.pdf"`,
      })
    );

    // Return public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    throw new Error("Failed to generate invoice PDF");
  }
}

/**
 * Generates a unique invoice number based on year and booking ID.
 * Format: INV-YYYY-XXXXXX (e.g., INV-2026-A3B5C7)
 */
export function generateInvoiceNumber(bookingId: string): string {
  const year = new Date().getFullYear();
  const shortId = bookingId.slice(0, 6).toUpperCase();
  return `INV-${year}-${shortId}`;
}
