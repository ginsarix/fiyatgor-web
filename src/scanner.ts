type ScanCallback = (barcode: string) => void;

let activeControls: { stop: () => void } | null = null;

export async function openScanner(onScan: ScanCallback) {
  if (activeControls) {
    activeControls.stop();
    activeControls = null;
  }

  const video = document.getElementById("scanner-video") as HTMLVideoElement;
  const active = document.getElementById("scanner-active") as HTMLElement;
  const start = document.getElementById("scanner-start") as HTMLElement;

  active.classList.remove("hidden");
  start.classList.add("hidden");

  try {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const codeReader = new BrowserMultiFormatReader();

    activeControls = await codeReader.decodeFromVideoDevice(
      undefined,
      video,
      (result) => {
        if (result) {
          onScan(result.getText());
        }
      },
    );
  } catch (err) {
    console.error("Camera scanner error:", err);
    active.classList.add("hidden");
    start.classList.remove("hidden");
  }
}

export function closeScanner() {
  activeControls?.stop();
  activeControls = null;

  document.getElementById("scanner-active")?.classList.add("hidden");
  document.getElementById("scanner-start")?.classList.remove("hidden");
}
