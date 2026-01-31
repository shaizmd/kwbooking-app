"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPropertyImageUploadUrl, savePropertyImage } from "./actions";

export function ImageUploadForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setError("Please select a file");
      setUploading(false);
      return;
    }

    try {
      // Get presigned URL
      const { uploadUrl, fileUrl } = await getPropertyImageUploadUrl(propertyId);

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to storage");
      }

      // Save image reference in database
      await savePropertyImage(propertyId, fileUrl);

      // Reset form
      e.currentTarget.reset();
      setPreview(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* File Input */}
        <label className="flex-1">
          <div className="relative">
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[var(--red)] hover:file:bg-red-100 file:transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </label>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={uploading || !preview}
          className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading...</span>
            </span>
          ) : (
            "Upload"
          )}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-300">
            <div className="aspect-[4/3]">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
