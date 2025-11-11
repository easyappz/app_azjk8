import React from 'react';
import { useParams } from 'react-router-dom';

function AdDetailPage() {
  const { id } = useParams();
  return (
    <div data-easytag="id1-src/pages/AdDetailPage.jsx">
      <h1>Объявление #{id}</h1>
      <p>Здесь будет информация об объявлении.</p>
    </div>
  );
}

export default AdDetailPage;
