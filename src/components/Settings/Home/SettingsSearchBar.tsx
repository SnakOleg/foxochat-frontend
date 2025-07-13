import { useState, useEffect } from "preact/hooks";
import * as chatSearchStyles from "@/components/LeftBar/SearchBar/SearchBar.module.scss";
import { settingsSections } from "../settingsSections";

function getAllSearchableSettings() {
  const sectionKeys = settingsSections.map(s => s.key);
  const result: { section: string, label: string, id: string }[] = [];
  if (typeof document !== 'undefined') {
    sectionKeys.forEach(section => {
      if (section === 'profile') {
        const nodes = document.querySelectorAll('[data-settings-label]');
        nodes.forEach(node => {
          const label = node.getAttribute('data-settings-label');
          const id = node.id;
          if (label && id) result.push({ section, label, id });
        });
      }
    });
  }
  return result;
}

export default function SettingsSearchBar({ onSelectSection }: { onSelectSection: (section: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ section: string, label: string, id: string }[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const all = getAllSearchableSettings();
    const q = query.toLowerCase();
    setResults(all.filter(item => item.label.toLowerCase().includes(q)));
  }, [query]);

  function handleResultClick(section: string, id: string) {
    onSelectSection(section);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }

  return (
    <div style={{ margin: "0 16px 12px 16px" }}>
      <div className={chatSearchStyles.searchBar}>
        <img
          src={require("@/assets/icons/left-bar/navigation/magnifying-glass.svg")}
          alt="Search"
          className={chatSearchStyles.searchIcon}
        />
        <input
          type="text"
          placeholder="Search settings..."
          value={query}
          onInput={e => setQuery((e.target as HTMLInputElement).value)}
          className={chatSearchStyles.searchInput}
        />
      </div>
      {query && (
        <div style={{ background: "#23242a", borderRadius: 8, padding: 8, maxHeight: 220, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ color: "#888", padding: 8 }}>Nothing found</div>
          ) : results.map(item => (
            <div
              key={item.id}
              style={{ padding: "8px 8px", cursor: "pointer", borderRadius: 6, color: "#ececec" }}
              onClick={() => handleResultClick(item.section, item.id)}
              onMouseDown={e => e.preventDefault()}
            >
              {item.label} <span style={{ color: '#888', fontSize: 12 }}>({item.section})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 