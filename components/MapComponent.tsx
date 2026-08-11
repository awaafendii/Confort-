
import React, { useState } from 'react';
import { Driver, MapViewMode } from '../types';
import { Car, Bike, MapPin, Navigation, Globe, Layers, Eye, Map as MapIcon } from 'lucide-react';

interface MapComponentProps {
  drivers: Driver[];
  originCoords: { lat: number, lng: number };
  destCoords: { lat: number, lng: number } | null;
  status: string;
  assignedDriverId?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({ drivers, originCoords, destCoords, status, assignedDriverId }) => {
  const [viewMode, setViewMode] = useState<MapViewMode>('STANDARD');

  // Landmarks emblématiques de Conakry
  const conakryLandmarks = [
    { name: 'Palais du Peuple', lat: 80, lng: 75 },
    { name: 'Mosquée Fayçal', lat: 70, lng: 65 },
    { name: 'Port Autonome', lat: 90, lng: 80 },
    { name: 'Aéroport Gbessia', lat: 45, lng: 45 },
    { name: 'Hôtel Noom', lat: 85, lng: 78 },
    { name: 'Marché Madina', lat: 60, lng: 60 },
  ];

  const activeDriver = drivers.find(d => d.id === assignedDriverId);

  return (
    <div className={`relative w-full h-full overflow-hidden transition-all duration-1000 ${
        viewMode === 'SATELLITE' ? 'bg-[#020617]' : 
        viewMode === 'STREET' ? 'bg-[#0f172a]' : 'bg-[#020617]'
    }`}>
      
      {/* Fond de Carte avec Textures Dynamiques */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000">
             {/* Grille Urbaine / Ocean */}
             <div className={`absolute inset-0 transition-opacity duration-1000 ${viewMode === 'SATELLITE' ? 'opacity-10' : 'opacity-40'}`} 
                  style={{
                      backgroundImage: `radial-gradient(${viewMode === 'SATELLITE' ? '#334155' : '#1e293b'} 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                  }}>
             </div>

             {/* Forme de la Presqu'île */}
             <div className={`absolute inset-0 transition-all duration-1000 ${
                 viewMode === 'SATELLITE' ? 'bg-slate-900/90' : 'bg-slate-900/50'
             }`} 
                  style={{
                      clipPath: 'polygon(70% 100%, 100% 70%, 100% 10%, 80% 0, 50% 20%, 30% 40%, 10% 60%, 20% 80%)',
                      boxShadow: viewMode === 'SATELLITE' ? 'inset 0 0 150px #000' : 'none',
                      borderRight: viewMode === 'SATELLITE' ? '1px solid #1e293b' : 'none'
                  }}>
             </div>
      </div>
      
      {/* Réseau Routier Animé */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000">
          <defs>
              <filter id="neon">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
          </defs>
          
          {/* Autoroute Fidèle Castro */}
          <path d="M 0 100 Q 50 85 100 20" stroke={viewMode === 'SATELLITE' ? '#1e293b' : '#334155'} strokeWidth="12" fill="none" opacity="0.6" strokeLinecap="round" />
          {/* Route Le Prince */}
          <path d="M 0 65 Q 40 40 100 5" stroke={viewMode === 'SATELLITE' ? '#1e293b' : '#334155'} strokeWidth="8" fill="none" opacity="0.4" strokeLinecap="round" />
      </svg>

      {/* Landmarks Labels */}
      {viewMode !== 'SATELLITE' && conakryLandmarks.map((lm, i) => (
        <div key={i} className="absolute flex flex-col items-center opacity-30 group" style={{ top: `${lm.lat}%`, left: `${lm.lng}%` }}>
            <div className="w-1.5 h-1.5 rounded-full mb-1 transition-all group-hover:scale-150 bg-slate-500"></div>
            <span className="text-[8px] font-bold uppercase whitespace-nowrap tracking-tighter text-slate-500">{lm.name}</span>
        </div>
      ))}

      {/* Trajet Actif Néon */}
      {activeDriver && status !== 'SEARCHING' && status !== 'COMPLETED' && destCoords && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <line 
            x1={`${activeDriver.location.lng}%`} 
            y1={`${activeDriver.location.lat}%`} 
            x2={`${status === 'ACCEPTED' ? originCoords.lng : destCoords.lng}%`} 
            y2={`${status === 'ACCEPTED' ? originCoords.lat : destCoords.lat}%`} 
            stroke={status === 'ACCEPTED' ? '#10b981' : '#f59e0b'} 
            strokeWidth="4" 
            strokeDasharray="10,6"
            strokeLinecap="round"
            filter="url(#neon)"
          >
             <animate attributeName="stroke-dashoffset" from="0" to="32" dur="0.8s" repeatCount="indefinite" />
          </line>
        </svg>
      )}

      {/* Véhicules Animés */}
      {drivers.filter(d => d.isAvailable || d.id === assignedDriverId).map((driver) => (
        <div 
          key={driver.id}
          className="absolute transition-all duration-1000 ease-linear z-10"
          style={{ 
            top: `${driver.location.lat}%`, 
            left: `${driver.location.lng}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative group cursor-pointer">
             <div className={`absolute -inset-4 rounded-full opacity-20 animate-pulse ${driver.vehicleType === 'MOTO' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
             
             {driver.id === assignedDriverId && (
                 <div className="absolute -inset-6 bg-emerald-500/40 rounded-full animate-ping"></div>
             )}

             <div className={`p-2.5 rounded-full border-2 shadow-2xl transform transition-all duration-300 group-hover:scale-125 ${
                 driver.vehicleType === 'MOTO' ? 'bg-slate-900 border-amber-500 text-amber-400' : 
                 'bg-slate-900 border-blue-500 text-blue-400'
             } ${driver.id === assignedDriverId ? 'border-emerald-500 text-emerald-400 bg-slate-800 scale-125 ring-4 ring-emerald-500/20' : ''}`}>
                {driver.vehicleType === 'MOTO' ? <Bike size={20} fill="currentColor" /> : <Car size={20} fill="currentColor" />}
             </div>
          </div>
        </div>
      ))}

      {/* Marqueurs Voyageur & Destination */}
      <div className="absolute z-20" style={{ top: `${originCoords.lat}%`, left: `${originCoords.lng}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="bg-blue-600 p-2.5 rounded-full shadow-2xl border-2 border-white/20 animate-pulse">
              <MapPin size={22} className="text-white" />
          </div>
      </div>

      {destCoords && (
        <div className="absolute z-20" style={{ top: `${destCoords.lat}%`, left: `${destCoords.lng}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="bg-emerald-600 p-2.5 rounded-full shadow-2xl border-2 border-white/20 animate-bounce">
              <Navigation size={22} className="text-white" />
          </div>
        </div>
      )}
      
      {/* Contrôles de Vue */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
         <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 rounded-2xl flex flex-col gap-2 shadow-2xl">
            <button 
              onClick={() => setViewMode('STANDARD')}
              className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'STANDARD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              title="Standard"
            >
               <MapIcon size={20} />
            </button>
            <button 
              onClick={() => setViewMode('SATELLITE')}
              className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'SATELLITE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              title="Satellite"
            >
               <Layers size={20} />
            </button>
            <button 
              onClick={() => setViewMode('STREET')}
              className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'STREET' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              title="Street View"
            >
               <Eye size={20} />
            </button>
         </div>
      </div>

      {/* Overlay info */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl text-[10px] text-slate-300 font-mono shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-bold text-white tracking-widest uppercase">RT-GPS Conakry Active</span>
            </div>
            <div className="opacity-60">9°30' N, 13°42' W • 32°C</div>
        </div>
      </div>
    </div>
  );
};
