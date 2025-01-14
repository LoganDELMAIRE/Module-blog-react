const canEditUser = (currentUser, targetUser) => {
  
  if (currentUser.role === 'admin') return true;

  
  if (currentUser.role === 'moderator') {
    if (targetUser.role === 'admin' || targetUser.role === 'moderator') {
      return currentUser._id.toString() === targetUser._id.toString();
    }
    return true;
  }

  
  return currentUser._id.toString() === targetUser._id.toString();
};

module.exports = { canEditUser }; 