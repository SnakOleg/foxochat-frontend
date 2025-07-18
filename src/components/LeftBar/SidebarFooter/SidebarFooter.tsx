import ContactsIcon from "@assets/icons/left-bar/navigation/bottom/contacts.svg?react";
import ChatsIcon from "@assets/icons/left-bar/navigation/bottom/chats.svg?react";
import SettingsIcon from "@assets/icons/left-bar/navigation/bottom/settings.svg?react";
import * as styles from "./SidebarFooter.module.scss";
import type { SidebarFooterProps } from "@interfaces/interfaces";

const SidebarFooter = ({ active = "chats", onNav, isMobile = false, className }: SidebarFooterProps) => {
  return (
    <div className={`${styles.navFooter} ${isMobile ? styles.mobile : ""} ${className || ""}`}>
      <button
        className={styles.navBtn + (active === "contacts" ? " " + styles.active : "")}
        onClick={() => onNav?.("contacts")}
        aria-label="Contacts"
      >
        <ContactsIcon className={styles.icon} />
      </button>
      <button
        className={styles.navBtn + (active === "chats" ? " " + styles.active : "")}
        onClick={() => onNav?.("chats")}
        aria-label="Chats"
      >
        <ChatsIcon className={styles.icon} />
      </button>
      <button
        className={styles.navBtn + (active === "settings" ? " " + styles.active : "")}
        onClick={() => onNav?.("settings")}
        aria-label="Settings"
      >
        <SettingsIcon className={styles.icon} />
      </button>
    </div>
  );
};

export default SidebarFooter;
