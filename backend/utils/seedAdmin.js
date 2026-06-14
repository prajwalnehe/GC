const User = require('../models/User');
const { ALL_TAB_IDS } = require('../utils/tabs');

const ADMIN_EMAIL = 'growwcodeit@gmail.com';
const ADMIN_PASSWORD = 'Growwcodeit123@';
const ADMIN_NAME = 'Growwcode Admin';

const seedAdminUser = async () => {
  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.name = ADMIN_NAME;
    user.password = ADMIN_PASSWORD;
    user.role = 'Admin';
    user.isActive = true;
    user.allowedTabs = ALL_TAB_IDS;
    await user.save();
    console.log('Admin user credentials synced');
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'Admin',
      allowedTabs: ALL_TAB_IDS,
    });
    console.log('Admin user created');
  }
};

module.exports = { seedAdminUser, ADMIN_EMAIL };
