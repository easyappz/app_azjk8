import React from 'react';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  return (
    <div data-easytag="id1-src/pages/ProfilePage.jsx">
      <h1>Профиль</h1>
      {user ? (
        <ul>
          <li>ID: {user.id}</li>
          <li>Имя пользователя: {user.username}</li>
        </ul>
      ) : (
        <p>Не авторизован.</p>
      )}
    </div>
  );
}

export default ProfilePage;
