import React from 'react';

const InstagramFeed = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
      {/* Substitua o src abaixo pelo link do seu widget do Instagram (LightWidget, SnapWidget, Elfsight, etc) */}
      <iframe
        src="https://lightwidget.com/widgets/your-widget-id.html"
        title="Instagram Feed"
        style={{ width: 340, height: 400, border: 0, overflow: 'hidden', borderRadius: 10 }}
        allowtransparency="true"
        scrolling="no"
        allow="encrypted-media"
      ></iframe>
    </div>
  );
};

export default InstagramFeed; 