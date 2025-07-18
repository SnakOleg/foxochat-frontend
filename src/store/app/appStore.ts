import { apiMethods } from "@services/API/apiMethods";
import { isAppleDevice } from "@utils/emoji";
import { Logger } from "@utils/logger";
import type {
	APIChannel,
	APIMessage,
	APIUser,
	RESTGetAPIMessageListQuery,
} from "foxochat.js";
import {
	action,
	configure,
	type IObservableArray,
	observable,
	reaction,
	runInAction,
} from "mobx";
import type { WebSocketClient } from "@/gateway/webSocketClient";
import * as apiService from "./apiService";
import { createChannelFromAPI, transformToMessage } from "./transforms";
import * as wsService from "./websocketService";

configure({ enforceActions: "observed" });

export function mapApiChannelToCached(chat: APIChannel): APIChannel {
	const transformed = createChannelFromAPI(chat);
	if (!transformed) {
		throw new Error("Failed to transform channel");
	}
	return transformed;
}

function mapApiUserToCached(user: APIUser): APIUser {
	return {
		...user,
	} as APIUser;
}

export class AppStore {
	@observable accessor messagesByChannelId = observable.map<
		number,
		IObservableArray<APIMessage>
	>();
	@observable accessor hasMoreMessagesByChannelId = observable.map<
		number,
		boolean
	>();
	@observable accessor isInitialLoad = observable.map<number, boolean>();
	@observable accessor channels: IObservableArray<APIChannel> =
		observable.array([]);
	@observable accessor users: IObservableArray<APIUser> = observable.array([]);
	@observable accessor activeRequests = observable.set<string>();
	@observable accessor currentChannelId: number | null = null;
	@observable accessor currentUserId: number | null = null;
	@observable accessor isLoading = false;
	@observable accessor isSendingMessage = false;
	@observable accessor connectionError: string | null = null;
	@observable accessor isWsInitialized = false;
	@observable accessor isLoadingHistory = false;
	@observable accessor channelDisposers = observable.map<number, () => void>();
	@observable accessor isCurrentChannelScrolledToBottom = true;
	@observable accessor unreadCount = observable.map<number, number>();
	/*
    @observable accessor channelScrollPositions = observable.map<
        number,
        number
    >();
    */
	@observable accessor channelParticipantsCount = observable.map<
		number,
		number
	>();
	@observable accessor userStatuses = observable.map<number, number>();

	@observable accessor appearanceSettings = {
		useSystemEmoji: isAppleDevice(),
		largeEmoji: true,
		reduceTransparency: false,
		reduceAnimations: false,
		brandedColor: "#2571FF",
	};

	wsClient: WebSocketClient | null = null;

	/*
    async initializeMetaFromCache() {
        const [cachedChats, cachedUsers] = await Promise.all([
            loadChatsFromCache(),
            loadUsersFromCache(),
        ]);
        runInAction(() => {
            this.channels.replace(cachedChats);
            this.users.replace(cachedUsers);
        });
    }
    */

	@action
	updateUserStatus(userId: number, status: number) {
		this.userStatuses.set(userId, status);
	}

	@action
	updateAppearanceSetting<K extends keyof typeof this.appearanceSettings>(
		key: K,
		value: (typeof this.appearanceSettings)[K],
	) {
		this.appearanceSettings[key] = value;
		this.applyAppearanceSettings();
		this.saveAppearanceSettings();
	}

	@action
	applyAppearanceSettings() {
		const {
			useSystemEmoji,
			largeEmoji,
			reduceTransparency,
			reduceAnimations,
			brandedColor,
		} = this.appearanceSettings;

		const html = document.documentElement;
		html.classList.remove(
			"native-emoji",
			"custom-emoji",
			"large-emoji",
			"small-emoji",
		);

		if (useSystemEmoji) {
			html.classList.add("native-emoji");
		} else {
			html.classList.add("custom-emoji");
		}
		if (largeEmoji) {
			html.classList.add("large-emoji");
		} else {
			html.classList.add("small-emoji");
		}

		if (reduceTransparency) {
			html.classList.add("reduce-transparency");
		} else {
			html.classList.remove("reduce-transparency");
		}

		if (reduceAnimations) {
			html.classList.add("reduce-motion");
		} else {
			html.classList.remove("reduce-motion");
		}

		html.style.setProperty("--branded-color", brandedColor);

		const hexToRgb = (hex: string) => {
			const cleanHex = hex.replace("#", "");
			if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
				Logger.warn(`Invalid hex color format: ${hex}, using default`);
				return "37, 113, 255";
			}

			const r = parseInt(cleanHex.substr(0, 2), 16);
			const g = parseInt(cleanHex.substr(2, 2), 16);
			const b = parseInt(cleanHex.substr(4, 2), 16);
			return `${r}, ${g}, ${b}`;
		};

		const rgbValue = hexToRgb(brandedColor);
		html.style.setProperty("--branded-color-rgb", rgbValue);

		Logger.info(`Applied branded color: HEX=${brandedColor}, RGB=${rgbValue}`);
	}

	@action
	updateUser(user: APIUser) {
		const userIndex = this.users.findIndex((u) => u.id === user.id);
		if (userIndex >= 0) {
			this.users[userIndex] = user;
		}
		this.userStatuses.set(user.id, user.status);
	}

	@action
	async syncWithServer() {
		try {
			Logger.info("Starting background sync with server...");
			const apiChannels = await apiMethods.userChannelsList();
			await this.updateChatsFromServer(apiChannels);
			Logger.info("Channels synced successfully");
		} catch (error) {
			Logger.error(`Background sync failed: ${error}`);
			throw error;
		}
	}

	@action
	async updateChatsFromServer(apiChats: APIChannel[]) {
		const cachedChats = apiChats.map(mapApiChannelToCached);
		/*
        await saveChatsToCache(cachedChats);
        */
		runInAction(() => {
			this.channels.replace(cachedChats);
		});
	}

	@action
	updateUsersFromServer(apiUsers: APIUser[]) {
		const cachedUsers = apiUsers.map(mapApiUserToCached);
		this.users.replace(cachedUsers);
		/*
        await saveUsersToCache(cachedUsers);
        */
	}

	@action
	async initChannel(channelId: number) {
		if (this.messagesByChannelId.has(channelId)) return;

		this.activeRequests.add(channelId.toString());
		this.isInitialLoad.set(channelId, true);

		try {
			await this.fetchInitialMessages(channelId, { limit: 50 });
		} finally {
			runInAction(() => {
				this.activeRequests.delete(channelId.toString());
				this.isInitialLoad.set(channelId, false);
			});
		}
	}

	@action
	updateMessagesForChannel(channelId: number, messages: APIMessage[]) {
		const existing =
			this.messagesByChannelId.get(channelId) || observable.array([]);
		const updated = Array.from(
			new Map([...existing, ...messages].map((msg) => [msg.id, msg])).values(),
		).sort((a, b) => a.created_at - b.created_at);
		runInAction(() => {
			this.messagesByChannelId.set(channelId, observable.array(updated));
		});
	}

	@action
	handleNewMessage(message: APIMessage) {
		const channelId = message.channel.id;
		let messages = this.messagesByChannelId.get(channelId);

		if (!messages) {
			messages = observable.array<APIMessage>([]);
			this.messagesByChannelId.set(channelId, messages);
		}

		if (!messages.some((m) => m.id === message.id)) {
			messages.push(message);
			messages.replace(
				[...messages].sort((a, b) => a.created_at - b.created_at),
			);

			if (
				this.currentChannelId === channelId &&
				!this.isCurrentChannelScrolledToBottom
			) {
				this.unreadCount.set(
					channelId,
					(this.unreadCount.get(channelId) || 0) + 1,
				);
			}
		}

		const channelIndex = this.channels.findIndex((c) => c.id === channelId);
		if (channelIndex >= 0) {
			const ch = this.channels[channelIndex];
			if (!ch) return;
			this.channels[channelIndex] = {
				id: ch.id,
				name: ch.name,
				display_name: ch.display_name,
				icon: ch.icon,
				created_at: ch.created_at,
				type: ch.type,
				flags: ch.flags,
				member_count: ch.member_count,
				owner: ch.owner,
				last_message: message,
			};
		}
	}

	@action
	setIsCurrentChannelScrolledToBottom(value: boolean) {
		if (this.currentChannelId !== null && value) {
			this.unreadCount.set(this.currentChannelId, 0);
		}
		this.isCurrentChannelScrolledToBottom = value;
	}

	@action
	setIsSendingMessage(state: boolean) {
		this.isSendingMessage = state;
	}

	@action
	setIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	@action
	async joinChannel(channelId: number) {
		const joined = await apiMethods.joinChannel(channelId);
		if (!this.channels.some((c) => c.id === channelId)) {
			this.channels.unshift(mapApiChannelToCached(joined.channel));
		}
		await this.setCurrentChannel(channelId);
	}

	@action
	async initializeFromUrl() {
		const hash = window.location.hash.substring(1);
		if (!hash || isNaN(Number(hash))) return;
		const channelId = Number(hash);
		if (this.channels.some((c) => c.id === channelId)) {
			await this.setCurrentChannel(channelId);
		}
	}

	@action
	setCurrentUser(userId: number) {
		this.currentUserId = userId;
	}

	@action
	setHasMoreMessages(channelId: number, hasMore: boolean) {
		this.hasMoreMessagesByChannelId.set(channelId, hasMore);
	}

	@action
	updateMessage(messageId: number, newContent: string) {
		const cid = this.currentChannelId;
		if (!cid) return;

		const msgs = this.messagesByChannelId.get(cid);
		if (!msgs) return;

		const idx = msgs.findIndex((m) => m.id === messageId);
		if (idx >= 0) {
			const msg = msgs[idx];
			msgs[idx] = transformToMessage({
				...msg,
				content: newContent,
			});
		}
	}

	@action
	async deleteMessage(messageId: number) {
		const cid = this.currentChannelId;
		if (!cid) return;

		try {
			await apiMethods.deleteMessage(cid, messageId);
		} catch (e) {
			Logger.error(`Failed to delete message via API: ${e}`);
			return;
		}

		const msgs = this.messagesByChannelId.get(cid);
		if (msgs) {
			this.messagesByChannelId.set(
				cid,
				observable.array(msgs.filter((m) => m.id !== messageId)),
			);
		}
	}

	@action
	async setCurrentChannel(channelId: number | null) {
		const previousChannelId = this.currentChannelId;

		if (previousChannelId === channelId) {
			return;
		}

		this.currentChannelId = channelId;

		if (previousChannelId !== null) {
			const disposer = this.channelDisposers.get(previousChannelId);
			if (disposer) {
				disposer();
				this.channelDisposers.delete(previousChannelId);
			}
		}

		if (channelId !== null) {
			localStorage.setItem("currentChannelId", String(channelId));
			runInAction(() => {
				if (!this.messagesByChannelId.has(channelId)) {
					this.messagesByChannelId.set(channelId, observable.array([]));
				}
				this.isLoadingHistory = false;
				this.activeRequests.delete(channelId.toString());
				this.isInitialLoad.set(channelId, true);
			});

			const existingMessages = this.messagesByChannelId.get(channelId);
			if (!existingMessages || existingMessages.length === 0) {
				await this.fetchInitialMessages(channelId);
			}

			runInAction(() => {
				this.isInitialLoad.set(channelId, false);
			});

			if (this.isWsInitialized) {
				this.handleHistorySync();
			}

			const disposer = reaction(
				() => this.messagesByChannelId.get(channelId)?.length ?? 0,
				(length) => {
					if (this.currentChannelId === channelId && length > 0) {
						requestAnimationFrame(() => {
							const container = document.getElementById("messageList");
							if (container && this.isCurrentChannelScrolledToBottom) {
								container.scrollTop = 0;
							}
						});
					}
				},
			);
			runInAction(() => {
				this.channelDisposers.set(channelId, disposer);
			});
		}
	}

	@action
	async fetchInitialMessages(
		channelId: number,
		query: RESTGetAPIMessageListQuery = {},
	) {
		if (this.activeRequests.has(channelId.toString())) return;

		this.activeRequests.add(channelId.toString());
		this.isLoadingHistory = true;

		try {
			const defaultQuery: RESTGetAPIMessageListQuery = { limit: 50, ...query };
			const newMessages = await apiMethods.listMessages(
				channelId,
				defaultQuery,
			);

			const transformed = newMessages.map(transformToMessage);

			runInAction(() => {
				const existing =
					this.messagesByChannelId.get(channelId) || observable.array([]);

				let updated = [...transformed, ...existing];
				const unique = new Map<number, APIMessage>();
				updated.forEach((msg) => unique.set(msg.id, msg));
				updated = Array.from(unique.values()).sort(
					(a, b) => a.created_at - b.created_at,
				);

				this.messagesByChannelId.set(channelId, observable.array(updated));
				this.hasMoreMessagesByChannelId.set(
					channelId,
					newMessages.length >= 50,
				);
			});
		} catch (error) {
			Logger.error(`Failed to fetch initial messages: ${error}`);
		} finally {
			runInAction(() => {
				this.activeRequests.delete(channelId.toString());
				this.isLoadingHistory = false;
			});
		}
	}

	@action
	async fetchOlderMessages(channelId: number, beforeTimestamp: number) {
		if (this.activeRequests.has(channelId.toString())) {
			Logger.info(
				`Fetch older messages for channel ${channelId} skipped: already in progress`,
			);
			return;
		}

		this.activeRequests.add(channelId.toString());
		this.isLoadingHistory = true;

		try {
			Logger.info(
				`Fetching older messages with before timestamp=${beforeTimestamp}`,
			);
			const newMessages = await apiMethods.listMessages(channelId, {
				limit: 100,
				before: beforeTimestamp,
			});

			if (newMessages.length === 0) {
				runInAction(() => {
					this.hasMoreMessagesByChannelId.set(channelId, false);
				});
				return;
			}

			const transformed = newMessages.map(transformToMessage);

			runInAction(() => {
				Logger.info(
					`Fetched ${newMessages.length} older messages for channel ${channelId}`,
				);
				const existingMessages =
					this.messagesByChannelId.get(channelId) || observable.array([]);

				const existingIds = new Set(existingMessages.map((msg) => msg.id));
				const uniqueNewMessages = transformed.filter(
					(msg) => !existingIds.has(msg.id),
				);

				if (uniqueNewMessages.length > 0) {
					const merged = [...existingMessages, ...uniqueNewMessages];
					const sorted = merged.sort((a, b) => a.created_at - b.created_at);
					this.messagesByChannelId.set(channelId, observable.array(sorted));
				}

				this.hasMoreMessagesByChannelId.set(
					channelId,
					newMessages.length >= 100,
				);
			});
		} catch (error) {
			Logger.error(
				`Failed to fetch older messages for channel ${channelId}: ${error}`,
			);
		} finally {
			runInAction(() => {
				this.activeRequests.delete(channelId.toString());
				this.isLoadingHistory = false;
			});
		}
	}

	@action
	async initializeStore() {
		if (this.isWsInitialized) return;

		try {
			this.setIsLoading(true);
			Logger.info("Starting store initialization...");

			this.loadAppearanceSettings();

			await this.initializeWebSocket();
			Logger.info("WebSocket initialized successfully");

			await this.fetchCurrentUser();
			Logger.info("Current user fetched successfully");

			await this.fetchChannelsFromAPI();
			Logger.info("Channels fetched successfully");

			await this.initializeFromUrl();
		} catch (error) {
			Logger.error(`Initialization failed: ${error}`);
			this.connectionError = "Initialization error";
		} finally {
			this.setIsLoading(false);
		}
	}

	@action
	loadAppearanceSettings() {
		try {
			const saved = localStorage.getItem("appearanceSettings");
			if (saved) {
				const parsed = JSON.parse(saved);
				this.appearanceSettings = { ...this.appearanceSettings, ...parsed };
			}
			this.applyAppearanceSettings();
		} catch (error) {
			Logger.error(`Failed to load appearance settings: ${error}`);
		}
	}

	@action
	saveAppearanceSettings() {
		try {
			localStorage.setItem(
				"appearanceSettings",
				JSON.stringify(this.appearanceSettings),
			);
		} catch (error) {
			Logger.error(`Failed to save appearance settings: ${error}`);
		}
	}

	@action
	addNewChannel(channel: APIChannel) {
		const cachedChannel = mapApiChannelToCached(channel);
		if (!this.channels.some((c) => c.id === cachedChannel.id)) {
			this.channels.unshift(cachedChannel);
		}
	}

	@action
	resetStore() {
		Logger.info("Resetting app store state...");

		this.messagesByChannelId.clear();
		this.hasMoreMessagesByChannelId.clear();
		this.isInitialLoad.clear();
		this.channels.clear();
		this.users.clear();
		this.activeRequests.clear();
		this.currentChannelId = null;
		this.isLoading = false;
		this.isSendingMessage = false;
		this.connectionError = null;
		this.isWsInitialized = false;
		this.isLoadingHistory = false;
		this.channelDisposers.clear();
		this.isCurrentChannelScrolledToBottom = true;
		this.unreadCount.clear();
		this.channelParticipantsCount.clear();
		this.userStatuses.clear();

		if (this.wsClient) {
			Logger.info("Closing WebSocket connection...");
			this.wsClient.disconnect();
			this.wsClient = null;
		}

		Logger.info("App store reset successfully");
	}

	playSendMessageSound() {
		const audio = new Audio("/sounds/fchat_sfx.mp3");
		audio.play().catch(console.error);
	}

	fetchCurrentUser = apiService.fetchCurrentUser;
	fetchChannelsFromAPI = apiService.fetchChannelsFromAPI;
	sendMessage = apiService.sendMessage;
	retryMessage = apiService.retryMessage;

	clearAuthAndRedirect = wsService.clearAuthAndRedirect;
	initializeWebSocket = wsService.initializeWebSocket;
	handleHistorySync = wsService.handleHistorySync;
	setupWebSocketHandlers = wsService.setupWebSocketHandlers;
}
