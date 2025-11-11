/**
 * Utility functions for profile validation and formatting
 */

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Vietnamese phone number (10 digits)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Normalize name: remove extra spaces, block special characters
export function normalizeName(name: string): string {
  // Remove special characters except Vietnamese characters and spaces
  let normalized = name.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
}

// Validate name (no special characters except Vietnamese)
export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

// Format phone number with spaces
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6)
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
}

// Format currency (VND) with thousand separators
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  return parseInt(value.replace(/[^\d]/g, "")) || 0;
}

// Format date to dd/mm/yyyy
export function formatDate(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    // Handle YYYY-MM-DD format to avoid timezone issues
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2], 10);
      d = new Date(year, month, day);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Parse dd/mm/yyyy to Date
export function parseDate(dateString: string): Date | null {
  const parts = dateString.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  return date;
}

// Validate image file
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(
  file: File,
  options: {
    maxSizeMB?: number;
    minWidth?: number;
    minHeight?: number;
    allowedTypes?: string[];
  } = {}
): Promise<ImageValidationResult> {
  const {
    maxSizeMB = 5,
    minWidth = 400,
    minHeight = 400,
    allowedTypes = ["image/jpeg", "image/jpg", "image/png"],
  } = options;

  return new Promise((resolve) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      resolve({
        valid: false,
        error: `Định dạng không hợp lệ. Chỉ chấp nhận: ${allowedTypes
          .map((t) => t.split("/")[1].toUpperCase())
          .join(", ")}`,
      });
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      resolve({
        valid: false,
        error: `Kích thước file quá lớn. Tối đa ${maxSizeMB}MB`,
      });
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Kích thước ảnh quá nhỏ. Tối thiểu ${minWidth}×${minHeight}px`,
        });
        return;
      }
      resolve({ valid: true });
    };
    img.onerror = () => {
      resolve({
        valid: false,
        error: "File không phải là ảnh hợp lệ",
      });
    };
    img.src = URL.createObjectURL(file);
  });
}

// Create circular cropped image
export function createCircularImage(
  file: File,
  size: number = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot create canvas context"));
        return;
      }

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
      ctx.clip();

      // Calculate scaling to fill circle
      const scale = Math.max(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/png",
        0.95
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Create 16:9 cropped image for cover
export function createCoverImage(
  file: File,
  width: number = 1200,
  height: number = 675
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot create canvas context"));
        return;
      }

      // Calculate scaling to fill 16:9 aspect ratio
      const targetAspect = width / height;
      const imgAspect = img.width / img.height;

      let sourceWidth, sourceHeight, sourceX, sourceY;

      if (imgAspect > targetAspect) {
        // Image is wider, crop width
        sourceHeight = img.height;
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image is taller, crop height
        sourceWidth = img.width;
        sourceHeight = img.width / targetAspect;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Get device info for audit log
export function getDeviceInfo(): {
  device: string;
  userAgent: string;
} {
  return {
    device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      ? "Mobile"
      : "Desktop",
    userAgent: navigator.userAgent,
  };
}

// Get client IP (mock for now, should be from API)
export function getClientIP(): Promise<string> {
  return Promise.resolve("unknown");
}

