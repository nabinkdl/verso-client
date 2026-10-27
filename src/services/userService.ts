import { AdminUser } from "../types";

export function toggleFollow(
  users: AdminUser[],
  currentUserId: string,
  targetUserId: string,
): AdminUser[] {
  return users.map((u) => {
    if (u.id !== currentUserId) return u;
    const isFollowing = u.following.includes(targetUserId);
    return {
      ...u,
      following: isFollowing
        ? u.following.filter((id) => id !== targetUserId)
        : [...u.following, targetUserId],
    };
  });
}

export function editProfile(
  users: AdminUser[],
  userId: string,
  newName: string,
  newUsername: string,
  avatarUrl?: string,
): AdminUser[] {
  return users.map((u) =>
    u.id !== userId
      ? u
      : {
          ...u,
          name: newName,
          username: newUsername,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
  );
}

export function addUser(
  users: AdminUser[],
  newUser: AdminUser,
): AdminUser[] {
  return [...users, newUser];
}
