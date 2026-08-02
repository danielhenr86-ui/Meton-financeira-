import React from "react";
import ReactDOM from "react-dom/client";
import MetonFinanceira from "./MetonFinanceira.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import "./index.css";

/* ------------------------------------------------------------------
   Shim de armazenamento para a versão publicada (fora do Claude).
   O app usa window.storage (API do artifact). Quando ela não existe,
   substituímos por uma implementação equivalente sobre localStorage,
   para que os dados persistam de verdade no navegador do usuário.
   ------------------------------------------------------------------ */
if (typeof window !== "undefined" && !window.storage) {
  const PFX = "meton::";
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(PFX + key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(PFX + key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(PFX + key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PFX + prefix)) keys.push(k.slice(PFX.length));
      }
      return { keys, prefix };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MetonFinanceira />
    <InstallPrompt />
  </React.StrictMode>
);
