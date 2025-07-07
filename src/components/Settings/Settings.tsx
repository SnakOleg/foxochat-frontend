import ProfileSettings from "./Profile/ProfileSettings";
import GeneralSettings from "./General/GeneralSettings";
import AppearanceSettings from "./Appearance/AppearanceSettings";
import NotificationsSettings from "./Notifications/NotificationsSettings";
import PrivacySettings from "./Privacy/PrivacySettings";
import SupportSettings from "./Support/SupportSettings";
import * as styles from "./Settings.module.scss";
import type { APIUser } from "foxochat.js";
import SectionHeader from "./SectionHeader";

interface SettingsProps {
    currentUser: APIUser;
    selectedSection?: string;
    onSelectSection?: (section: string) => void;
}

const SECTION_TITLES: Record<string, string> = {
    profile: "Profile Settings",
    general: "General Settings",
    appearance: "Appearance Settings",
    notifications: "Notifications Settings",
    privacy: "Privacy & Security",
    support: "Support & News",
};

export default function Settings({ currentUser, selectedSection = "profile" }: SettingsProps) {

    const renderSection = () => {
        switch (selectedSection) {
            case "profile":
                return <ProfileSettings currentUser={currentUser}/>;
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
        <div className={styles.settingsContent} style={{ position: 'relative', minHeight: '100vh' }}>
            <SectionHeader
                section={selectedSection}
                title={SECTION_TITLES[selectedSection] || "Settings"}
            />
            <div className={styles.settingsInnerContent}>
                {renderSection()}
            </div>
        </div>
    );
} 