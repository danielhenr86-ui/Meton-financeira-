import React, { useEffect, useState } from "react";

const DARK = "#14532d";
const LIGHT = "#86efac";
const NUDE = "#F6F0E8";
const DISMISS_KEY = "meton::installDismissed";

/**
 * Banner de instalação do app (PWA).
 * - Android/Chrome: usa o evento beforeinstallprompt (botão "Instalar").
 * - iOS/Safari: mostra instruções (a Apple não permite instalação programática).
 * Não aparece se já estiver rodando instalado, ou se o usuário dispensou.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // já está instalado? não mostra nada
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const ua = window.navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    if (ios && isSafari) {
      setIsIOS(true);
      const t = setTimeout(() => setShow(true), 2500); // deixa a tela carregar antes
      return () => clearTimeout(t);
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) {}
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{ background: "white", borderColor: "#e7e5e4" }}
      className="fixed bottom-20 left-3 right-3 z-[80] max-w-lg mx-auto rounded-2xl border shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
        <img src="/pwa-192x192.png" alt="Meton" className="w-11 h-11 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm" style={{ color: DARK }}>
            Instalar o Meton no seu celular
          </div>
          {isIOS ? (
            <p className="text-xs text-stone-600 mt-1 leading-snug">
              Toque em <b>Compartilhar</b> (o quadradinho com a seta ↑ na barra do Safari) e depois em{" "}
              <b>“Adicionar à Tela de Início”</b>.
            </p>
          ) : (
            <p className="text-xs text-stone-600 mt-1 leading-snug">
              Tenha o Meton como um aplicativo: abre em tela cheia e funciona até sem internet.
            </p>
          )}

          <div className="flex gap-2 mt-3">
            {!isIOS && (
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold"
                style={{ background: DARK }}
              >
                Instalar
              </button>
            )}
            <button onClick={dismiss} className="px-3 py-2 rounded-xl text-xs font-bold text-stone-500">
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
