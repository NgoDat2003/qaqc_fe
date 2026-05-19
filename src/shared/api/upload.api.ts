import type { ApiResponse, UploadedImage } from "@/shared/types";

const BE_URL = (process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3000") + "/api";

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BE_URL}/upload/images`, {
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
