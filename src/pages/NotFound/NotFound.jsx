import React from 'react';

export default function NotFound() {
  const style = {
    'padding': '20px',
    'textAlign': 'center'
  };
  return (
    <div style={style}>
      <h1 style={{marginBottom: '20px'}}>抱歉，您要找的页面不存在（404）</h1>
    </div>
  );
}