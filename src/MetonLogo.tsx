/**
 * MetonLogo.jsx — identidade MetOn v1.0
 *
 * <MetonMark />  símbolo (anel + ponto de sinal). Substitui o ícone genérico.
 *                Usa currentColor por padrão: herda a cor de onde for colocado,
 *                então funciona igual em fundo claro e escuro.
 *
 * <MetonWord />  o nome escrito: "Met" herda a cor do texto ao redor,
 *                "On" recebe a cor de destaque via prop `accent`.
 *
 * Regra de contraste (do manual): em fundo claro, use o verde profundo
 * (#07703F) para o "On" em tamanho pequeno. O verde sinal (#12B76A) é para
 * blocos, ícones e fundos escuros.
 */

import React from "react";

export const SIGNAL = "#12B76A";       // verde sinal
export const SIGNAL_DEEP = "#07703F";  // verde profundo (texto pequeno em fundo claro)

export function MetonMark({ size = 20, style, className, title = "MetOn" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={className}
      style={{ color: "currentColor", display: "block", ...style }}
    >
      <circle
        cx="50" cy="50" r="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
      />
      <circle cx="50" cy="50" r="13" fill="currentColor" />
    </svg>
  );
}

export function MetonWord({ accent = SIGNAL_DEEP, style, className }) {
  return (
    <span className={className} style={style}>
      Met<span style={{ color: accent }}>On</span>
    </span>
  );
}

export default MetonMark;
