// "270620261530" -> "27/06/2026 15:30"
export function mascararDataHora(texto: string): string {
  const n = texto.replace(/\D/g, "").slice(0, 12);
  let r = n.slice(0, 2);
  if (n.length > 2) r += "/" + n.slice(2, 4);
  if (n.length > 4) r += "/" + n.slice(4, 8);
  if (n.length > 8) r += " " + n.slice(8, 10);
  if (n.length > 10) r += ":" + n.slice(10, 12);
  return r;
}

// "27/06/2026 15:30" -> "2026-06-27 15:30:00" (ou null se a data não existir)
export function dataHoraParaApi(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(texto);
  if (!m) return null;

  const [, dia, mes, ano, hora, min] = m;
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min));
  const valida =
    d.getFullYear() === Number(ano) &&
    d.getMonth() === Number(mes) - 1 &&
    d.getDate() === Number(dia) &&
    d.getHours() === Number(hora) &&
    d.getMinutes() === Number(min);

  return valida ? `${ano}-${mes}-${dia} ${hora}:${min}:00` : null;
}