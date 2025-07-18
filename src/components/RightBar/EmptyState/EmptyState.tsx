import { EmptyStateProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { timestampToHSV } from "@utils/functions";
import { APIChannel } from "foxochat.js";
import { observer } from "mobx-react";
import * as style from "./EmptyState.module.scss";

const EmptyState = ({ selectedChat }: EmptyStateProps) => {
	const chats = appStore.channels;

	const handleChatClick = (chat: APIChannel) => {
		void appStore.setCurrentChannel(chat.id);
		window.history.replaceState(null, '', `/channels/#${chat.id}`);
	};

	const formatTimestamp = (timestamp: number): string => {
		const date = new Date(timestamp);

		const is12HourFormat = new Intl.DateTimeFormat("en-US", { hour12: true })
			.formatToParts(new Date())
			.some((part) => part.type === "dayPeriod");

		const options: Intl.DateTimeFormatOptions = {
			hour: "2-digit",
			minute: "2-digit",
			hour12: is12HourFormat,
		};

		const formatter = new Intl.DateTimeFormat("en-US", options);
		return formatter.format(date);
	};

	const getInitial = (chat: APIChannel): string => {
		return (chat.display_name?.[0] ?? chat.name[0] ?? "?").toUpperCase();
	};

	const getAvatarBackground = (chat: APIChannel): string => {
		const ts = chat.created_at;
		const { background } = timestampToHSV(ts);
		return background;
	};

	return (
		<div className={style.emptyContainer}>
			<div className={style.content}>
				<h1 className={style.emptyHeader}>
					Select a channel to start messaging
				</h1>
				<p className={style.emptySubtext}>or check unread messages:</p>
				<div className={style.chatList}>
					{chats.map((chat, index) => (
						<div
							key={index}
							className={`${style.chatItem} ${
								selectedChat?.name === chat.name ? style.selected : ""
							}`}
							onClick={() => {
								handleChatClick(chat);
							}}
						>
							<div>
								{chat.icon ? (
									<img
										src={`${config.cdnBaseUrl}${chat.icon.uuid}`}
										alt={chat.name}
										className={style.avatar}
									/>
								) : (
									<div
										className={style.avatar}
										style={{
											backgroundColor: getAvatarBackground(chat),
										}}
									>
										{getInitial(chat)}
									</div>
								)}
							</div>
							<div className={style.chatContent}>
								<span className={style.username}>
									{chat.display_name || chat.name}
								</span>
								<span className={style.messagePreview}>
									{chat.last_message?.content &&
									chat.last_message.content.length > 20
										? `${chat.last_message.content.substring(0, 20)}...`
										: chat.last_message?.content || ""}
								</span>
							</div>
							<span className={style.timestamp}>
								{chat.last_message
									? formatTimestamp(chat.last_message.created_at)
									: "00:00"}
							</span>
						</div>
					))}
				</div>
			</div>
			<div className={style.glow} />
		</div>
	);
};

export default observer(EmptyState);
