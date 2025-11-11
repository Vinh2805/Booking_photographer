import apiClient from "./apiClient";

/**
 * ==========================================
 * TYPES CHO API PHOTO
 * ==========================================
 */

export interface PhotoUploadRequest {
  file: File;
  description?: string;
}

export interface PhotoUploadResponse {
  status: "success";
  message: string;
  data: {
    ma_bc: string;
    loai: "raw" | "edited";
    file_path: string;
    file_name: string;
  };
}

export interface PhotoDownloadResponse {
  download_url: string;
  file_name: string;
  expires_at?: string;
}

/**
 * ==========================================
 * API UPLOAD ẢNH (Nhiếp ảnh gia)
 * POST /photos/{type}/{ma_bc}/upload
 * ==========================================
 */
export async function uploadPhoto(
  type: "raw" | "edited",
  ma_bc: string,
  data: PhotoUploadRequest
): Promise<PhotoUploadResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.description) {
    formData.append("description", data.description);
  }

  const response = await apiClient.post<PhotoUploadResponse>(
    `/photos/${type}/${ma_bc}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * ==========================================
 * API DOWNLOAD ẢNH
 * GET /photos/{type}/{ma_bc}/download
 * ==========================================
 */
export async function downloadPhoto(
  type: "raw" | "edited",
  ma_bc: string
): Promise<void> {
  try {
    const response = await apiClient.get(
      `/photos/${type}/${ma_bc}/download`,
      {
        responseType: "blob",
      }
    );

    // Tạo URL từ blob và trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_${ma_bc}_${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Lỗi khi tải ảnh:", error);
    throw error;
  }
}

/**
 * ==========================================
 * EXPORT MẶC ĐỊNH
 * ==========================================
 */
export default {
  uploadPhoto,
  downloadPhoto,
};

