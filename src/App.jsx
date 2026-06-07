import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import RealTime from './pages/RealTime';
import Quarantine from './pages/Quarantine';
import History from './pages/History';
import RansomwareAlertModal from './components/RansomwareAlertModal';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [ransomwareAlertData, setRansomwareAlertData] = useState(null);

  useEffect(() => {
    // Listen for Ransomware alert
    if (window.electronAPI) {
      window.electronAPI.onRansomwareAlert((data) => {
        setRansomwareAlertData(data);
      });
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
      case 'scan': return <Scan />;
      case 'realtime': return <RealTime />;
      case 'quarantine': return <Quarantine />;
      case 'history': return <History />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </Layout>
      <RansomwareAlertModal 
        data={ransomwareAlertData} 
        onDismiss={() => setRansomwareAlertData(null)} 
      />
    </>
  );
}

export default App;
