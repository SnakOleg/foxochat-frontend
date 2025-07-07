import { config } from "@lib/config/endpoints";
import type { APIUser } from "foxochat.js";
import arrowIcon from "@/assets/icons/left-bar/settings/arrow-right.svg";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import SearchBar from "@/components/LeftBar/SearchBar/SearchBar";
import { settingsSections } from "../settingsSections";
import * as styles from "./SettingsHome.module.scss";

interface SettingsHomeProps {
	selected: string;
	onSelect: (key: string) => void;
	currentUser: APIUser;
}

const sections = settingsSections;

export default function SettingsHome({
	selected,
	onSelect,
	currentUser,
}: SettingsHomeProps) {
	return (
		<nav className={styles.settingsMenu}>
			<div className={styles.settingsHeaderRow}>
				<span className={styles.settingsHeader}>Settings</span>
			</div>
			<div style={{ margin: "0px 0px 8px" }}>
				<SearchBar />
			</div>
			<div
				className={styles.profileCard}
				onClick={() => onSelect("profile")}
				tabIndex={0}
				role="button"
				aria-label="Open profile settings"
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

			<div className={styles.categoriesList}>
				{sections.slice(0, 5).map((s, idx) => (
					<button
						key={s.key}
						className={
							selected === s.key ? styles.menuItemActive : styles.menuItem
						}
						onClick={() => onSelect(s.key)}
						style={idx === 0 ? { marginBottom: 18 } : undefined}
					>
						<span
							className={styles.menuIconBg}
							style={{ background: s.color }}
						>
							<img src={s.icon} alt="" className={styles.menuIcon} />
						</span>
						<span>{s.label}</span>
						<img src={arrowIcon} alt="" className={styles.menuArrow} />
					</button>
				))}
			</div>

			{sections[5] &&
				(() => {
					const supportSection = sections[5];
					return (
						<button
							key={supportSection.key}
							className={
								selected === supportSection.key
									? styles.menuItemActive
									: styles.menuItem
							}
							onClick={() => onSelect(supportSection.key)}
							style={{ marginTop: 12 }}
						>
							<span
								className={styles.menuIconBg}
								style={{ background: supportSection.color }}
							>
								<img
									src={supportSection.icon}
									alt=""
									className={styles.menuIcon}
								/>
							</span>
							<span>{supportSection.label}</span>
							<img src={arrowIcon} alt="" className={styles.menuArrow} />
						</button>
					);
				})()}
		</nav>
	);
}
