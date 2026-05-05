import type { ApiResponse } from "@/shared/types";

const BE_URL = (process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3000") + "/api";

export const uploadApi = {
  uploadEvidence: async (file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BE_URL}/upload/evidence`, {
      method: "POST",
      body: formData,
      credentials: "include",
      // NO Content-Type header — browser sets multipart/form-data + boundary automatically
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const json = (await res.json()) as ApiResponse<{ id: string; url: string }>;
    return json.data;
  },
};
