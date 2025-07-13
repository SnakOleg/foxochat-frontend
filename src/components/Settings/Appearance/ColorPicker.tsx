import { useState, useEffect, useRef } from "preact/hooks";
import { createPortal } from "preact/compat";
import { ColorPicker as ReactColorPicker, IColor } from "react-color-palette";
import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import "react-color-palette/css";
import * as styles from "./ColorPicker.module.scss";
import type { ColorPickerProps } from "@interfaces/interfaces";

const hexToIColor = (hex: string): IColor => {
  const cleanHex = hex.replace('#', '');
  
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = max === 0 ? 0 : (diff / max) * 100;
  let v = (max / 255) * 100;
  
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }
  
  return {
    hex,
    rgb: { r, g, b, a: 1 },
    hsv: { h, s, v, a: 1 }
  };
};

function ColorPickerModal({ children }: { children: preact.ComponentChildren }) {
  return createPortal(
    <div className={styles.colorPickerModal}>{children}</div>,
    document.body
  );
}

export default function ColorPicker({ color, onChange, label, resetText, onReset, showReset }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<IColor>(hexToIColor(color));
  const [copied, setCopied] = useState<"hex" | "rgb" | null>(null);
  const copyTimeout = useRef<number | null>(null);

  const rgbRounded = [
    Math.round(currentColor.rgb.r),
    Math.round(currentColor.rgb.g),
    Math.round(currentColor.rgb.b)
  ];
  const rgbString = rgbRounded.join(", ");

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("Escape pressed");
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleColorChange = (newColor: IColor) => {
    setCurrentColor(newColor);
  };

  const handleApply = () => {
    onChange(currentColor.hex);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setCurrentColor(hexToIColor(color));
    setIsOpen(false);
  };

  const handleCopy = async (type: "hex" | "rgb", value: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(type);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => setCopied(null), 1200);
      console.log("Copied:", value);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className={styles.colorPickerContainer}>
      <div className={styles.colorPickerRow}>
        <span className={styles.colorPickerLabel}>{label}</span>
        {showReset && onReset && (
          <button
            className={styles.colorPickerReset}
            onClick={onReset}
            type="button"
          >
            {resetText || "Reset"}
          </button>
        )}
        <button
          className={styles.colorPickerButton}
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: color }}
          aria-label={`Change ${label.toLowerCase()}`}
        />
      </div>
      {isOpen && (
        <ColorPickerModal>
          <div className={styles.colorPickerContent}>
            <div className={styles.colorPickerHeader}>
              <span className={styles.colorPickerHeader}>{label}</span>
            </div>
            <div className={styles.colorPickerBody}>
              <ReactColorPicker
                color={currentColor}
                onChange={handleColorChange}
                hideAlpha
                hideInput={true}
              />
            </div>
            <div className={styles.colorPickerFields}>
              <Tooltip text="copied!" show={copied === "hex"} position="top">
                <div
                  className={styles.colorPickerFieldLabel}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCopy("hex", currentColor.hex)}
                >
                  HEX
                  <div className={styles.colorPickerField} style={{ userSelect: "all" }}>{currentColor.hex}</div>
                </div>
              </Tooltip>
              <Tooltip text="copied!" show={copied === "rgb"} position="top">
                <div
                  className={styles.colorPickerFieldLabel}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCopy("rgb", rgbString)}
                >
                  RGB
                  <div className={styles.colorPickerField} style={{ userSelect: "all" }}>{rgbString}</div>
                </div>
              </Tooltip>
            </div>
            <div className={styles.colorPickerFooter}>
              <button
                className={styles.colorPickerCancel}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className={styles.colorPickerApply}
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>
        </ColorPickerModal>
      )}
    </div>
  );
} 