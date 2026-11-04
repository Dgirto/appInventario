// Formato de moneda en soles peruanos
export const soles = (n) =>
  `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Fecha y hora legibles (ej. 04/11/2026, 10:30)
export const fechaHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
    : "-";

// Estado del stock de un producto
export const estadoStock = (stock, umbral = 5) => {
  const s = Number(stock);
  if (s === 0) return { clase: "out", texto: "Agotado" };
  if (s <= umbral) return { clase: "low", texto: "Stock bajo" };
  return { clase: "ok", texto: "Disponible" };
};
