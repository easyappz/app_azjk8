import React from 'react';
import { useParams } from 'react-router-dom';

function AdFormPage({ mode = 'create' }) {
  const params = useParams();
  const isEdit = mode === 'edit' || !!params.id;
  return (
    <div data-easytag="id1-src/pages/AdFormPage.jsx">
      <h1>{isEdit ? 'Редактирование объявления' : 'Создание объявления'}</h1>
      <p>Форма будет здесь.</p>
    </div>
  );
}

export default AdFormPage;
