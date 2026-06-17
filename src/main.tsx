import { render } from 'preact';
import './styles/index.css';
import './styles/prism.css';

import { App } from './app.tsx';

document.documentElement.classList.add('dark');

render(<App />, document.getElementById('app')!);
