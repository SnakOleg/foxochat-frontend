import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { Tooltip } from "@/components/Chat/Tooltip/Tooltip";
import { apiMethods } from "@services/API/apiMethods";
import { memo } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import * as styles from "./ChatOverview.module.scss";
import MemberList from "./MemberList";
import { ChatOverviewProps } from "@interfaces/interfaces";
import { APIMember } from "foxochat.js";

import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import MuteIcon from "@/assets/icons/right-bar/chat/chat-overview/mute.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";

const ChatOverview = ({ channel, isOwner, visible = true, className }: ChatOverviewProps) => {
    const handleEditChannel = useCallback(() => {
        // TODO: Implement edit channel
    }, []);

    const handlePinChannel = useCallback(() => {
        // TODO: Implement pin channel
    }, []);

    const handleMuteChannel = useCallback(() => {
        // TODO: Implement mute channel
    }, []);

    const handleDeleteChannel = useCallback(() => {
        if (isOwner) {
            void apiMethods.deleteChannel(channel.id);
        } else {
            void apiMethods.leaveChannel(channel.id);
        }
    }, [channel.id, isOwner]);

    const [members, setMembers] = useState<APIMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const membersList = await apiMethods.listChannelMembers(channel.id);
                if (mounted) setMembers(membersList);
            } catch (err) {
                if (mounted) setError("Failed to load members");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        void fetchMembers();
        return () => { mounted = false; };
    }, [channel.id]);

    const onlineCount = members.filter((m) => m.user.status === 1).length;

    return (
        <div
            className={styles.overview + (visible ? " " + styles.visible : " " + styles.hidden) + (className ? " " + className : "")}
        >
            <div className={styles.header}>
                <div className={styles.headerBackground}>
                    {channel.icon ? (
                        <img
                            src={`${config.cdnBaseUrl}${channel.icon.uuid}`}
                            alt={channel.name}
                            className={styles.backgroundAvatar}
                        />
                    ) : (
                        <DefaultAvatar
                            createdAt={channel.created_at}
                            username={channel.display_name || channel.name}
                            size="fill"
                            square
                        />
                    )}
                    <div className={styles.headerOverlay}/>
                    <div className={styles.headerContent}>
                        <h2 className={styles.channelName}>
                            {channel.display_name || channel.name}
                        </h2>
                        <div className={styles.memberCount}>
                            {channel.member_count} Members • {onlineCount} Online
                        </div>
                        <div className={styles.actions}>
                            {isOwner && (
                                <Tooltip text="Edit" position="top">
                                    <button
                                        className={styles.actionButton}
                                        onClick={handleEditChannel}
                                    >
                                        <img src={EditIcon} alt="Edit"/>
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip text="Mute" position="top">
                                <button
                                    className={styles.actionButton}
                                    onClick={handleMuteChannel}
                                >
                                    <img src={MuteIcon} alt="Mute"/>
                                </button>
                            </Tooltip>
                            <Tooltip text="Pin" position="top">
                                <button
                                    className={styles.actionButton}
                                    onClick={handlePinChannel}
                                >
                                    <img src={PinIcon} alt="Pin"/>
                                </button>
                            </Tooltip>
                            <Tooltip text={isOwner ? "Leave" : "Delete"} position="top">
                                <button
                                    className={`${styles.actionButton} ${styles.dangerButton}`}
                                    onClick={handleDeleteChannel}
                                >
                                    <img src={TrashIcon} alt={isOwner ? "Leave" : "Delete"}/>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <MemberList members={members} loading={loading} error={error}/>
        </div>
    );
};

export default memo(ChatOverview);
