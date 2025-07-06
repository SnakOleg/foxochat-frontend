import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import "./style.scss";

import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";
import Settings from "@components/Settings/Settings";

import appStore from "@store/app";
import { useAuthStore } from "@store/authenticationStore";

function useAuthRedirect(redirectTo = "/auth/login") {
	const authStore = useAuthStore();
	const [authorized, setAuthorized] = useState<boolean | null>(null);

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			window.location.href = redirectTo;
		} else {
			setAuthorized(true);
		}
	}, [authStore.isAuthenticated, redirectTo]);

	return authorized;
}

const HomeComponent = () => {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");
	const [activeTab, setActiveTab] = useState<"chats" | "settings">("chats");
	const [selectedSection, setSelectedSection] = useState("profile");

	const authorized = useAuthRedirect();

	if (authorized === null) return null;

	const getChannelIdFromHash = () => {
		const hash = window.location.hash;
		const match = hash.match(/#(\d+)/);
		return match ? Number(match[1]) : null;
	};

	useEffect(() => {
		const channelId = getChannelIdFromHash();

		if (channelId) {
			const channelExists = appStore.channels.some((c) => c.id === channelId);

			if (channelExists) {
				if (appStore.currentChannelId !== channelId) {
					void appStore.setCurrentChannel(channelId);
				}
			} else {
				const currentChannelId = appStore.currentChannelId;
				if (currentChannelId) {
					window.history.replaceState(
						null,
						"",
						`/channels/#${currentChannelId}`,
					);
				} else {
					window.location.href = "/channels";
				}
			}
		} else {
			void appStore.setCurrentChannel(null);
		}
	}, [appStore.channels.length]);

	useEffect(() => {
		const handleHashChange = () => {
			const channelId = getChannelIdFromHash();
			if (channelId && appStore.channels.some((c) => c.id === channelId)) {
				void appStore.setCurrentChannel(channelId);
			} else if (channelId) {
				const currentChannelId = appStore.currentChannelId;
				if (currentChannelId) {
					window.history.replaceState(
						null,
						"",
						`/channels/#${currentChannelId}`,
					);
				} else {
					window.location.href = "/channels";
				}
			} else {
				void appStore.setCurrentChannel(null);
			}
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, [appStore.channels]);

	const { channels, currentUserId, currentChannelId } = appStore;
	const currentUser = appStore.users.find((u) => u.id === currentUserId);
	if (!currentUser) return null;

	const selectedChat = useMemo(
		() => channels.find((c) => c.id === currentChannelId) ?? null,
		[channels, currentChannelId],
	);

	const debounce = <T extends unknown[]>(
		fn: (...args: T) => void,
		ms: number,
	) => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const debounced = (...args: T) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				fn(...args);
			}, ms);
		};
		debounced.cancel = () => {
			clearTimeout(timeoutId);
		};
		return debounced;
	};

	const handleResize = useCallback(
		debounce(() => {
			const newIsMobile = window.innerWidth < 768;
			setIsMobile(newIsMobile);
			if (newIsMobile) setMobileView("list");
		}, 100),
		[],
	);

	useEffect(() => {
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			handleResize.cancel();
		};
	}, [handleResize]);

	const handleBackToList = useCallback(() => {
		setChatTransition("slide-out");
		requestAnimationFrame(() => {
			setTimeout(async () => {
				await appStore.setCurrentChannel(null);
				setMobileView("list");
				setChatTransition("");
			}, 300);
		});
	}, []);

	if (isMobile) {
		return (
			<div className="home-container mobile">
				<div className="sidebar-wrapper visible">
					<Sidebar
						currentUser={currentUser}
						isMobile
						setMobileView={setMobileView}
						setChatTransition={setChatTransition}
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				</div>
				{mobileView === "chat" && selectedChat ? (
					<div className={`chat-container ${chatTransition} visible`}>
						<ChatWindow
							channel={selectedChat}
							currentUserId={currentUserId ?? -1}
							onBack={handleBackToList}
							isMobile
						/>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="home-container">
			<Sidebar
				currentUser={currentUser}
				isMobile={false}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				selectedSection={selectedSection}
				onSelectSection={setSelectedSection}
			/>
			<div className="chat-container">
				{activeTab === "settings" ? (
					<Settings 
						currentUser={currentUser} 
						selectedSection={selectedSection}
						onSelectSection={setSelectedSection}
					/>
				) : selectedChat ? (
					<ChatWindow
						channel={selectedChat}
						currentUserId={currentUserId ?? -1}
						isMobile={false}
					/>
				) : (
					<EmptyState selectedChat={null} />
				)}
			</div>
		</div>
	);
};

export const Home = observer(HomeComponent);
