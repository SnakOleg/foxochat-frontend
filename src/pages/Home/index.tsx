import { useEffect, useState, useCallback, useRef } from "preact/hooks";
import { useLocation } from "preact-iso";
import { observer } from "mobx-react-lite";

import "./style.css";

import Loading from "@components/LoadingApp/LoadingApp";
import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";

import { apiMethods, getAuthToken } from "@services/API/apiMethods";
import chatStore from "@store/chat/index";
import { Channel } from "@interfaces/interfaces";
import { Logger } from "@utils/logger";
import { initWebSocket } from "../../gateway/initWebSocket";

export const Home = observer(() => {
	const location = useLocation();
	const token = getAuthToken();
	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const wsClientRef = useRef<ReturnType<typeof initWebSocket> | null>(null);
	const isMounted = useRef(true);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");

	const { channels, currentUserId, currentChannelId, isLoading } = chatStore;
	const selectedChat = channels.find(c => c.id === currentChannelId) ?? null;

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth < 768) setMobileView("list");
		};
		window.addEventListener("resize", handleResize);
		return () => { window.removeEventListener("resize", handleResize); };
	}, []);

	useEffect(() => {
		if (!token) {
			localStorage.removeItem("authToken");
			location.route("/auth/login");
			return;
		}

		void (async () => {
			try {
				if (!chatStore.channels.length) {
					await chatStore.fetchChannelsFromAPI();
				}
			} catch (error) {
				Logger.error(`Channels fetch failed: ${error}`);
				localStorage.removeItem("authToken");
				location.route("/auth/login");
			}
		})();
	}, [token, location]);

	useEffect(() => {
		return () => {
			void chatStore.setCurrentChannel(null);
			wsClientRef.current?.close();
		};
	}, []);

	const setupWebSocket = useCallback(
		(token: string | null) => {
			wsClientRef.current?.close();
			const client = initWebSocket(token, () => {
				localStorage.removeItem("authToken");
				location.route("/auth/login");
			});
			client.connect();
			wsClientRef.current = client;
			return client;
		},
		[location],
	);

	const initApp = useCallback(async () => {
		if (!token) {
			localStorage.removeItem("authToken");
			location.route("/auth/login");
			return;
		}
		try {
			Logger.debug("Initializing application...");
			const user = await apiMethods.getCurrentUser();
			chatStore.setCurrentUser(user.id);
			await chatStore.fetchChannelsFromAPI();
			setupWebSocket(token);
			setInitialLoadDone(true);
		} catch (error) {
			Logger.error(`Application initialization failed: ${error}`);
			localStorage.removeItem("authToken");
			location.route("/auth/login");
		}
	}, [token, setupWebSocket, location]);

	useEffect(() => {
		isMounted.current = true;
		initApp().catch((e: unknown) => {
			Logger.error(`Error while initializing application: ${e}`); });
		return () => {
			isMounted.current = false;
		};
	}, [initApp]);

	const handleSelectChat = useCallback((chat: Channel) => {
		void chatStore.setCurrentChannel(chat.id);
		if (isMobile) {
			setMobileView("chat");
			setChatTransition("slide-in");
		}
	}, [isMobile]);

	const handleBackToList = useCallback(() => {
		setChatTransition("slide-out");
		setTimeout(() => {
			void chatStore.setCurrentChannel(null);
			setMobileView("list");
			setChatTransition("");
		}, 300);
	}, []);

	useEffect(() => {
		if (!chatStore.channels.length) {
			void chatStore.fetchChannelsFromAPI();
		}
		const uniqueIds = new Set(chatStore.channels.map(c => c.id));
		if (uniqueIds.size !== chatStore.channels.length) {
			Logger.error("Duplicate channel IDs detected!");
		}
	}, [token, location]);

	if (isLoading || !initialLoadDone) {
		return <Loading isLoading />;
	}

	if (isMobile) {
		return (
			<div className="home-container mobile">
				<div className="sidebar-wrapper visible">
					<Sidebar
						chats={channels}
						onSelectChat={handleSelectChat}
						currentUser={currentUserId ?? -1}
						isMobile
					/>
				</div>
				{mobileView === "chat" && selectedChat && (
					<div className={`chat-container ${chatTransition} visible`}>
						<ChatWindow
							channel={selectedChat}
							currentUserId={currentUserId ?? -1}
							onBack={handleBackToList}
							isMobile
						/>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={channels}
				onSelectChat={handleSelectChat}
				currentUser={currentUserId ?? -1}
				isMobile={false}
			/>
			<div className="chat-container">
				{selectedChat ? (
					<ChatWindow
						channel={selectedChat}
						currentUserId={currentUserId ?? -1}
						isMobile={false}
					/>
				) : (
					<EmptyState
						chats={channels}
						onSelectChat={handleSelectChat}
						selectedChat={null}
					/>
				)}
			</div>
		</div>
	);
});