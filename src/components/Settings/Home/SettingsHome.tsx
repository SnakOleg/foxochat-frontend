import { config } from "@lib/config/endpoints";
import arrowIcon from "@/assets/icons/left-bar/settings/arrow-right.svg";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { settingsSections } from "../settingsSections";
import * as styles from "./SettingsHome.module.scss";
import type { SettingsHomeProps } from "@interfaces/interfaces";
import VersionInfo from "@/components/Base/VersionInfo";

import SettingsSearchBar from "./SettingsSearchBar";

const sections = settingsSections;

export default function SettingsHome({
	selected,
	onSelect,
	currentUser,
	isMobile = false,
}: SettingsHomeProps) {
	return (
		<nav className={`${styles.settingsMenu} ${isMobile ? styles.mobile : ""}`}>
			<div className={styles.settingsHeaderWrapper}>
				<div className={styles.settingsHeaderRow}>
					<span className={styles.settingsHeader}>Settings</span>
				</div>
				<SettingsSearchBar onSelectSection={onSelect} />
			</div>
			<div
				className={styles.profileCard + (selected === 'profile' ? ' ' + styles.profileCardActive : '')}
				onClick={() => { onSelect("profile"); }}
				tabIndex={0}
				role="button"
				aria-label="Open profile"
			>
				{currentUser?.avatar?.uuid ? (
					<img
						src={`${config.cdnBaseUrl}${currentUser.avatar.uuid}`}
						alt="Avatar"
						className={styles.profileAvatar}
					/>
				) : (
					<DefaultAvatar
						createdAt={currentUser.created_at}
						username={currentUser.display_name || currentUser.username}
						size="large"
					/>
				)}
				<div className={styles.profileInfo}>
					<span className={styles.profileName}>
						{currentUser.display_name || currentUser.username}
					</span>
					<span className={styles.profileUsername}>
						@{currentUser.username}
					</span>
					<span className={styles.profileEmail}>{currentUser.email}</span>
				</div>
				<img src={arrowIcon} alt="" className={styles.profileArrow} />
			</div>
			<div className={styles.categoriesList} style={{ flex: 1 }}>
				{sections.slice(1).map((s, idx, arr) => {
					let style: React.CSSProperties | undefined = undefined;
					if (idx === 0) {
						style = { marginBottom: 12 };
					}
					if (idx === arr.length - 1) {
						style = { ...(style || {}), marginTop: 12 };
					}
					return (
						<button
							key={s.key}
							className={selected === s.key ? styles.menuItemActive : styles.menuItem}
							onClick={() => onSelect(s.key)}
							style={style}
						>
							<span className={styles.menuIconBg} style={{ background: s.color }}>
								<img src={s.icon} alt="" className={styles.menuIcon} />
							</span>
							<span>{s.label}</span>
							<img src={arrowIcon} alt="" className={styles.menuArrow} />
						</button>
					);
				})}
			</div>
			<div className={styles.versionInfoBottom}>
				<VersionInfo />
			</div>
		</nav>
	);
}
