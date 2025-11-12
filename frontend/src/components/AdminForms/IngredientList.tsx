import { useState } from "react";
import styles from "./AdminForms.module.css";
import { useIngredientList, useUpdateIngredient, useDeleteIngredient } from "@/services/IngredientServices";

export const IngredientList = () => {
  const { data: items, isLoading, error } = useIngredientList();
  const update = useUpdateIngredient();
  const del = useDeleteIngredient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className={styles.errorText}>Failed to load ingredients</p>;
  if (!items || items.length === 0) return <p>Ingredients are empty</p>;

  return (
    <div className={styles.optionsGrid}>
      {items.map((i) => (
        <div key={i.id} className={styles.optionRow} style={{ justifyContent: "space-between" }}>
          {editingId === i.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
              <input value={String(stock)} onChange={(e) => setStock(Number.parseInt(e.target.value || "0", 10))} />
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button
                  className={styles.submitButton}
                  onClick={() => {
                    update.mutate({
                      id: i.id,
                      values: {
                        ingredientId: i.id.toString(),
                        name,
                        description,
                      },
                    });
                    setEditingId(null);
                  }}
                >
                  Update
                </button>
                <button className={styles.cancelButton} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <span style={{ flex: 1 }}>{i.name}</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className={styles.submitButton} onClick={() => { setEditingId(i.id); setName(i.name); setDescription(i.description); setStock(i.stock); }}>Update</button>
                <button className={styles.cancelButton} onClick={() => del.mutate(i.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
