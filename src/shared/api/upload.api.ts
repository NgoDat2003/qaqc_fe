import type { ApiResponse, UploadedImage } from "@/shared/types";

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/images", {
      method: "POST",
      body: formData,
      credentials: "include",
      // NO Content-Type header — browser sets multipart/form-data + boundary automatically
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg =
        (json?.error?.message as string) ||
        (json?.message as string) ||
        "Upload thất bại";
      throw new Error(msg);
    }

    const json = (await res.json()) as ApiResponse<UploadedImage>;
    return json.data;
  },
};
