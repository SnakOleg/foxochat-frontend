import { useState } from "preact/hooks";
import { Tooltip } from "@/components/Chat/Tooltip/Tooltip";

// @ts-ignore
declare const __GIT_BRANCH__: string;
// @ts-ignore
declare const __GIT_REVISION__: string;
// @ts-ignore
declare const __GIT_COMMIT_COUNT__: string;
// @ts-ignore
declare const __APP_VERSION__: string;

const version = `FoxoChat ${__GIT_BRANCH__ === "production" ? "Stable" : "Beta"} v${__APP_VERSION__} (${__GIT_COMMIT_COUNT__}, ${__GIT_REVISION__})`;

export default function VersionInfo() {
	const [showTooltip, setShowTooltip] = useState(false);
	const handleCopy = () => {
		void navigator.clipboard.writeText(version);
		setShowTooltip(true);
		setTimeout(() => setShowTooltip(false), 1200);
	};

	const handleMouseDown = (e: MouseEvent) => {
		e.preventDefault();
	};

	return (
		<Tooltip text="Copied!" position="top" show={showTooltip}>
			<div
				style={{
					userSelect: "none",
					textAlign: "center",
					color: "rgb(var(--primary-color-rgb), .25",
					fontSize: 10,
					fontWeight: 400,
					margin: "auto",
					cursor: "pointer",
				}}
				onClick={handleCopy}
				onMouseDown={handleMouseDown}
				title="Click to copy version"
			>
				{version}
			</div>
		</Tooltip>
	);
}
