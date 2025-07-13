import userIcon from "@/assets/icons/left-bar/settings/user.svg";
import generalIcon from "@/assets/icons/left-bar/settings/general.svg";
import appearanceIcon from "@/assets/icons/left-bar/settings/appearance.svg";
import notificationsIcon from "@/assets/icons/left-bar/settings/notifications.svg";
import privacyIcon from "@/assets/icons/left-bar/settings/privacy-security.svg";
import supportIcon from "@/assets/foxochat.svg";

export const settingsSections = [
  { key: "profile", label: "Profile", icon: userIcon, color: "#FF5555" },
  { key: "myprofile", label: "My profile", icon: userIcon, color: "#FF5555" },
  { key: "general", label: "General", icon: generalIcon, color: "#557DFF" },
  { key: "appearance", label: "Appearance", icon: appearanceIcon, color: "#7755FF" },
  { key: "notifications", label: "Notifications", icon: notificationsIcon, color: "#FF9655" },
  { key: "privacy", label: "Privacy & Security", icon: privacyIcon, color: "#FF5855" },
  { key: "support", label: "Support & News", icon: supportIcon, color: "var(--branded-color)" },
]; 