import { useState, useRef, useEffect } from "preact/hooks";
import React from "react";
import * as styles from "./SearchBar.module.scss";

const platformMatchers: Record<string, RegExp> = {
  windows: /windows nt/i,
  mac: /mac(?:intosh| os x)/i,
  mobile: /mobile|android|iphone|ipad|ipod/i,
  linux: /linux/i,
};

const getPlatform = (): string => {
  if (typeof navigator === 'undefined') return "unknown";
  const userAgent = navigator.userAgent.toLowerCase();
  for (const [platform, regex] of Object.entries(platformMatchers)) {
    if (regex.test(userAgent)) return platform;
  }
  return "unknown";
};

const getShortcut = (platform: string): string => {
  switch (platform) {
    case "mac":
      return "⌘+K";
    case "windows":
      return "Ctrl + K";
    case "linux":
      return "Ctrl + Shift + K";
    default:
      return "";
  }
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [isSearchActive, setSearchActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  useEffect(() => {
    const ctrlPlatforms = ["windows", "linux"];
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (platform === "mac" && event.metaKey && event.code === "KeyK") ||
        (ctrlPlatforms.includes(platform) &&
          event.ctrlKey &&
          event.code === "KeyK");
      if (isShortcut) {
        event.preventDefault();
        setSearchActive(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (event.code === "Escape" && isSearchActive) {
        setSearchActive(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [platform, isSearchActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value);
  };

  const shortcut = getShortcut(platform);
  const placeholder = shortcut ? `Search (${shortcut})` : "Search";

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar + (isSearchActive ? ' ' + styles.active : '')}>
        <img src={require("@/assets/icons/left-bar/navigation/magnifying-glass.svg")} alt="Search" className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

export default SearchBar;
