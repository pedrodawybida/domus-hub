export const maskPhone = (value: string) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export const maskCurrency = (value: string | number) => {
  if (value === undefined || value === null) return "";
  const v = String(value).replace(/\D/g, "");
  if (!v) return "";
  const options = { minimumFractionDigits: 2 };
  const result = new Intl.NumberFormat("pt-BR", options).format(parseFloat(v) / 100);
  return `R$ ${result}`;
};

export const unmaskCurrency = (value: string) => {
  if (!value) return 0;
  return Number(value.replace(/\D/g, "")) / 100;
};
