import CreateIcon from "@/assets/icons/left-bar/navigation/create-button.svg?react";
import { CreateButtonProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import * as styles from "./CreateButton.module.scss";

const CreateButton = ({ onClick }: CreateButtonProps) => {
	return (
		<button
			className={styles.createButton}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			aria-label="Create new channel or group"
		>
			<CreateIcon className={styles.plusIcon} />
		</button>
	);
};

export default memo(CreateButton);
