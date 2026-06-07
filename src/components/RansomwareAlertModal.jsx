import { AlertTriangle } from 'lucide-react';

export default function RansomwareAlertModal({ data, onDismiss }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-red-950/90 backdrop-blur-md flex items-center justify-center">
      <div className="bg-red-900 border-2 border-red-500 rounded-xl max-w-2xl w-full p-8 shadow-2xl shadow-red-500/50 text-white animate-pulse-fast">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-24 h-24 text-red-400" />
        </div>
        
        <h1 className="text-4xl font-black text-center mb-4 text-red-100 uppercase tracking-widest">
          ¡ALERTA CRÍTICA DE RANSOMWARE!
        </h1>
        
        <div className="bg-red-950/50 p-6 rounded-lg mb-6 border border-red-700">
          <p className="text-xl mb-4 font-bold text-red-200 text-center">
            Se ha detectado comportamiento de cifrado masivo.
          </p>
          <div className="text-sm text-red-300 font-mono space-y-2 bg-black/30 p-4 rounded">
            <p><span className="text-red-400 font-bold">Archivo señuelo alterado:</span> {data.filePath}</p>
            <p><span className="text-red-400 font-bold">Hora de detección:</span> {new Date(data.time).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-lg text-red-200">Acciones Recomendadas Inmediatas:</h3>
          <ul className="list-disc list-inside space-y-2 text-red-100 bg-red-950/30 p-4 rounded">
            <li><strong>Apague su equipo inmediatamente</strong> (desconecte de la corriente) para detener el cifrado.</li>
            <li>Desconecte el cable de red o apague el Wi-Fi para evitar propagación en la red.</li>
            <li>Verifique los procesos activos recientes si decide no apagar.</li>
          </ul>
        </div>

        <button 
          onClick={onDismiss}
          className="w-full bg-red-950 hover:bg-black text-red-500 font-bold py-4 rounded border border-red-800 hover:border-red-500 transition-colors uppercase tracking-wider"
        >
          Entendido - Proceder con precaución
        </button>
      </div>
    </div>
  );
}
