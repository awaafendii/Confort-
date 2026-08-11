
import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, X, CheckCircle2, Loader2, Zap, CreditCard } from 'lucide-react';
import { PaymentMethod } from '../types';
import { Button, Card } from './UI';

interface PaymentGatewayProps {
  method: PaymentMethod;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ method, amount, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'INITIAL' | 'PROCESSING' | 'SUCCESS'>('INITIAL');
  const [otp, setOtp] = useState('');

  const handleProcess = () => {
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  const getMethodDetails = () => {
    switch(method) {
      case 'ORANGE_MONEY': return { name: 'Orange Money', color: 'bg-[#FF6600]', logo: <Zap size={24} /> };
      case 'WAVE': return { name: 'Wave', color: 'bg-blue-500', logo: <Smartphone size={24} /> };
      case 'PAYCARD': return { name: 'Paycard', color: 'bg-emerald-600', logo: <CreditCard size={24} /> };
      default: return { name: 'Paiement Sécurisé', color: 'bg-slate-700', logo: <ShieldCheck size={24} /> };
    }
  };

  const details = getMethodDetails();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <Card className="w-full max-w-sm overflow-hidden border-slate-800 shadow-2xl p-0">
        <div className={`${details.color} p-6 flex justify-between items-center text-white`}>
          <div className="flex items-center gap-3">
            {details.logo}
            <h3 className="font-black italic uppercase tracking-tighter">{details.name}</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8 space-y-6">
          {step === 'INITIAL' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Montant à payer</p>
                <h4 className="text-3xl font-black text-white">{amount.toLocaleString()} <span className="text-sm font-bold opacity-50">FG</span></h4>
              </div>

              {(method === 'ORANGE_MONEY' || method === 'WAVE') && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Confirmation Mobile</label>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                    <Smartphone className="text-slate-500" />
                    <p className="text-sm text-slate-300">Un message PUSH sera envoyé sur votre téléphone.</p>
                  </div>
                </div>
              )}

              {method === 'VISA' && (
                <div className="space-y-3">
                  <Input label="Numéro de carte" placeholder="**** **** **** ****" icon={<CreditCard size={18}/>} />
                </div>
              )}

              <Button onClick={handleProcess} variant="gold" className="w-full py-4 font-black">VALIDER LE PAIEMENT</Button>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center py-10 space-y-4 animate-pulse">
              <Loader2 size={48} className="text-amber-500 animate-spin" />
              <div className="text-center">
                <p className="text-white font-black uppercase italic">Traitement en cours...</p>
                <p className="text-xs text-slate-500 font-bold">Ne fermez pas cette fenêtre</p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center py-10 space-y-4 animate-bounce">
              <div className="bg-emerald-500/20 p-4 rounded-full">
                <CheckCircle2 size={56} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-black uppercase italic text-xl">Paiement Réussi</p>
                <p className="text-xs text-slate-500 font-bold">Transaction confirmée</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/50 p-4 border-t border-slate-800 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Cryptage SSL 256-bits Conakry Pay</span>
        </div>
      </Card>
    </div>
  );
};

// Internal Input component to avoid circular dep if needed
const Input = ({ label, icon, ...props }: any) => (
  <div className="w-full">
    {label && <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
      <input className={`w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 ${icon ? 'pl-10' : 'px-4'} outline-none focus:border-amber-500 transition-all font-bold text-sm`} {...props} />
    </div>
  </div>
);
