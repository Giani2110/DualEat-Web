import React, { useState, useEffect } from "react";
import { axiosInterceptor as axios } from "@/api/interceptor/axios-interceptor";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaLayerGroup } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmModal from "@/components/modal/ConfirmModal";

interface FoodCategory {
  id: number;
  name: string;
  tipo: string;
  description: string | null;
  icon_url: string | null;
}

const categoryTypes = ["Tipos_de_comida", "Estilos_o_dietas", "Origen_y_cultura"];

const typeConfig: Record<string, { label: string; dotColor: string; bg: string; text: string; border: string }> = {
  Tipos_de_comida: {
    label: "Tipo de Comida",
    dotColor: "#f59e0b",
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
  },
  Estilos_o_dietas: {
    label: "Estilo / Dieta",
    dotColor: "#10b981",
    bg: "#ecfdf5",
    text: "#047857",
    border: "#a7f3d0",
  },
  Origen_y_cultura: {
    label: "Origen & Cultura",
    dotColor: "#8b5cf6",
    bg: "#f5f3ff",
    text: "#6d28d9",
    border: "#ddd6fe",
  },
};

// Only treat icon_url as emoji if it actually starts with an emoji character
const isEmoji = (str: string | null): boolean => {
  if (!str) return false;
  const emojiRegex = /^\p{Emoji}/u;
  return emojiRegex.test(str.trim()) && str.trim().length <= 8;
};

const AdminFoodCategories = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<{
    id: number | null;
    name: string;
    tipo: string;
    description: string | null;
    icon_url: string | null;
  }>({
    id: null,
    name: "",
    tipo: categoryTypes[0],
    description: "",
    icon_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    categoryId: number | null;
  }>({ isOpen: false, categoryId: null });

  const API_URL = "/admin/food-categories";

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCategories(response.data.data || []);
    } catch {
      showMsg("Error al cargar las categorías. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 6000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateForm = () => {
    setFormData({ id: null, name: "", tipo: categoryTypes[0], description: "", icon_url: "" });
    setShowDrawer(true);
  };

  const handleOpenEditForm = (cat: FoodCategory) => {
    setFormData({ ...cat });
    setShowDrawer(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.tipo.trim()) {
      showMsg("El nombre y el tipo son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      if (formData.id) {
        const res = await axios.put(`${API_URL}/${formData.id}`, formData);
        setCategories(categories.map((c) => (c.id === formData.id ? res.data : c)));
        showMsg("Categoría actualizada correctamente.");
      } else {
        const res = await axios.post(API_URL, formData);
        setCategories([...categories, res.data]);
        showMsg("Categoría creada exitosamente.");
      }
      setShowDrawer(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al guardar la categoría.";
      showMsg(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmData.categoryId) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${confirmData.categoryId}`);
      setCategories(categories.filter((c) => c.id !== confirmData.categoryId));
      showMsg("Categoría eliminada.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al eliminar la categoría.";
      showMsg(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
      setConfirmData({ isOpen: false, categoryId: null });
    }
  };

  const filtered = categories.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.tipo.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <>
      <style>{`
        .fca * { box-sizing: border-box; }

        .fca-row { transition: background 0.12s; }
        .fca-row:hover { background: #f9f9f9; }
        .fca-row:hover .fca-acts { opacity: 1; transform: translateX(0); }
        .fca-acts {
          opacity: 0; transform: translateX(6px);
          transition: opacity 0.15s, transform 0.15s;
          display: flex; align-items: center; gap: 6px; justify-content: flex-end;
        }

        .fca-search {
          width: 100%; padding: 10px 14px 10px 38px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 14px; background: white; color: #111; outline: none;
          transition: border-color 0.15s;
        }
        .fca-search::placeholder { color: #c4c4c4; }
        .fca-search:focus { border-color: #111; }

        .fca-add {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 17px; background: #111; color: white;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.13s, transform 0.1s; white-space: nowrap;
        }
        .fca-add:hover { background: #2d2d2d; transform: translateY(-1px); }

        .fca-th { font-size: 11px; font-weight: 700; color: #c4c4c4; letter-spacing: 0.08em; text-transform: uppercase; }

        .fca-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f5f5f5; border: 1px solid #ececec;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        .fca-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px 3px 7px; border-radius: 99px;
          font-size: 11px; font-weight: 600; border: 1px solid; white-space: nowrap;
        }
        .fca-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .fca-ebtn, .fca-dbtn {
          width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid;
          background: white; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 11px; transition: all 0.13s;
        }
        .fca-ebtn { border-color: #e5e7eb; color: #888; }
        .fca-ebtn:hover { background: #111; border-color: #111; color: white; }
        .fca-dbtn { border-color: #fecaca; color: #ef4444; }
        .fca-dbtn:hover { background: #ef4444; border-color: #ef4444; color: white; }

        .fca-lbl {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase; color: #aaa; margin-bottom: 6px;
        }
        .fca-inp {
          width: 100%; padding: 10px 13px; border: 1.5px solid #e5e7eb;
          border-radius: 10px; font-size: 14px; color: #111; background: #fafafa;
          outline: none; transition: border-color 0.13s, background 0.13s;
        }
        .fca-inp:focus { border-color: #111; background: white; }
        .fca-inp::placeholder { color: #d1d5db; }

        .fca-save {
          width: 100%; padding: 12px; background: #111; color: white;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.13s;
        }
        .fca-save:hover:not(:disabled) { background: #2d2d2d; }
        .fca-save:disabled { background: #d1d5db; cursor: not-allowed; }

        .fca-cancel {
          width: 100%; padding: 10px; background: transparent;
          border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 13px;
          font-weight: 500; color: #888; cursor: pointer; transition: border-color 0.13s;
        }
        .fca-cancel:hover { border-color: #bbb; }

        .fca-toast {
          position: fixed; bottom: 22px; right: 22px; z-index: 9999;
          padding: 11px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
          box-shadow: 0 6px 20px rgba(0,0,0,0.11);
          display: flex; align-items: center; gap: 8px; max-width: 290px;
        }
        .fca-tok { background: #111; color: white; }
        .fca-terr { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        @keyframes fca-spin { to { transform: rotate(360deg); } }
        .fca-spin {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: fca-spin 0.6s linear infinite;
        }
      `}</style>

      <div className="fca" style={{ minHeight: "100vh", background: "#f9f9f8" }}>

        {/* HEADER */}
        <div style={{
          background: "white", borderBottom: "1px solid #f0f0f0",
          padding: "20px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c4c4c4", marginBottom: 2 }}>
              Administración
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
              Categorías Culinarias
            </h1>
          </div>
          <button className="fca-add" onClick={handleOpenCreateForm}>
            <FaPlus style={{ fontSize: 10 }} /> Nueva categoría
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "22px 28px" }}>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ position: "relative", flex: "1 1 auto", maxWidth: 360 }}>
              <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: 12 }} />
              <input className="fca-search" type="text" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar categoría..." />
            </div>
            <span style={{ fontSize: 12, color: "#c4c4c4", marginLeft: "auto" }}>
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {/* Table */}
          <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: 14, overflow: "hidden" }}>

            {/* Head */}
            <div style={{
              display: "grid", gridTemplateColumns: "52px 1fr 155px minmax(0,1.4fr) 72px",
              padding: "10px 20px", background: "#fafafa", borderBottom: "1px solid #f0f0f0",
            }}>
              {["", "Nombre", "Tipo", "Descripción", ""].map((h, i) => (
                <span key={i} className="fca-th">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <AnimatePresence>
              {filtered.map((cat, idx) => {
                const cfg = typeConfig[cat.tipo] ?? {
                  label: cat.tipo.replace(/_/g, " "),
                  dotColor: "#9ca3af", bg: "#f9fafb", text: "#374151", border: "#e5e7eb",
                };
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: idx * 0.02, duration: 0.16 }}
                    className="fca-row"
                    style={{
                      display: "grid", gridTemplateColumns: "52px 1fr 155px minmax(0,1.4fr) 72px",
                      alignItems: "center", padding: "12px 20px",
                      borderBottom: idx < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}
                  >
                    {/* Icon — fallback to 🍽️ if icon_url is not a real emoji */}
                    <div>
                      <div className="fca-icon">
                        {isEmoji(cat.icon_url) ? cat.icon_url : "🍽️"}
                      </div>
                    </div>

                    {/* Name — only once */}
                    <div style={{ paddingLeft: 2 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>
                        {cat.name}
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="fca-chip" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                        <span className="fca-dot" style={{ background: cfg.dotColor }} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cat.description || "—"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="fca-acts">
                      <button className="fca-ebtn" onClick={() => handleOpenEditForm(cat)} title="Editar"><FaEdit /></button>
                      <button className="fca-dbtn" onClick={() => setConfirmData({ isOpen: true, categoryId: cat.id })} title="Eliminar"><FaTrash /></button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty */}
            {filtered.length === 0 && !loading && (
              <div style={{ padding: "52px 24px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <FaLayerGroup style={{ fontSize: 22, color: "#d1d5db" }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#555", marginBottom: 4 }}>
                  {searchTerm ? "Sin resultados" : "Sin categorías aún"}
                </p>
                <p style={{ fontSize: 13, color: "#bbb", marginBottom: 18 }}>
                  {searchTerm ? "Probá con otro término" : "Creá tu primera categoría para comenzar"}
                </p>
                {searchTerm
                  ? <button className="fca-add" style={{ margin: "0 auto" }} onClick={() => setSearchTerm("")}>Limpiar</button>
                  : <button className="fca-add" style={{ margin: "0 auto" }} onClick={handleOpenCreateForm}><FaPlus style={{ fontSize: 10 }} /> Crear</button>
                }
              </div>
            )}

            {loading && filtered.length === 0 && (
              <div style={{ padding: "44px 24px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 22, height: 22, border: "2px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "fca-spin 0.6s linear infinite" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ isOpen: false, categoryId: null })}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría permanentemente? Esta acción es irreversible."
        type="danger"
        confirmText="Eliminar"
      />

      {/* TOAST */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            className={`fca-toast ${message.includes("Error") ? "fca-terr" : "fca-tok"}`}
          >
            <span>{message.includes("Error") ? "⚠️" : "✓"}</span>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", backdropFilter: "blur(2px)", zIndex: 40 }}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              style={{
                position: "fixed", top: 0, right: 0, height: "100%",
                width: "100%", maxWidth: 420, background: "white",
                boxShadow: "-4px 0 32px rgba(0,0,0,0.08)", zIndex: 50,
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Drawer head */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 2 }}>
                    {formData.id ? "Editar" : "Crear"}
                  </p>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: "#111", margin: 0 }}>
                    {formData.id ? "Modificar categoría" : "Nueva categoría"}
                  </h2>
                </div>
                <button onClick={() => setShowDrawer(false)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "white", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  <FaTimes />
                </button>
              </div>

              {/* Drawer body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Icon preview */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#fafafa", borderRadius: 12, border: "1.5px solid #f0f0f0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "white", border: "1.5px solid #ececec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {isEmoji(formData.icon_url) ? formData.icon_url : "🍽️"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="fca-lbl">Icono (emoji)</label>
                    <input className="fca-inp" type="text" name="icon_url"
                      value={formData.icon_url || ""} onChange={handleInputChange} placeholder="Ej. 🍔" />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="fca-lbl">Nombre</label>
                  <input className="fca-inp" type="text" name="name"
                    value={formData.name} onChange={handleInputChange} placeholder="Ej. Hamburguesas Veganas" />
                </div>

                {/* Type */}
                <div>
                  <label className="fca-lbl">Tipo</label>
                  <div style={{ position: "relative" }}>
                    <select className="fca-inp" name="tipo" value={formData.tipo} onChange={handleInputChange}
                      style={{ appearance: "none", paddingRight: 32, cursor: "pointer" }}>
                      {categoryTypes.map((t) => (
                        <option key={t} value={t}>{typeConfig[t]?.label ?? t.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none", fontSize: 11 }}>▾</span>
                  </div>
                  {formData.tipo && typeConfig[formData.tipo] && (
                    <div style={{ marginTop: 8 }}>
                      <span className="fca-chip" style={{ background: typeConfig[formData.tipo].bg, color: typeConfig[formData.tipo].text, borderColor: typeConfig[formData.tipo].border }}>
                        <span className="fca-dot" style={{ background: typeConfig[formData.tipo].dotColor }} />
                        {typeConfig[formData.tipo].label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="fca-lbl">Descripción <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#d1d5db" }}>— opcional</span></label>
                  <textarea className="fca-inp" name="description"
                    value={formData.description || ""} onChange={handleInputChange}
                    placeholder="Describe esta categoría..." rows={4} style={{ resize: "none" }} />
                </div>
              </div>

              {/* Drawer footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="fca-save" onClick={handleSave} disabled={loading}>
                  {loading ? <div className="fca-spin" /> : (formData.id ? "Guardar cambios" : "Crear categoría")}
                </button>
                <button className="fca-cancel" onClick={() => setShowDrawer(false)}>Cancelar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminFoodCategories;