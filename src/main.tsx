import { render } from 'preact';
import './styles/index.css';
import './styles/prism.css';

import { App } from './app.tsx';
import { isEmbedded } from './utils/embed.utils';

document.documentElement.classList.add('dark');
if (isEmbedded()) {
  document.documentElement.classList.add('embedded');
}

render(<App />, document.getElementById('app')!);
