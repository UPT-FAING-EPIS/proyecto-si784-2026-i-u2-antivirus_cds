import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import RealTime from './pages/RealTime';
import Quarantine from './pages/Quarantine';
import History from './pages/History';
import ProjectAnalysis from './pages/ProjectAnalysis';


function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
      case 'scan': return <Scan />;
      case 'realtime': return <RealTime />;
      case 'quarantine': return <Quarantine />;
      case 'history': return <History />;
      case 'project-analysis': return <ProjectAnalysis />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </Layout>

    </>
  );
}

export default App;
