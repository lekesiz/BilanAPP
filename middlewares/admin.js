const setActiveMenu = (req, res, next) => {
  const path = req.path;
  
  if (path === '/admin' || path === '/admin/dashboard') {
    res.locals.active = 'dashboard';
  } else if (path.startsWith('/admin/users')) {
    res.locals.active = 'users';
  } else if (path.startsWith('/admin/packages')) {
    res.locals.active = 'packages';
  } else if (path.startsWith('/admin/settings/general')) {
    res.locals.active = 'settings-general';
  } else if (path.startsWith('/admin/settings/email-templates')) {
    res.locals.active = 'settings-email';
  } else if (path.startsWith('/admin/settings/system')) {
    res.locals.active = 'settings-system';
  }

  next();
};

const setAdminData = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    res.locals.user = {
      id: req.user.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      avatar: req.user.avatar || `https://ui-avatars.com/api/?name=${req.user.firstName}+${req.user.lastName}&background=random`
    };
  }

  next();
};

module.exports = {
  setActiveMenu,
  setAdminData
}; 