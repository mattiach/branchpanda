import { render } from 'preact';
import './styles/index.css';
import './styles/prism.css';

import { App } from './app.tsx';
import { isEmbedded } from './utils/embed.utils';
import { isExtensionContext } from './utils/browser.utils';

document.documentElement.classList.add('dark');
if (isEmbedded()) {
  document.documentElement.classList.add('embedded');
}

if (isExtensionContext() && !isEmbedded()) {
  document.documentElement.classList.add('extension-popup');
}
render(<App />, document.getElementById('app')!);
