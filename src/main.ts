import "@fontsource-variable/geist";
import { initParticles } from "./particles";

const mode = import.meta.env.MODE;

const serverCode =
  mode === "production" ? location.hostname.split(".")[0] : "diademo";

const baseUrl =
  mode === "production"
    ? "https://api.fiyatgor.panunet.com.tr"
    : "http://localhost:3000";

let prevBarcode: string | null = null;

type ProductResponse = {
  message: string;
  product: {
    name: string;
    price: string;
    currency: string;
  };
};

// globally defining loaderContainer here so that the onBarcode function can access it to eliminate flickering of loader on null (same barcode entered)
let loaderContainer: HTMLDivElement | null = null;
let productContent: HTMLDivElement | null = null;
let resultWrapper: HTMLDivElement | null = null;

function setLoaderVisibility(visibility: boolean) {
  if (visibility) {
    if (resultWrapper) resultWrapper.style.gridTemplateRows = "1fr";
    loaderContainer?.classList.remove(
      "opacity-0",
      "scale-90",
      "pointer-events-none",
    );
    loaderContainer?.classList.add("opacity-100", "scale-100");
    productContent?.classList.remove("opacity-100", "scale-100");
    productContent?.classList.add(
      "opacity-0",
      "scale-90",
      "pointer-events-none",
    );
  } else {
    loaderContainer?.classList.remove("opacity-100", "scale-100");
    loaderContainer?.classList.add(
      "opacity-0",
      "scale-90",
      "pointer-events-none",
    );
    productContent?.classList.remove(
      "opacity-0",
      "scale-90",
      "pointer-events-none",
    );
    productContent?.classList.add("opacity-100", "scale-100");
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function onBarcode(
  value: string,
): Promise<ProductResponse["product"] | string | null> {
  if (value !== prevBarcode) {
    prevBarcode = value;

    if (value) {
      setLoaderVisibility(true);

      try {
        const response = await fetch(
          `${baseUrl}/servers/${serverCode}/products/${value}`,
        );

        if (!response.ok) {
          return (
            ((await response.json()) as ProductResponse).message ??
            "Ürün getirilemedi"
          );
        }

        return ((await response.json()) as ProductResponse).product;
      } catch (error) {
        console.error("An error occured while fetching product: ", error);

        return "Ürün getirilirken bir hata oluştu";
      } finally {
        setLoaderVisibility(false);
      }
    }
  }

  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  initParticles();

  const barcodeInput = document.getElementById(
    "barcode-input",
  ) as HTMLInputElement;
  barcodeInput.focus();

  window.addEventListener("click", () => {
    barcodeInput.focus();
  });

  const nameSpan = document.getElementById("product-name") as HTMLSpanElement;
  const priceSpan = document.getElementById("product-price") as HTMLSpanElement;
  const successAudio = document.getElementById(
    "success-audio",
  ) as HTMLAudioElement;
  const errorAudio = document.getElementById("error-audio") as HTMLAudioElement;

  loaderContainer = document.getElementById(
    "loader-container",
  ) as HTMLDivElement;
  productContent = document.getElementById("product-content") as HTMLDivElement;
  resultWrapper = document.getElementById("result-wrapper") as HTMLDivElement;

  let timerId: number | undefined;

  document.addEventListener("keypress", async (e) => {
    if (e.key !== "Enter") return;

    const value = barcodeInput.value;
    barcodeInput.value = "";
    const response = await onBarcode(value);
    const scheduleClear = (delay: number) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        productContent?.classList.remove("opacity-100", "scale-100");
        productContent?.classList.add(
          "opacity-0",
          "scale-90",
          "pointer-events-none",
        );
        if (resultWrapper) resultWrapper.style.gridTemplateRows = "0fr";

        const clearOnTransitionEnd = () => {
          nameSpan.textContent = "";
          priceSpan.textContent = "";
          productContent?.removeEventListener(
            "transitionend",
            clearOnTransitionEnd,
          );
        };
        productContent?.addEventListener("transitionend", clearOnTransitionEnd);

        prevBarcode = null;
        timerId = undefined;
      }, delay);
    };

    if (response && typeof response === "object") {
      nameSpan.textContent = response.name;
      priceSpan.textContent = `${formatPrice(Number(response.price))} ${response.currency}`;
      successAudio.currentTime = 0;
      successAudio.play();
      scheduleClear(30_000);
    } else if (response && typeof response === "string") {
      nameSpan.textContent = response;
      priceSpan.textContent = "";
      errorAudio.currentTime = 0;
      errorAudio.play();
      scheduleClear(3_000);
    }
  });

  window.addEventListener("pagehide", () => {
    if (timerId) clearTimeout(timerId);
  });
});
