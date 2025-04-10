import { useEffect, useState, useCallback, useRef } from "preact/hooks";
import { useLocation } from "preact-iso";
import { observer } from "mobx-react";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/LeftBar/Sidebar.tsx";
import ChatWindow from "@components/RightBar/ChatWindow.tsx";
import EmptyState from "@components/RightBar/EmptyState/EmptyState.tsx";
import { apiMethods } from "@services/API/apiMethods.ts";
import { getAuthToken } from "@services/API/apiMethods";
import { chatStore } from "@store/chatStore.ts";
import { Channel } from "@interfaces/interfaces.d";
import { Logger } from "@utils/logger.ts";
import { initWebSocket } from "../../gateway/initWebSocket.ts";

export const Home = observer(() => {
	const location = useLocation();
	const token = getAuthToken();
	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const wsClientRef = useRef<ReturnType<typeof initWebSocket> | null>(null);
	const isMounted = useRef(true);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");
	const { channels: chats, currentUserId, currentChannelId, isLoading } = chatStore;
	const selectedChat = chats.find((c) => c.id === currentChannelId) ?? null;

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
		(async () => {
			try {
				if (!chatStore.channels.length) await chatStore.fetchChannelsFromAPI();
			} catch (error) {
				Logger.error(`Channels fetch failed: ${error}`);
				localStorage.removeItem("authToken");
				location.route("/auth/login");
			}
		})();
	}, [token]);

	useEffect(() => {
		return () => {
			chatStore.setCurrentChannel(null);
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
		initApp().catch((error: unknown) => { Logger.error(`${error}`); });
		return () => {
			isMounted.current = false;
		};
	}, [initApp]);

	const handleSelectChat = useCallback((chat: Channel) => {
		chatStore.setCurrentChannel(chat.id);
		if (isMobile) {
			setMobileView("chat");
			setChatTransition("slide-in");
		}
	}, [isMobile]);

	const handleBackToList = useCallback(() => {
		setChatTransition("slide-out");
		setTimeout(() => {
			chatStore.setCurrentChannel(null);
			setMobileView("list");
			setChatTransition("");
		}, 300);
	}, []);

	if (isLoading || !initialLoadDone) {
		return <Loading isLoading={true} onLoaded={() => {}} />;
	}

	if (isMobile) {
		return (
			<div className="home-container mobile">
				<div className="sidebar-wrapper visible">
					<Sidebar
						chats={chats}
						onSelectChat={handleSelectChat}
						currentUser={currentUserId ?? -1}
						isMobile={true}
					/>
				</div>
				{mobileView === "chat" && selectedChat && (
					<div className={`chat-container ${chatTransition} visible`}>
						<ChatWindow
							channel={selectedChat}
							currentUserId={currentUserId ?? -1}
							onBack={handleBackToList}
							isMobile={true}
						/>
					</div>
				)}
			</div>
		);
	}


	return (
		<div className="home-container">
			<Sidebar
				chats={chats}
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
						chats={chats}
						onSelectChat={handleSelectChat}
						selectedChat={null}
					/>
				)}
			</div>
		</div>
	);
});
