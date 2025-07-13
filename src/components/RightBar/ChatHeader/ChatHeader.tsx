import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import type { ChatHeaderProps } from "@interfaces/interfaces";
import ArrowBackIcon from "@/assets/icons/right-bar/chat/chatHeader/arrow-back.svg?react";
import OverviewIcon from "@/assets/icons/right-bar/chat/chatHeader/chat-overview.svg?react";
import SearchIcon from "@/assets/icons/right-bar/chat/chatHeader/search.svg?react";
import * as style from "./ChatHeader.module.scss";
import { observer } from "mobx-react";

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
                    <ArrowBackIcon />
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
                    className={style.headerActionButton}
                >
                    <OverviewIcon />
                </button>
                <Tooltip text="Temporary unavailable" position="bottom">
                    <button
                        disabled
                        className={style.headerActionButton}
                    >
                        <SearchIcon />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export default observer(ChatHeader);
