import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import EditIcon from "@/assets/icons/left-bar/navigation/channel-edit.svg?react";
import PlusIcon from "@/assets/icons/left-bar/navigation/create-button.svg?react";
import { config } from "@/lib/config/endpoints";
import * as styles from "./ChatHeader.module.scss";

interface ChatHeaderProps {
    currentUser: any;
    onEdit?: () => void;
    onAdd?: () => void;
}

const ChatHeader = ({ currentUser, onEdit, onAdd }: ChatHeaderProps) => {
    return (
        <div className={styles.headerWrapper}>
            <div className={styles.sidebarTopHeader}>
                {currentUser?.avatar?.uuid ? (
                    <img
                        src={`${config.cdnBaseUrl}${currentUser.avatar.uuid}`}
                        alt="User Avatar"
                        className={styles.sidebarTopAvatar}
                    />
                ) : (
                    <DefaultAvatar
                        createdAt={currentUser?.created_at ?? 0}
                        username={currentUser?.username ?? ""}
                        size="medium"
                    />
                )}
                <span className={styles.sidebarTopTitle}>Chats</span>
                <div className={styles.sidebarTopIcons}>
                    <button className={styles.sidebarTopIconBtn} aria-label="Edit chats" onClick={onEdit}>
                        <EditIcon />
                    </button>
                    <button className={styles.sidebarTopIconBtn} aria-label="Add chat" onClick={onAdd}>
                        <PlusIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader; 