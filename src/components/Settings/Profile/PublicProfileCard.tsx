import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import * as styles from "./ProfileSettings.module.scss";
import type { PublicProfileCardProps } from "@interfaces/interfaces";

export default function PublicProfileCard({ user }: PublicProfileCardProps) {
  if (!user) return null;
  return (
    <div className={styles.profileCard} style={{ maxWidth: 420, margin: "32px auto" }}>
      {user.avatar?.uuid ? (
        <img
          src={`${config.cdnBaseUrl}${user.avatar.uuid}`}
          alt="Avatar"
          className={styles.profileAvatar}
        />
      ) : (
        <DefaultAvatar
          createdAt={user.created_at}
          username={user.display_name || user.username}
          size="large"
        />
      )}
      <div className={styles.profileInfoBlock}>
        <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 4 }}>{user.display_name || user.username}</div>
        <div style={{ color: "#aaa", fontSize: 16, marginBottom: 4 }}>@{user.username}</div>
        <div style={{ color: "#aaa", fontSize: 15 }}>{user.email}</div>
      </div>
    </div>
  );
} 