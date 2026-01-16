import './assets/style/base.css';
import './assets/style/theme.css';

import { addPrimeVue } from './utils/primevue/install';
import { initApp } from './utils/kernelift';

const { app } = initApp();
addPrimeVue(app);

app.mount('#app');
