import { useState, useEffect, useRef } from "preact/hooks";
import ProfileSettings from "./Profile/ProfileSettings";
import GeneralSettings from "./General/GeneralSettings";
import AppearanceSettings from "./Appearance/AppearanceSettings";
import NotificationsSettings from "./Notifications/NotificationsSettings";
import PrivacySettings from "./Privacy/PrivacySettings";
import SupportSettings from "./Support/SupportSettings";
import SettingsHome from "./Home/SettingsHome";
import SidebarFooter from "@components/LeftBar/SidebarFooter/SidebarFooter";
import * as styles from "./MobileSettings.module.scss";
import type { MobileSettingsProps } from "@interfaces/interfaces";

const SECTION_TITLES: Record<string, string> = {
    profile: "Profile",
    general: "General",
    appearance: "Appearance",
    notifications: "Notifications",
    privacy: "Privacy & Security",
    support: "Support & News",
};

export default function MobileSettings({ 
    currentUser, 
    selectedSection = "",
    onSelectSection, 
    onTabChange,
}: MobileSettingsProps) {
    const [currentView, setCurrentView] = useState<"menu" | "section">("menu");
    const [activeSection, setActiveSection] = useState(selectedSection);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward");
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragCurrentX, setDragCurrentX] = useState(0);
    const sectionViewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedSection && selectedSection !== "") {
            setCurrentView("section");
            setActiveSection(selectedSection);
        } else if (selectedSection === "") {
            setCurrentView("menu");
            setActiveSection("");
        }
    }, [selectedSection]);

    const handleSectionSelect = (section: string) => {
        setAnimationDirection("forward");
        setIsAnimating(true);
        setActiveSection(section);
        requestAnimationFrame(() => {
            setCurrentView("section");
        });
        setTimeout(() => {
            setIsAnimating(false);
            onSelectSection?.(section);
        }, 300);
    };

    const handleBackToMenu = () => {
        setAnimationDirection("backward");
        setIsAnimating(true);
        requestAnimationFrame(() => {
            setCurrentView("menu");
        });
        setTimeout(() => {
            setIsAnimating(false);
            setActiveSection("");
            onSelectSection?.("");
        }, 300);
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (currentView !== "section" || !e.touches[0]) return;
        setIsDragging(true);
        setDragStartX(e.touches[0].clientX);
        setDragCurrentX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging || currentView !== "section" || !e.touches[0]) return;
        e.preventDefault();
        setDragCurrentX(e.touches[0].clientX);
        const deltaX = dragCurrentX - dragStartX;
        if (deltaX > 0 && sectionViewRef.current) {
            const translateX = Math.min(deltaX * 0.3, 100);
            sectionViewRef.current.style.transform = `translateX(${translateX}px)`;
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging || currentView !== "section") return;
        setIsDragging(false);
        const deltaX = dragCurrentX - dragStartX;
        if (deltaX > 100) {
            handleBackToMenu();
        } else if (sectionViewRef.current) {
            sectionViewRef.current.style.transform = "translateX(0)";
        }
    };

    const renderSection = () => {
        switch (activeSection) {
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
        <div className={styles.mobileSettingsContainer}>
            <div 
                className={`${styles.settingsView} ${styles.menuView} ${
                    currentView === "menu" ? styles.active : ""
                } ${isAnimating && animationDirection === "backward" ? styles.slideInFromLeft : ""}`}
                style={{ paddingBottom: currentView === "menu" ? 64 : 0 }}
            >
                <SettingsHome
                    selected={activeSection}
                    onSelect={handleSectionSelect}
                    currentUser={currentUser}
                    isMobile={true}
                />
            </div>
            <div 
                ref={sectionViewRef}
                className={`${styles.settingsView} ${styles.sectionView} ${
                    currentView === "section" ? styles.active : ""
                } ${isAnimating && animationDirection === "forward" ? styles.slideInFromRight : ""}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.sectionHeader}>
                    <button 
                        className={styles.backButton}
                        onClick={handleBackToMenu}
                        aria-label="Back to settings menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path 
                                d="M15 18L9 12L15 6" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <h1 className={styles.sectionTitle}>
                        {SECTION_TITLES[activeSection] || "Settings"}
                    </h1>
                </div>
                <div className={styles.sectionContent}>
                    {renderSection()}
                </div>
            </div>
            <div className={styles.footerContainer}>
                <SidebarFooter
                    active="settings"
                    isMobile={true}
                    onNav={(nav) => {
                        if (nav === "settings") return;
                        if (onTabChange) {
                            if (onSelectSection) onSelectSection("");
                            onTabChange(nav);
                        }
                    }}
                />
            </div>
        </div>
    );
} 