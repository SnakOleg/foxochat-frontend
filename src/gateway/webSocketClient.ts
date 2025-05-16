import { Client, GatewayCloseCodes } from "foxogram.js";
import { Logger, LogLevel } from "@utils/logger";

interface EventMap {
    connected: undefined;
    error: Error;
    close: CloseEvent;
    "MESSAGE_CREATE": { id: number; channel: { id: number }; content: string; created_at: number };
    "MESSAGE_DELETE": { id: number };
}

export class WebSocketClient {
    public readonly client: Client;
    private readonly gatewayUrl: string;
    private readonly listeners = new Map<keyof EventMap,((data: EventMap[keyof EventMap]) => void)[]>();

    constructor(
        private readonly getToken: () => string | null,
        gatewayUrl: string,
        private readonly onClose?: (evt: CloseEvent) => void,
        private readonly onUnauthorized?: () => void,
    ) {
        if (typeof window === "undefined") {
            throw new Error("WebSocketClient can only be used in a browser environment");
        }

        this.gatewayUrl = this.validateGatewayUrl(gatewayUrl);
        this.client = new Client({
            gateway: {
                url: this.gatewayUrl,
                reconnect: true,
                reconnectTimeout: 3000,
            },
        });
        this.setupEventHandlers();
    }

    private validateGatewayUrl(url: string): string {
        if (!url.startsWith("wss://")) {
            throw new Error("Insecure WebSocket protocol (ws://). Only wss:// is allowed");
        }
        return url;
    }

    private setupEventHandlers(): void {
        this.client.on("ready", () => {
            Logger.group("[CONNECTION] WebSocket connected", LogLevel.Info);
            Logger.info("WebSocket connected successfully");
            Logger.groupEnd();
            this.emit("connected", undefined);
        });

        this.client.on("closed", (code: number) => {
            Logger.error(`Connection closed: ${code}`);
            const closeEvent = new CloseEvent("close", { code });
            if (code === GatewayCloseCodes.Unauthorized) {
                Logger.warn("Unauthorized, triggering onUnauthorized");
                this.onUnauthorized?.();
            }
            this.onClose?.(closeEvent);
            this.emit("close", closeEvent);
        });

        this.client.on("socketError", (error: Error) => {
            Logger.error("WebSocket error:", error);
            this.emit("error", error);
        });
    }

    public async connect(): Promise<void> {
        Logger.header("NEW CONNECTION");
        Logger.group(`WebSocket Session — ${this.gatewayUrl}`, LogLevel.Info);
        Logger.info("[WS] Attempting connect");

        const token = this.getToken();
        if (!token) {
            Logger.error("No token provided");
            Logger.groupEnd();
            throw new Error("No token provided");
        }

        const start = performance.now();
        Logger.group(`[FAST CONNECT] ${this.gatewayUrl}`, LogLevel.Info);

        try {
            await this.client.login(token);
            const duration = Math.round(performance.now() - start);
            Logger.groupEnd();
            Logger.group(`[FAST CONNECT] connected in ${duration}ms`, LogLevel.Info);
            Logger.groupEnd();
        } catch (err: unknown) {
            Logger.error("Failed to login:", err);
            Logger.groupEnd();
            this.onUnauthorized?.();
            throw err;
        }
    }

    private emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            for (const listener of eventListeners) {
                listener(data);
            }
        }
    }
}