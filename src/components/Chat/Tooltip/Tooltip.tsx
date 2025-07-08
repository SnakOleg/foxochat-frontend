import { TooltipProps } from "@interfaces/interfaces";
import clsx from "clsx";
import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import * as styles from "./Tooltip.module.scss";

const tryPositions: Array<"top" | "bottom" | "left" | "right"> = [
	"top",
	"bottom",
	"right",
	"left",
];

function computeTooltipPosition(
	wrapper: HTMLElement,
	tooltip: HTMLElement,
	position: "top" | "bottom" | "left" | "right" | "auto"
) {
	const spacing = 8;
	const wrapperRect = wrapper.getBoundingClientRect();
	const parentRect = wrapper.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 };
	const relTop = wrapperRect.top - parentRect.top;
	const relLeft = wrapperRect.left - parentRect.left;
	const parentWidth = wrapper.offsetParent ? (wrapper.offsetParent as HTMLElement).offsetWidth : window.innerWidth;
	const parentHeight = wrapper.offsetParent ? (wrapper.offsetParent as HTMLElement).offsetHeight : window.innerHeight;

	let finalPosition: "top" | "bottom" | "left" | "right" = position !== "auto" ? position : (
		tryPositions.find((pos) => {
			switch (pos) {
				case "top": return relTop >= tooltip.offsetHeight + spacing;
				case "bottom": return relTop + wrapperRect.height + tooltip.offsetHeight + spacing <= parentHeight;
				case "left": return relLeft >= tooltip.offsetWidth + spacing;
				case "right": return relLeft + wrapperRect.width + tooltip.offsetWidth + spacing <= parentWidth;
			}
		}) || "top"
	);

	let top = 0, left = 0;
	switch (finalPosition) {
		case "top":
			top = relTop - tooltip.offsetHeight - spacing;
			left = relLeft + wrapperRect.width / 2 - tooltip.offsetWidth / 2;
			break;
		case "bottom":
			top = relTop + wrapperRect.height + spacing;
			left = relLeft + wrapperRect.width / 2 - tooltip.offsetWidth / 2;
			break;
		case "left":
			top = relTop + wrapperRect.height / 2 - tooltip.offsetHeight / 2;
			left = relLeft - tooltip.offsetWidth - spacing;
			break;
		case "right":
			top = relTop + wrapperRect.height / 2 - tooltip.offsetHeight / 2;
			left = relLeft + wrapperRect.width + spacing;
			break;
	}

	return { top, left, finalPosition };
}

export function Tooltip({
	children,
	text,
	className,
	position = "auto",
	show,
}: TooltipProps & { show?: boolean }): JSX.Element {
	const [isMounted, setIsMounted] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ top: 0, left: 0 });
	const [computedPosition, setComputedPosition] = useState<
		"top" | "bottom" | "left" | "right"
	>("top");

	const wrapperRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isMounted || !wrapperRef.current || !tooltipRef.current) return;
		const { top, left, finalPosition } = computeTooltipPosition(
			wrapperRef.current,
			tooltipRef.current,
			position
		);
		setCoords({ top, left });
		setComputedPosition(finalPosition);
	}, [isMounted, position]);

	useEffect(() => {
		if (typeof show === "boolean") {
			if (show) {
				setIsMounted(true);
				requestAnimationFrame(() => setIsVisible(true));
			} else {
				setIsVisible(false);
				setTimeout(() => setIsMounted(false), 200);
			}
		}
	}, [show]);

	const showTooltip = () => {
		if (typeof show === "boolean") return;
		setIsMounted(true);
		requestAnimationFrame(() => {
			setIsVisible(true);
		});
	};

	const hideTooltip = () => {
		if (typeof show === "boolean") return;
		setIsVisible(false);
		setTimeout(() => {
			setIsMounted(false);
		}, 200);
	};

	return (
		<div
			ref={wrapperRef}
			className={clsx(styles.wrapper, className)}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
		>
			{children}
			{isMounted && (
				<div
					ref={tooltipRef}
					className={clsx(
						styles.bubble,
						styles[computedPosition],
						isVisible && styles.visible,
					)}
					style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
				>
					{text}
				</div>
			)}
		</div>
	);
}
