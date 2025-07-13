import * as styles from "./Page.module.scss";
import { classNames } from "@utils/functions";
import type { PageProps } from "@interfaces/interfaces";

export const Page = ({ children, center }: PageProps) => {
	return (
		<div className={classNames(styles.page, center && styles.centered)}>
			{children}
		</div>
	);
}; 