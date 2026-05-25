import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import 'graphql-explorer/styles/style-no-bootstrap.css';

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
