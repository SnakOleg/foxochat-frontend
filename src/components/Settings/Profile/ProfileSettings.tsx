import { useState, useEffect, useRef } from "preact/hooks";
import { apiMethods } from "@services/API/apiMethods";
import { config } from "@lib/config/endpoints";
import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import * as styles from "./ProfileSettings.module.scss";
import editIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import { ProfileSettingsProps, EditableFieldProps } from "@interfaces/interfaces";
import appStore from "@store/app";

function ProfileEditableField({ label, value, field, loading, onSave }: EditableFieldProps) {
    const [edit, setEdit] = useState(false);
    const [fieldValue, setFieldValue] = useState(value ?? "");
    const [localLoading, setLocalLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (edit && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [edit]);

    const handleBlur = async () => {
        if (fieldValue !== value) {
            setLocalLoading(true);
            await onSave(field, fieldValue);
            setLocalLoading(false);
        }
        setEdit(false);
    };

    const handleKeyDown = async (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await handleBlur();
        }
        if (e.key === "Escape") {
            setEdit(false);
            setFieldValue(value ?? "");
        }
    };

    useEffect(() => {
        if (!edit) return;

        const handleGlobalClick = async (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (fieldValue !== value) {
                    setLocalLoading(true);
                    await onSave(field, fieldValue);
                    setLocalLoading(false);
                }
                setEdit(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleGlobalClick);
        }, 10);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [edit, fieldValue, value, field, onSave]);

    return (
        <div
            ref={containerRef}
            className={styles.profileInfoRow}
            style={{ userSelect: edit ? "auto" : "none" }}
            onClick={() => !edit && setEdit(true)}
        >
            <span className={styles.profileInfoLabel}>{label}</span>
            <span className={styles.profileInfoValue}>
        {edit ? (
            <input
                ref={inputRef}
                value={fieldValue}
                onInput={e => setFieldValue((e.target as HTMLInputElement).value)}
                disabled={loading || localLoading}
                className={styles.profileFieldInput}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        ) : (
            <>
                {field === "username" ? `@${value}` : value}
                <span className={styles.editIcon}>
              <img src={editIcon} alt="Edit"/>
            </span>
            </>
        )}
      </span>
        </div>
    );
}

export default function ProfileSettings({ currentUser }: ProfileSettingsProps) {
    const [user, setUser] = useState(currentUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSave = async (field: string, value: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            let body: any = {};
            if (field === "bio") {
                body.bio = value;
            } else if (field === "display_name") {
                body.display_name = value;
            } else if (field === "username") {
                body.username = value;
            } else if (field === "email") {
                body.email = value;
            }
            await apiMethods.editUser(body);
            setUser((prev) => ({ ...prev, ...body }));
            setSuccess("Saved!");
        } catch (e: any) {
            setError(e.message || "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setTimeout(() => {
            appStore.resetStore();
            localStorage.removeItem("authToken");
            window.location.href = "/login";
        }, 50);
    };

    const handleDeleteAccount = async () => {
        const password = window.prompt("Enter your password to confirm account deletion:");
        if (!password) return;
        
        setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                await apiMethods.deleteUser({ password });
                appStore.resetStore();
                localStorage.removeItem("authToken");
                window.location.href = "/login";
            } catch (e: any) {
                setError(e.message || "Failed to delete account");
            } finally {
                setLoading(false);
            }
        }, 50);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className={styles.profileSectionTitle}>Profile</div>
            <div className={styles.profileCard}>
                {user.avatar?.uuid ? (
                    <img src={`${config.cdnBaseUrl}${user.avatar.uuid}`} alt="Avatar" className={styles.profileAvatar}/>
                ) : (
                    <DefaultAvatar createdAt={user.created_at} username={user.display_name || user.username}
                                   size="large"/>
                )}
                <div className={styles.profileInfoBlock}>
                    <ProfileEditableField
                        label="Display name"
                        value={user.display_name || ""}
                        field="display_name"
                        loading={loading}
                        onSave={handleSave}
                    />
                    <div className={styles.profileInfoDivider}/>
                    <ProfileEditableField
                        label="Bio"
                        value={(user as any)?.bio ?? ""}
                        field="bio"
                        loading={loading}
                        onSave={handleSave}
                    />
                </div>
            </div>

            <div className={styles.profileSectionTitle}>Data</div>
            <div className={styles.profileDataBlock}>
                <ProfileEditableField
                    label="Username"
                    value={user.username}
                    field="username"
                    loading={loading}
                    onSave={handleSave}
                />
                <div className={styles.profileInfoDivider}/>
                <ProfileEditableField
                    label="Email"
                    value={user.email || ""}
                    field="email"
                    loading={loading}
                    onSave={handleSave}
                />
            </div>

            <div className={styles.profileSectionTitle}>Actions</div>
            <div className={styles.profileActionsBlock}>
                <button className={styles.profileActionLogout} onClick={handleLogout}>Log out</button>
                <div className={styles.profileInfoDivider}/>
                <button className={styles.profileActionDelete} onClick={handleDeleteAccount}>Delete account</button>
            </div>

            {error && <div className={styles.profileError}>{error}</div>}
            {success && <div className={styles.profileSuccess}>{success}</div>}
        </>
    );
} 
