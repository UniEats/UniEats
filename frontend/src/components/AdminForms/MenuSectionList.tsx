import { useState } from "react";
import styles from "./AdminForms.module.css";
import { useMenuSectionList, useUpdateMenuSection, useDeleteMenuSection } from "@/services/MenuSectionServices";
import { MenuSectionFormValues } from "@/models/MenuSection";

export const MenuSectionList = () => {
  const { data: sections, isLoading, error } = useMenuSectionList();
  const update = useUpdateMenuSection();
  const del = useDeleteMenuSection();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className={styles.errorText}>Failed to load menu sections</p>;
  if (!sections || sections.length === 0) return <p>Menu sections are empty</p>;

  return (
    <div className={styles.optionsGrid}>
      {sections.map((s) => (
        <div key={s.id} className={styles.optionRow} style={{ justifyContent: "space-between" }}>
          {editingId === s.id ? (
            <>
              <input value={label} onChange={(e) => setLabel(e.target.value)} />
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
              <button className={styles.submitButton} onClick={() => { update.mutate({ id: s.id, values: { label, description } as MenuSectionFormValues }); setEditingId(null); }}>Update</button>
              <button className={styles.cancelButton} onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span style={{ flex: 1 }}>{s.label}</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className={styles.submitButton} onClick={() => { setEditingId(s.id); setLabel(s.label); setDescription(s.description); }}>Update</button>
                <button className={styles.cancelButton} onClick={() => del.mutate(s.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
