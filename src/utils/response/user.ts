export const parseUserProfileResponse = (userData?: any) => {
  return {
    _id: userData._id,
    username: userData.username,
    profileImage: userData.profileImage,
    leftTasks: userData.pendingTasksCount,
    doneTasks: userData.completedTasksCount,
  };
};
