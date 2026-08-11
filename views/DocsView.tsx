import React, { useState } from 'react';
import { Server, Database, Smartphone, Shield, Globe, CreditCard, Navigation, Layers, Code, Lock, Map, Radio, Terminal, Cpu } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';

const CodeBlock = ({ code, language = 'javascript', title }: { code: string; language?: string; title?: string }) => (
  <div className="bg-[#020617] border border-slate-800 rounded-xl overflow-hidden my-6 shadow-2xl">
    <div className="flex justify-between items-center px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-300 font-mono font-bold uppercase tracking-wider">{title || language}</span>
        </div>
        <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
    </div>
    <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-emerald-100/90 leading-relaxed">
          {code}
        </pre>
    </div>
  </div>
);

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MAPS' | 'DB' | 'CODE_MOBILE' | 'CODE_BACKEND' | 'AUTH'>('MAPS');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-slate-200">Architecture & Code</h1>
        <p className="text-amber-500/80 mt-4 font-mono text-sm tracking-widest uppercase">Spécification Guinée-Conakry • Tracking Temps Réel</p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {[
          { id: 'MAPS', label: 'Cartographie', icon: <Map size={18} /> },
          { id: 'CODE_MOBILE', label: 'Code Mobile', icon: <Smartphone size={18} /> },
          { id: 'CODE_BACKEND', label: 'Code Backend', icon: <Cpu size={18} /> },
          { id: 'DB', label: 'Base de Données', icon: <Database size={18} /> },
          { id: 'AUTH', label: 'Sécurité', icon: <Shield size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === tab.id 
              ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT: MAPS & GPS */}
      {activeTab === 'MAPS' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="grid md:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Map className="text-emerald-400" /> Géolocalisation Conakry</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="bg-blue-900/30 p-2 rounded text-blue-400"><Globe size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">Google Maps SDK</h3>
                        <p className="text-sm text-slate-400">Précision optimale sur la presqu'île de Kaloum.</p>
                        <code className="text-xs bg-black/30 p-1 rounded mt-1 block font-mono text-amber-500">Conakry: {'{ lat: 9.5092, lng: -13.7122 }'}</code>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="bg-emerald-900/30 p-2 rounded text-emerald-400"><Radio size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">WebSocket Pipeline</h3>
                        <p className="text-sm text-slate-400">Transmission instantanée Driver → Server → Client.</p>
                    </div>
                </div>
              </div>
            </Card>
            
            <Card>
               <h3 className="font-bold text-white mb-4">Fonctionnement du Tracking</h3>
               <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex gap-3">
                     <span className="font-mono text-emerald-400">1.</span>
                     <strong>App Conducteur:</strong> Envoie sa position GPS au serveur toutes les 2-5 secondes.
                  </li>
                  <li className="flex gap-3">
                     <span className="font-mono text-emerald-400">2.</span>
                     <strong>Serveur (Backend):</strong> Reçoit la position et la transmet via WebSockets.
                  </li>
                  <li className="flex gap-3">
                     <span className="font-mono text-emerald-400">3.</span>
                     <strong>App Client:</strong> Met à jour le marqueur sur la carte avec une animation fluide.
                  </li>
               </ul>
            </Card>
          </section>
        </div>
      )}

      {/* CONTENT: CODE MOBILE */}
      {activeTab === 'CODE_MOBILE' && (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="text-emerald-400" /> Intégration React Native
                </h2>
                <p className="text-slate-400 mb-4">Installation des dépendances :</p>
                <code className="block bg-black p-3 rounded-lg text-amber-500 font-mono text-sm mb-6">npm install react-native-maps socket.io-client</code>

                <CodeBlock 
                    title="App Client - DriverTrackingMap.js"
                    code={`import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import io from 'socket.io-client';

const socket = io('http://votre-ip-serveur:3000');

export default function DriverTrackingMap() {
  const mapRef = useRef(null);
  const [driverLocation, setDriverLocation] = useState({
    latitude: 9.5092, longitude: -13.7122, // Conakry
    latitudeDelta: 0.01, longitudeDelta: 0.01,
  });

  useEffect(() => {
    socket.on('driver-moved', (newCoordinate) => {
      setDriverLocation(prev => ({
        ...prev, latitude: newCoordinate.latitude, longitude: newCoordinate.longitude
      }));

      mapRef.current.animateToRegion({
        ...newCoordinate, latitudeDelta: 0.01, longitudeDelta: 0.01,
      }, 1000);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} region={driverLocation}>
        <Marker coordinate={driverLocation} title={"Votre chauffeur"}>
          <Image source={require('./assets/car-icon.png')} style={{width: 40, height: 40}} />
        </Marker>
      </MapView>
    </View>
  );
}`} />

                <CodeBlock 
                    title="App Conducteur - Background Location"
                    code={`import * as Location from 'expo-location';

// Envoi de la position toutes les 2 secondes
setInterval(async () => {
  let location = await Location.getCurrentPositionAsync({});
  socket.emit('send-location', {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  });
}, 2000);`} />
            </Card>
        </div>
      )}

      {/* CONTENT: CODE BACKEND */}
      {activeTab === 'CODE_BACKEND' && (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="text-emerald-400" /> Logique Serveur Temps Réel
                </h2>
                
                <CodeBlock 
                    title="Node.js + Socket.io (Tour de Contrôle)"
                    code={`const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Utilisateur connecté');

  socket.on('send-location', (coords) => {
    // On diffuse à tous les clients écoutant cette course
    io.emit('driver-moved', coords);
  });
});

server.listen(3000, () => console.log('Port 3000'));`} />

                <CodeBlock 
                    title="Option Python - Flask-SocketIO"
                    language="python"
                    code={`from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@socketio.on('position')
def handle_position(data):
    # data = {'id': 'driver_1', 'position': {'lat': 9.5, 'lng': -13.7}}
    emit('update_positions', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)`} />
            </Card>
        </div>
      )}

      {/* CONTENT: DB SCHEMA */}
      {activeTab === 'DB' && (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <Database className="text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Schéma SQL (Guinée-Conakry)</h2>
                </div>
                
                <CodeBlock code={`-- Table des positions en temps réel (Redis recommandé pour ceci)
CREATE TABLE live_tracking (
    driver_id UUID PRIMARY KEY REFERENCES users(id),
    current_lat DECIMAL(9,6),
    current_lng DECIMAL(9,6),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des trajets archivés
CREATE TABLE ride_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    path_geometry GEOMETRY(LineString, 4326), -- PostGIS pour le tracé exact
    distance_km FLOAT,
    duration_minutes INTEGER
);`} />
            </Card>
        </div>
      )}

      {/* CONTENT: AUTH */}
      {activeTab === 'AUTH' && (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="text-emerald-400" /> Sécurisation & OTP
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Flux Authentification</h3>
                        <p className="text-sm text-slate-400">Utilisation de Firebase Auth ou d'une passerelle SMS locale (Orange/MTN) pour les numéros Guinéens.</p>
                        <Badge color="blue">JWT (JSON Web Token)</Badge>
                        {/* Fix: Changed color from 'emerald' to 'green' to match valid colors in Badge component */}
                        <Badge color="green">OTP SMS Obligatoire</Badge>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Vérification de Pièces</h4>
                        <ul className="text-sm space-y-2 text-slate-300">
                            <li>• Photo du Permis de Conduire</li>
                            <li>• Carte Grise du Véhicule</li>
                            <li>• Assurance CEDEAO valide</li>
                            <li>• Photo du Véhicule (Face & Plaque)</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};