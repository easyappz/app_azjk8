export function formatCurrency(value) {
  const number = Number(value || 0);
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  } catch (_) {
    return `${number} ₽`;
  }
}

export function getErrorMessage(err) {
  if (!err) return 'Неизвестная ошибка';
  const data = err.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    if (data.detail) return String(data.detail);
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      if (Array.isArray(val)) return val.join(', ');
      return String(val);
    }
  }
  if (err.message) return err.message;
  return 'Произошла ошибка';
}
