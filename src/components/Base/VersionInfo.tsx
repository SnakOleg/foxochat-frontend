import { useEffect, useState } from "preact/hooks";
import { Tooltip } from "@/components/Chat/Tooltip/Tooltip";

const VersionInfo = () => {
	const [appVersion, setAppVersion] = useState("");
	const [buildNumber, setBuildNumber] = useState("");

	useEffect(() => {
		fetch("/version")
			.then((res) => res.text())
			.then((text) => {
				const match = text.match(/^(.*?) \((\d+),/);
				if (match) {
					setAppVersion(match[1] || "");
					setBuildNumber(match[2] || "");
				} else {
					setAppVersion(text);
				}
			})
			.catch(() => setAppVersion(""));
	}, []);

	const [showTooltip, setShowTooltip] = useState(false);
	const handleCopy = () => {
		const text = `FoxoChat Web ${appVersion} (${buildNumber})`;
		navigator.clipboard.writeText(text);
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
				FoxoChat Web {appVersion && `v${appVersion}`}{" "}
				{buildNumber && `(${buildNumber})`}
			</div>
		</Tooltip>
	);
};

export default VersionInfo;
