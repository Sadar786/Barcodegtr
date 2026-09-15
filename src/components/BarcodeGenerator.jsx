import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import coolerBackground from "../assets/coolerBackground.jpeg";
import "./BarcodeGenerator.css";

export default function BarcodeGenerator() {
  const [barcodeValue, setBarcodeValue] = useState("022601619");
  const barcodeRef = useRef(null);
  const previewRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const isValid = /^[\x20-\x7E]+$/.test(barcodeValue) && barcodeValue.trim().length > 0;

  useEffect(() => {
    if (!isValid) {
      barcodeRef.current.replaceChildren();
      return;
    }

    JsBarcode(barcodeRef.current, barcodeValue, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 3,
      height: 80,
      lineColor: "#21252f",
      background: "transparent",
    });
    barcodeRef.current.setAttribute("preserveAspectRatio", "none");
  }, [barcodeValue, isValid]);

  async function downloadBarcode() {
    if (!isValid || isDownloading) return;
    setIsDownloading(true);
    setDownloadError("");

    try {
      const preview = previewRef.current;
      const photo = preview.querySelector("img");
      await photo.decode();
      await document.fonts.ready;
      const dataUrl = await toPng(preview, {
        canvasWidth: photo.naturalWidth,
        canvasHeight: photo.naturalHeight,
        pixelRatio: 1,
        skipFonts: true,
      });
      const link = document.createElement("a");
      link.download = `cooler-barcode-${barcodeValue.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setDownloadError("Could not download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="barcode-generator">
    

      <div ref={previewRef} className="label-preview" role="img" aria-label={isValid ? `Cooler with Pepsi label barcode ${barcodeValue}` : "Cooler with a blank barcode label"}>
        <img src={coolerBackground} alt="" className="label-background" />
        <div className="dynamic-barcode-area" aria-hidden="true">
          <svg ref={barcodeRef} className="barcode-svg" />
          <div className="barcode-number">{isValid ? barcodeValue : ""}</div>
        </div>
      </div>
        <div className="input-section">
        <label htmlFor="barcode-number">Barcode Number</label>
        <input
          id="barcode-number"
          type="text"
          disabled={isDownloading}
          value={barcodeValue}
          onChange={(event) => setBarcodeValue(event.target.value)}
          placeholder="Enter barcode e.g. 02233234"
          aria-invalid={!isValid}
          aria-describedby="barcode-help"
        />
        <p id="barcode-help" className="barcode-help" role="status">
          {isValid
            ? "Your barcode appears on the cooler’s lower Pepsi label."
            : "Enter a barcode using English letters, numbers, or symbols."}
        </p>
        <button
          type="button"
          className="download-button"
          onClick={downloadBarcode}
          disabled={!isValid || isDownloading}
        >
          {isDownloading ? "Preparing image…" : "Download PNG"}
        </button>
        {downloadError && <p className="barcode-help" role="alert">{downloadError}</p>}
      </div>
    </div>
  );
}
