/** @type {import('tailwindcss').Config} */

/* ------------------------------------------------------------------
   Paleta MetOn v1.0

   A escala "green" do Tailwind foi substituida pela rampa da marca.
   Isso e o pulo do gato da migracao: as 48 classes verdes espalhadas
   pelo app (text-green-800, border-green-800, bg-green-950/50 ...)
   passam a usar a cor da marca sem editar uma linha de JSX.

   Ancoras: 500 = verde sinal · 700 = verde profundo · 950 = grafite
   ------------------------------------------------------------------ */
const marca = {
  50:  "#ECFDF3",
  100: "#D1FADF",
  200: "#A6F4C5",
  300: "#6CE9A6",
  400: "#32D583",
  500: "#12B76A",  // verde sinal
  600: "#039855",
  700: "#07703F",  // verde profundo (texto pequeno em fundo claro)
  800: "#05603A",
  900: "#0B3D26",
  950: "#0E1B17",  // grafite
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green: marca,
        meton: marca,
        nevoa: "#F1F4F2",
        linha: "#D8E0DB",
        ardosia: "#5A6B63",
      },
    },
  },
  plugins: [],
};
