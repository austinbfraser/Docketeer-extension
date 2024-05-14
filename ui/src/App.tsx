import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Metrics from './components/Metrics/Metrics';
import Snapshots from './components/Snapshots/Snapshots';
import Images from './components/Images/Images';
import Containers from './components/Containers/Containers';
import VolumeHistory from './components/VolumeHistory/VolumeHistory'; // need to fix types
import ProcessLogs from './components/ProcessLogs/ProcessLogs';
import SharedLayout from './components/SharedLayout/SharedLayout';
import Network from './components/Network/Network';
import K8Metrics from './components/K8Metrics/K8Metrics'
import Configuration from './components/Configuration/Configuration';


const App = (): React.JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}>
        <Route path="/" element={<Containers />} />
        <Route path="/volume" element={<VolumeHistory />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/snapshots" element={<Snapshots />} />
        <Route path="/K8Metrics" element={<K8Metrics />} />
        <Route path="/logs" element={<ProcessLogs />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/images" element={<Images />} />
        <Route path="/network" element={<Network />} />
        <Route path="/configuration" element={<Configuration />} />
      </Route>
    </Routes>
  );
};



export default App;
