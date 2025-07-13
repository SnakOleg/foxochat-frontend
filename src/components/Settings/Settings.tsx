import ProfileSettings from "./Profile/ProfileSettings";
import GeneralSettings from "./General/GeneralSettings";
import AppearanceSettings from "./Appearance/AppearanceSettings";
import NotificationsSettings from "./Notifications/NotificationsSettings";
import PrivacySettings from "./Privacy/PrivacySettings";
import SupportSettings from "./Support/SupportSettings";
import MobileSettings from "./MobileSettings";
import * as styles from "./Settings.module.scss";
import SectionHeader from "./SectionHeader";
import PublicProfileCard from "./Profile/PublicProfileCard";
import type { SettingsProps } from "@interfaces/interfaces";

const SECTION_TITLES: Record<string, string> = {
    profile: "Profile Settings",
    general: "General Settings",
    appearance: "Appearance Settings",
    notifications: "Notifications Settings",
    privacy: "Privacy & Security",
    support: "Support & News",
};

export default function Settings({ currentUser, selectedSection, onSelectSection, isMobile = false, className, onTabChange }: SettingsProps) {

    const defaultSection = isMobile ? '' : 'profile';
    const section = selectedSection === undefined ? defaultSection : selectedSection;

    if (isMobile) {
        return (
            <div className={`settings ${className || ""}`}>
                <MobileSettings
                    currentUser={currentUser}
                    selectedSection={section}
                    onSelectSection={onSelectSection || (() => {})}
                    onTabChange={onTabChange || (() => {})}
                />
            </div>
        );
    }

    const renderSection = () => {
        switch (section) {
            case "profile":
                return <ProfileSettings currentUser={currentUser}/>;
            case "myprofile":
                return <PublicProfileCard user={currentUser}/>;
            case "general":
                return <GeneralSettings/>;
            case "appearance":
                return <AppearanceSettings/>;
            case "notifications":
                return <NotificationsSettings/>;
            case "privacy":
                return <PrivacySettings/>;
            case "support":
                return <SupportSettings/>;
            default:
                return null;
        }
    };

    return (
        <div className={`${styles.settingsContent} ${isMobile ? styles.mobile : ""}`} style={{ position: 'relative', minHeight: '100vh' }}>
            <SectionHeader
                section={section}
                title={SECTION_TITLES[section] || "Settings"}
                isMobile={isMobile}
            />
            <div className={styles.settingsInnerContent}>
                {renderSection()}
            </div>
        </div>
    );
} 