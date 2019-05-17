import React from 'react';
import Visualisation from './components/Visualisation';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 className="Header">3D SSH Bot Visualiser</h1>
      <p>Using BabylonJS, Python and <a href="IP-API.com" target="_blank">IP-API.com</a></p>
      <Visualisation/>
    </div>
  );
}

export default App;
