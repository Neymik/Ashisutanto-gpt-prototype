
import defaultConfig from './config.tmpl.js';

let localConfig = {};
try {
  localConfig = (await import('./config.js')).default;
} catch (error) {
  console.warn('Local config not found, using tmpl config!');
}

const exportsConfig = localConfig ? Object.assign(defaultConfig, localConfig) : defaultConfig;

export default exportsConfig;
