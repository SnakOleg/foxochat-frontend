import * as styles from './Settings.module.scss';
import * as headerStyles from './SectionHeader.module.scss';
import { settingsSections } from './settingsSections';

export default function SectionHeader({ section, title }: { section: string; title: string }) {
  const sectionObj = settingsSections.find(s => s.key === section);
  return (
    <div className={styles.settingsNavbar}>
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