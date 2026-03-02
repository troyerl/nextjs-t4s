"use client";

import { useEffect } from "react";

interface CodeScannerProps {
  onScan: (text: string) => void;
  onError: (message: string) => void;
}

interface Html5QrcodeCamera {
  id: string;
}

interface Html5QrcodeLike {
  start: (
    cameraId: string,
    config: { fps: number; aspectRatio: number },
    onSuccess: (decodedText: string) => void,
    onError?: (message: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
}

interface Html5QrcodeStatic {
  new (elementId: string): Html5QrcodeLike;
  getCameras: () => Promise<Html5QrcodeCamera[]>;
}

export default function CodeScanner({ onScan, onError }: CodeScannerProps) {
  useEffect(() => {
    let unmounted = false;
    let html5QrCode: Html5QrcodeLike | null = null;
    let lastValue = "";
    let lastScanAt = 0;

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        onError("Camera access is not supported by your browser.");
        return;
      }

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const html5Module = await import("html5-qrcode");
        const Html5Qrcode = html5Module.Html5Qrcode as unknown as Html5QrcodeStatic;
        if (unmounted) {
          return;
        }

        html5QrCode = new Html5Qrcode("qr-reader");
        const devices = await Html5Qrcode.getCameras();
        if (!devices.length) {
          throw new Error("No cameras found");
        }

        const cameraId = devices[devices.length - 1].id;
        await html5QrCode.start(
          cameraId,
          {
            fps: 20,
            aspectRatio: 1.777778,
          },
          (decodedText: string) => {
            const value = decodedText.trim();
            const now = Date.now();
            if (value && (value !== lastValue || now - lastScanAt > 3000)) {
              lastValue = value;
              lastScanAt = now;
              onScan(value);
            }
          },
          () => {
            // Ignore frame-level decode errors; keep scanning.
          },
        );
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          onError("Camera permission was denied. Please allow camera access and reload the page.");
          return;
        }
        if (error instanceof Error && error.message === "No cameras found") {
          onError("No cameras were found on your device.");
          return;
        }
        onError("Failed to initialize scanner. Please ensure camera permissions are granted.");
      }
    }

    void startScanner();

    return () => {
      unmounted = true;
      if (html5QrCode) {
        void html5QrCode.stop().catch(() => {});
      }
    };
  }, [onError, onScan]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div id="qr-reader" className="h-[320px] w-full bg-black" />
    </div>
  );
}
