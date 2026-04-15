import "@fontsource-variable/geist";
import { initParticles } from "./particles";
import { closeScanner, openScanner } from "./scanner";

const mode = import.meta.env.MODE;
const serverCode =
  mode === "production" ? location.hostname.split(".")[0] : "diademo";
const baseUrl =
  mode === "production"
    ? "https://api.fiyatgor.panunet.com.tr"
    : "http://localhost:3000";
const isMobile = window.matchMedia("(pointer: coarse)").matches;

type ProductResponse = {
  message: string;
  product: { name: string; price: string; currency: string };
};

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initParticles();

  // DOM refs
  const barcodeInput = document.getElementById(
    "barcode-input",
  ) as HTMLInputElement;
  const nameSpan = document.getElementById("product-name") as HTMLSpanElement;
  const priceSpan = document.getElementById("product-price") as HTMLSpanElement;
  const successAudio = document.getElementById(
    "success-audio",
  ) as HTMLAudioElement;
  const errorAudio = document.getElementById("error-audio") as HTMLAudioElement;
  const loaderContainer = document.getElementById(
    "loader-container",
  ) as HTMLDivElement;
  const productContent = document.getElementById(
    "product-content",
  ) as HTMLDivElement;
  const resultWrapper = document.getElementById(
    "result-wrapper",
  ) as HTMLDivElement;

  // State
  let prevBarcode: string | null = null;
  let timerId: number | undefined;

  barcodeInput.focus();
  document.addEventListener("click", ({ target }) => {
    if (!target || !("id" in target) || target.id !== "scanner-start")
      barcodeInput.focus();
  });

  function setLoaderVisibility(visible: boolean) {
    if (visible) {
      resultWrapper.style.gridTemplateRows = "1fr";
      loaderContainer.classList.remove(
        "opacity-0",
        "scale-90",
        "pointer-events-none",
      );
      loaderContainer.classList.add("opacity-100", "scale-100");
      productContent.classList.remove("opacity-100", "scale-100");
      productContent.classList.add(
        "opacity-0",
        "scale-90",
        "pointer-events-none",
      );
    } else {
      loaderContainer.classList.remove("opacity-100", "scale-100");
      loaderContainer.classList.add(
        "opacity-0",
        "scale-90",
        "pointer-events-none",
      );
      productContent.classList.remove(
        "opacity-0",
        "scale-90",
        "pointer-events-none",
      );
      productContent.classList.add("opacity-100", "scale-100");
    }
  }

  async function onBarcode(
    value: string,
  ): Promise<ProductResponse["product"] | string | null> {
    if (value === prevBarcode) return null;
    prevBarcode = value;
    if (!value) return null;

    setLoaderVisibility(true);
    try {
      const res = await fetch(
        `${baseUrl}/servers/${serverCode}/products/${value}`,
      );
      if (!res.ok) {
        return (
          ((await res.json()) as ProductResponse).message ?? "Ürün getirilemedi"
        );
      }
      return ((await res.json()) as ProductResponse).product;
    } catch (error) {
      console.error("An error occured while fetching product: ", error);
      return "Ürün getirilirken bir hata oluştu";
    } finally {
      setLoaderVisibility(false);
    }
  }

  function displayResult(
    response: ProductResponse["product"] | string | null,
    onDismiss?: () => void,
  ) {
    if (!response) return;

    if (typeof response === "object") {
      nameSpan.textContent = response.name;
      priceSpan.textContent = `${formatPrice(Number(response.price))} ${response.currency}`;
      successAudio.currentTime = 0;
      successAudio.play();
    } else {
      nameSpan.textContent = response;
      priceSpan.textContent = "";
      errorAudio.currentTime = 0;
      errorAudio.play();
    }

    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(
      () => {
        productContent.classList.remove("opacity-100", "scale-100");
        productContent.classList.add(
          "opacity-0",
          "scale-90",
          "pointer-events-none",
        );
        resultWrapper.style.gridTemplateRows = "0fr";

        const clearOnTransitionEnd = () => {
          nameSpan.textContent = "";
          priceSpan.textContent = "";
          productContent.removeEventListener(
            "transitionend",
            clearOnTransitionEnd,
          );
        };
        productContent.addEventListener("transitionend", clearOnTransitionEnd);

        prevBarcode = null;
        timerId = undefined;
        onDismiss?.();
      },
      typeof response === "object" ? 30_000 : 3_000,
    );
  }

  // Keyboard input
  document.addEventListener("keypress", async (e) => {
    if (e.key !== "Enter") return;
    const value = barcodeInput.value;
    barcodeInput.value = "";
    displayResult(await onBarcode(value));
  });

  // Camera scanner
  const scannerContainer = document.getElementById(
    "scanner-container",
  ) as HTMLElement;
  const scannerTrigger = document.getElementById("scanner-trigger");
  const scannerClose = document.getElementById("scanner-close") as HTMLElement;
  const scannerStart = document.getElementById("scanner-start") as HTMLElement;

  function startScanner() {
    openScanner(async (barcode) => {
      prevBarcode = null;
      displayResult(await onBarcode(barcode));
    });
  }

  if (isMobile) {
    // Show the container with the tap-to-scan button from the start.
    // We cannot auto-start the camera because iOS Safari requires a user gesture.
    scannerTrigger?.remove();
    scannerContainer.classList.remove("hidden");
    scannerStart.classList.remove("hidden");
    scannerStart.addEventListener("click", startScanner);
  } else {
    scannerClose.classList.remove("hidden");
    scannerTrigger?.addEventListener("click", (e) => {
      e.preventDefault();
      scannerContainer.classList.remove("hidden");
      startScanner();
    });
    scannerClose.addEventListener("click", () => {
      closeScanner();
      scannerContainer.classList.add("hidden");
    });
  }

  window.addEventListener("pagehide", () => {
    if (timerId) clearTimeout(timerId);
    closeScanner();
  });
});
