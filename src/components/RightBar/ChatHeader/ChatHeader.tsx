import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import type { ChatHeaderProps } from "@interfaces/interfaces";
import OverviewIcon from "@/assets/icons/right-bar/chat/chatHeader/chat-overview.svg";
import SearchIcon from "@/assets/icons/right-bar/chat/chatHeader/search.svg";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import * as style from "./ChatHeader.module.scss";
import { observer } from "mobx-react";
import ArrowBackIcon from '@/assets/icons/right-bar/chat/chatHeader/arrow-back.svg';

interface ChatHeaderPropsWithCounts extends ChatHeaderProps {
  participantsCount: number;
  onlineCount: number;
}

const ChatHeader = ({
  chat,
  isMobile,
  onBack,
  showOverview,
  setShowOverview,
  participantsCount,
  onlineCount,
}: ChatHeaderPropsWithCounts) => {
  const { name, display_name, icon, created_at } = chat;
  const nameToDisplay = display_name || name;

    return (
        <div className={style.chatHeader}>
            {isMobile && onBack && (
                <button className={style.backButton} onClick={onBack} aria-label="Back">
                    <img src={ArrowBackIcon} alt="Back" />
                </button>
            )}
            {icon ? (
                <img
                    src={`${config.cdnBaseUrl}${icon.uuid}`}
                    alt={`${nameToDisplay}'s avatar`}
                    className={style.chatHeaderAvatar}
                />
            ) : (
                <DefaultAvatar
                    createdAt={created_at}
                    username={nameToDisplay}
                    size="medium"
                />
            )}
            <div className={style.chatHeaderInfo}>
                <p className={style.chatHeaderUsername}>{nameToDisplay}</p>
                <div className={style.chatHeaderMembers}>
                    <span>• {participantsCount} Members • {onlineCount} Online</span>
                </div>
            </div>
            <div className={style.headerActions}>
                <button
                    onClick={() => setShowOverview(!showOverview)}
                    aria-label={showOverview ? "Hide chat info" : "Show chat info"}
                    style={{
                        background: "none",
                        border: "none",
                        padding: 8,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img src={OverviewIcon} alt="chat overview"/>
                </button>
                <Tooltip text="Temporary unavailable" position="bottom">
                    <button
                        disabled
                        style={{
                            opacity: 0.5,
                            cursor: "not-allowed",
                            background: "none",
                            border: "none",
                            padding: 8,
                            borderRadius: 8,
                        }}
                    >
                        <img src={SearchIcon} alt="search"/>
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export default observer(ChatHeader);
