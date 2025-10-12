import { useState } from "react";
import styles from "./AdminForms.module.css";
import { useTagList, useUpdateTag, useDeleteTag } from "@/services/TagServices";
import { TagFormValues } from "@/models/Tag";

export const TagList = () => {
  const { data: tags, isLoading, error } = useTagList();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <p>Loading tags...</p>;
  if (error) return <p className={styles.errorText}>Failed to load tags</p>;

  if (!tags || tags.length === 0) {
    return <p>Tags are empty</p>;
  }

  return (
    <div className={styles.optionsGrid}>
      {actionMessage ? <p className={styles.formMessage}>{actionMessage}</p> : null}
      {actionError ? <p className={styles.errorText}>{actionError}</p> : null}
      {tags.map((t) => (
        <div key={t.id} className={styles.optionRow} style={{ justifyContent: "space-between" }}>
          {editingId === t.id ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={{ flex: 1, marginRight: "0.5rem" }}
              />
              <button
                className={styles.submitButton}
                onClick={() => {
                  setActionMessage(null);
                  setActionError(null);
                  console.debug("Updating tag", { id: t.id, tag: editingValue });
                  updateTag
                    .mutateAsync({ id: t.id, values: { tag: editingValue } as TagFormValues })
                    .then((res) => {
                      console.debug("Update response", res);
                      setActionMessage(`Tag "${editingValue}" updated`);
                    })
                    .catch((err) => {
                      console.error("Update error", err);
                      setActionError(String(err));
                    })
                    .finally(() => setEditingId(null));
                }}
              >
                Update Tag
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setEditingId(null)}
                style={{ marginLeft: "0.5rem" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span style={{ flex: 1 }}>{t.tag}</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.submitButton}
                  onClick={() => {
                    setEditingId(t.id);
                    setEditingValue(t.tag);
                  }}
                >
                  Update Tag
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={async () => {
                    // confirmation and feedback
                    setActionMessage(null);
                    setActionError(null);
                    const ok = window.confirm(`Delete tag "${t.tag}"?`);
                    if (!ok) return;
                    try {
                      console.debug("Deleting tag", { id: t.id, tag: t.tag });
                      setDeletingId(t.id);
                      const res = await deleteTag.mutateAsync(t.id);
                      console.debug("Delete response", res);
                      setActionMessage(`Tag "${t.tag}" deleted`);
                    } catch (err) {
                      console.error("Delete error", err);
                      setActionError(String(err));
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                  disabled={deletingId !== null}
                >
                  {deletingId === t.id ? "Deleting..." : "Delete Tag"}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
