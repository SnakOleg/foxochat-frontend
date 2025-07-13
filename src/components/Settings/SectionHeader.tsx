import * as styles from './Settings.module.scss';
import * as headerStyles from './SectionHeader.module.scss';
import { settingsSections } from './settingsSections';
import type { SectionHeaderProps } from "@interfaces/interfaces";

export default function SectionHeader({ section, title, isMobile = false }: SectionHeaderProps) {
  const sectionObj = settingsSections.find(s => s.key === section);
  return (
    <div className={`${styles.settingsNavbar} ${isMobile ? styles.mobile : ""}`}>
      <span
        className={headerStyles.settingsSectionIconBg}
        style={{ background: sectionObj?.color }}
      >
        <img src={sectionObj?.icon} alt="" className={styles.settingsNavbarIcon} />
      </span>
      <span className={styles.settingsNavbarTitle}>{title}</span>
    </div>
  );
} 