import { memo } from "preact/compat";
import * as styles from "./DefaultAvatar.module.scss";
import { classNames, timestampToHSV } from "@utils/functions";
import { DefaultAvatarProps } from "@interfaces/interfaces";

const DefaultAvatar = ({ createdAt, username = "", size = "medium", square = false }: DefaultAvatarProps) => {
    const initial = username.charAt(0).toUpperCase();
    const { background } = timestampToHSV(createdAt);

    return (
        <div
            className={classNames(
                styles.defaultAvatar,
                styles[size],
                square && styles.square,
            )}
            style={{ background }}
        >
            {initial}
        </div>
    );
};

export default memo(DefaultAvatar);
