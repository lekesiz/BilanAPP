const activityTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'login':
      return 'bg-blue-500';
    case 'document':
      return 'bg-green-500';
    case 'credit':
      return 'bg-yellow-500';
    case 'profile':
      return 'bg-purple-500';
    case 'subscription':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

const activityTypeIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'login':
      return 'fa-sign-in-alt';
    case 'document':
      return 'fa-file-alt';
    case 'credit':
      return 'fa-coins';
    case 'profile':
      return 'fa-user-edit';
    case 'subscription':
      return 'fa-box';
    default:
      return 'fa-clock';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const json = (data) => {
  return JSON.stringify(data);
};

module.exports = {
  activityTypeColor,
  activityTypeIcon,
  formatDate,
  json
}; 