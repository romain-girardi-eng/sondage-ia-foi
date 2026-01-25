import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

const defaultOptions: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: "#1e293b", // Slate-800
    light: "#ffffff",
  },
};

/**
 * Generate QR code as data URL (base64)
 */
export async function generateQRCodeDataURL(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const dataURL = await QRCode.toDataURL(url, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: {
        dark: mergedOptions.color?.dark || "#1e293b",
        light: mergedOptions.color?.light || "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return dataURL;
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: {
        dark: mergedOptions.color?.dark || "#1e293b",
        light: mergedOptions.color?.light || "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return svg;
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Get the survey URL for sharing
 */
export function getSurveyShareURL(language?: "fr" | "en"): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "https://ia-foi.fr";
  if (language) {
    return `${baseURL}/${language}`;
  }
  return baseURL;
}
