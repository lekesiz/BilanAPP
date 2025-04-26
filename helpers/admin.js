const eq = (a, b) => {
  return a === b;
};

const formatDate = (date, format = 'DD.MM.YYYY HH:mm') => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('HH', hours)
    .replace('mm', minutes);
};

const formatNumber = (number, decimals = 0) => {
  return Number(number).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatMoney = (amount, currency = '₺') => {
  return `${currency}${formatNumber(amount, 2)}`;
};

const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

const statusBadgeClass = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
      return 'badge-success';
    case 'pending':
    case 'warning':
      return 'badge-warning';
    case 'inactive':
    case 'error':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const statusText = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Pasif';
    case 'pending':
      return 'Beklemede';
    case 'success':
      return 'Başarılı';
    case 'error':
      return 'Hata';
    case 'warning':
      return 'Uyarı';
    default:
      return status;
  }
};

const userTypeText = (type) => {
  switch (type.toLowerCase()) {
    case 'admin':
      return 'Yönetici';
    case 'user':
      return 'Kullanıcı';
    case 'editor':
      return 'Editör';
    default:
      return type;
  }
};

const userTypeBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case 'admin':
      return 'badge-danger';
    case 'editor':
      return 'badge-warning';
    case 'user':
      return 'badge-info';
    default:
      return 'badge-secondary';
  }
};

module.exports = {
  eq,
  formatDate,
  formatNumber,
  formatMoney,
  truncate,
  statusBadgeClass,
  statusText,
  userTypeText,
  userTypeBadgeClass
}; 