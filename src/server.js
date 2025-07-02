import app from './app.js';
import { initApp } from './init.js';

const PORT = process.env.PORT || 3000;

initApp()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize app:', err);
    process.exit(1);
  });
