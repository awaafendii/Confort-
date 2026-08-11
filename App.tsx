
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Car, 
  Bike,
  User as UserIcon, 
  LogOut,
  FileText,
  Zap,
  Wallet,
  CheckCircle,
  MapPin,
  Navigation,
  ArrowRight,
  CreditCard,
  UserCheck,
  Power,
  Bell,
  Star,
  Users,
  LocateFixed,
  Wifi,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Mail,
  Phone,
  ArrowLeft,
  Smartphone,
  History,
  Lock,
  RefreshCcw,
  Loader2,
  Check,
  Camera,
  X as XIcon,
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  Map as MapIcon,
  Info
} from 'lucide-react';
import { Driver, Ride, User, PaymentMethod, VehicleType, Neighborhood, RideCategory, Transaction } from './types';
import { MapComponent } from './components/MapComponent';
import { Button, Card, Input, Badge } from './components/UI';
import { DocsView } from './views/DocsView';
import { getSafetyTips } from './services/geminiService';
import { PaymentGateway } from './components/PaymentGateway';

const NEIGHBORHOODS_LIST: Neighborhood[] = [
  { id: 'kaloum', name: 'Kaloum', lat: 85, lng: 75 },
  { id: 'madina', name: 'Madina', lat: 75, lng: 68 },
  { id: 'aeroport', name: 'Aéroport-Gbessia', lat: 60, lng: 55 },
  { id: 'sangoyah', name: 'Sangoyah', lat: 45, lng: 45 },
  { id: 'dabompa', name: 'Dabompa', lat: 30, lng: 35 },
  { id: 'km36', name: 'KM36', lat: 15, lng: 25 },
  { id: 'dixinn', name: 'Dixinn', lat: 78, lng: 62 },
  { id: 'hamdallaye', name: 'Hamdallaye', lat: 68, lng: 52 },
  { id: 'citerail', name: 'Cité-rail', lat: 58, lng: 42 },
  { id: 't6', name: 'T6 Sonfonia', lat: 48, lng: 32 },
  { id: 't8', name: 'T8', lat: 38, lng: 22 },
  { id: 'kagbelen', name: 'Kagbélén', lat: 20, lng: 15 },
];

const AXE_AUTOROUTE = ['kaloum', 'madina', 'aeroport', 'sangoyah', 'dabompa', 'km36'];
const PRICES_AUTOROUTE: Record<string, number> = {
  'kaloum-madina': 3000, 'madina-aeroport': 2000, 'aeroport-sangoyah': 3000, 'sangoyah-dabompa': 3000, 'dabompa-km36': 4000
};

const AXE_PRINCE = ['kaloum', 'dixinn', 'hamdallaye', 'citerail', 't6', 't8', 'kagbelen'];
const PRICES_PRINCE: Record<string, number> = {
  'kaloum-dixinn': 3000, 'dixinn-hamdallaye': 2000, 'hamdallaye-citerail': 4000, 'citerail-t6': 4000, 't6-t8': 4000, 't8-kagbelen': 4000
};

const CATEGORIES_CONFIG: Record<RideCategory, { label: string, capacity: string, desc: string }> = {
  'STANDARD': { label: 'Standard', capacity: '4 pers. max', desc: 'Partage, arrêts publics.' },
  'LUXE': { label: 'Luxe', capacity: '3 pers. max', desc: 'Confort -500 FG.' },
  'VIP': { label: 'VIP', capacity: 'Seul à bord', desc: 'Privé +5000 FG.' },
  'MOTO_SINGLE': { label: 'Moto-Taxi', capacity: '1 pers. max', desc: 'Rapide, 5x Prix.' }
};

const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Mamadou Bah', phone: '622001122', role: 'DRIVER', avatar: 'https://i.pravatar.cc/150?u=d1', balance: 500000, vehicleType: 'VOITURE', vehicleModel: 'Toyota Corolla', plateNumber: 'RC-1234-A', isAvailable: true, rating: 4.95, ridesCompleted: 450, location: { lat: 82, lng: 72 }, isVerified: true, subscriptionStatus: 'ACTIVE', earningsToday: 150000, documents: [], createdAt: new Date().toISOString() },
  { id: 'd2', name: 'Ibrahima Soumah', phone: '664334455', role: 'DRIVER', avatar: 'https://i.pravatar.cc/150?u=d2', balance: 250000, vehicleType: 'MOTO', vehicleModel: 'TVS HLX 150', plateNumber: 'RC-9988-M', isAvailable: true, rating: 4.8, ridesCompleted: 89, location: { lat: 84, lng: 74 }, isVerified: true, subscriptionStatus: 'ACTIVE', earningsToday: 85000, documents: [], createdAt: new Date().toISOString() },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | Driver | null>(null);
  const [currentView, setCurrentView] = useState<'AUTH' | 'CLIENT' | 'DRIVER' | 'DOCS' | 'WALLET'>('AUTH');
  const [authMode, setAuthMode] = useState<'WELCOME' | 'LOGIN' | 'SIGNUP_ROLE' | 'SIGNUP_FORM' | 'SIGNUP_VERIFY'>('WELCOME');
  const [signupRole, setSignupRole] = useState<'CLIENT' | 'DRIVER'>('CLIENT');
  
  const [authForm, setAuthForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    avatar: '',
    vehicleType: 'VOITURE' as VehicleType, 
    vehicleModel: '', 
    plateNumber: '' 
  });
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [tempUser, setTempUser] = useState<User | Driver | null>(null);

  // Payment State
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [originId, setOriginId] = useState(NEIGHBORHOODS_LIST[0].id);
  const [destId, setDestId] = useState(NEIGHBORHOODS_LIST[1].id);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('VOITURE');
  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('STANDARD');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('ESPECE');
  const [aiTip, setAiTip] = useState<string>('');

  const [isOnline, setIsOnline] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [showTrackingConfirmation, setShowTrackingConfirmation] = useState(false);
  const trackingIntervalRef = useRef<number | null>(null);

  const origin = useMemo(() => NEIGHBORHOODS_LIST.find(n => n.id === originId)!, [originId]);
  const destination = useMemo(() => NEIGHBORHOODS_LIST.find(n => n.id === destId)!, [destId]);

  const pricingData = useMemo(() => {
    let totalStandard = 0;
    const calculatePathPrice = (axe: string[], prices: Record<string, number>, o: string, d: string) => {
      const idxO = axe.indexOf(o); const idxD = axe.indexOf(d); if (idxO === -1 || idxD === -1) return 0;
      const start = Math.min(idxO, idxD); const end = Math.max(idxO, idxD);
      let sum = 0; for (let i = start; i < end; i++) {
        const key = `${axe[i]}-${axe[i+1]}`; const reverseKey = `${axe[i+1]}-${axe[i]}`;
        sum += prices[key] || prices[reverseKey] || 0;
      }
      return sum;
    };
    const priceAuto = calculatePathPrice(AXE_AUTOROUTE, PRICES_AUTOROUTE, originId, destId);
    if (priceAuto > 0) totalStandard = priceAuto;
    else {
      const pricePrince = calculatePathPrice(AXE_PRINCE, PRICES_PRINCE, originId, destId);
      if (pricePrince > 0) totalStandard = pricePrince;
      else {
        const toK = calculatePathPrice(AXE_AUTOROUTE, PRICES_AUTOROUTE, originId, 'kaloum') || calculatePathPrice(AXE_PRINCE, PRICES_PRINCE, originId, 'kaloum');
        const fromK = calculatePathPrice(AXE_AUTOROUTE, PRICES_AUTOROUTE, 'kaloum', destId) || calculatePathPrice(AXE_PRINCE, PRICES_PRINCE, 'kaloum', destId);
        totalStandard = toK + fromK;
      }
    }
    if (totalStandard === 0) totalStandard = 3000;
    return { STANDARD: totalStandard, LUXE: Math.max(0, totalStandard - 500), VIP: totalStandard + 5000, MOTO_SINGLE: totalStandard * 5 };
  }, [originId, destId]);

  const finalPrice = useMemo(() => {
    const category = selectedVehicle === 'MOTO' ? 'MOTO_SINGLE' : selectedCategory;
    return pricingData[category as keyof typeof pricingData];
  }, [pricingData, selectedCategory, selectedVehicle]);

  useEffect(() => {
    if (isOnline) {
      setIsTrackingActive(true); setShowTrackingConfirmation(true);
      const timeout = setTimeout(() => setShowTrackingConfirmation(false), 5000);
      trackingIntervalRef.current = window.setInterval(() => {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(() => console.log("GPS Driver Signal Sent"));
      }, 5000);
      return () => { if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current); clearTimeout(timeout); };
    }
  }, [isOnline]);

  const handleLogin = () => {
    if (!authForm.phone) return alert("Entrez votre numéro");
    const foundDriver = MOCK_DRIVERS.find(d => d.phone === authForm.phone);
    if (foundDriver) { setCurrentUser(foundDriver); setCurrentView('DRIVER'); }
    else {
      setCurrentUser({ id: 'u-temp', name: 'Client ' + authForm.phone, phone: authForm.phone, role: 'CLIENT', avatar: 'https://i.pravatar.cc/150?u=' + authForm.phone, balance: 25000, createdAt: new Date().toISOString() });
      setCurrentView('CLIENT');
    }
  };

  const sendOtpCode = async (email: string) => {
    setIsSendingCode(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsSendingCode(false);
    
    console.log(`[Wonkhai] Email envoyé à ${email} avec le code: ${code}`);
    setShowResendSuccess(true);
    setTimeout(() => setShowResendSuccess(false), 3000);
    alert(`[MODE DÉMO] Code de sécurité envoyé à ${email} : ${code}`);
  };

  const handleRegister = async () => {
    if (!authForm.name || !authForm.phone || !authForm.email) return alert("Nom, numéro et email requis");
    
    const newUser: User | Driver = signupRole === 'CLIENT' ? {
      id: Math.random().toString(36).substr(2, 9), 
      name: authForm.name, 
      phone: authForm.phone, 
      email: authForm.email, 
      role: 'CLIENT', 
      avatar: authForm.avatar || undefined, 
      balance: 0, 
      createdAt: new Date().toISOString()
    } : {
      id: Math.random().toString(36).substr(2, 9), 
      name: authForm.name, 
      phone: authForm.phone, 
      email: authForm.email, 
      role: 'DRIVER', 
      avatar: authForm.avatar || undefined, 
      balance: 0, 
      createdAt: new Date().toISOString(), 
      vehicleType: authForm.vehicleType, 
      vehicleModel: authForm.vehicleModel, 
      plateNumber: authForm.plateNumber, 
      isAvailable: false, 
      rating: 5.0, 
      ridesCompleted: 0, 
      location: { lat: 85, lng: 75 }, 
      documents: [], 
      isVerified: false, 
      subscriptionStatus: 'PENDING', 
      earningsToday: 0
    };
    
    setTempUser(newUser);
    setAuthMode('SIGNUP_VERIFY');
    await sendOtpCode(authForm.email);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp && tempUser) {
      setIsVerifying(true);
      setTimeout(() => {
        setCurrentUser(tempUser);
        setCurrentView(tempUser.role as any);
        setIsVerifying(false);
      }, 1500);
    } else {
      alert("Code incorrect. Veuillez vérifier l'alerte de simulation.");
    }
  };

  const handleBookRide = async () => {
    if (!currentUser) return;
    if (selectedPayment !== 'ESPECE' && currentUser.balance < finalPrice) {
      alert("Solde insuffisant. Veuillez recharger votre portefeuille ou choisir 'Espèce'.");
      setCurrentView('WALLET');
      return;
    }

    const category = selectedVehicle === 'MOTO' ? 'MOTO_SINGLE' : selectedCategory;
    const newRide: Ride = {
      id: Math.random().toString(36).substr(2, 9), clientId: currentUser.id, origin: origin.name, destination: destination.name, price: finalPrice, distance: 0, status: 'SEARCHING', date: new Date().toISOString(), paymentMethod: selectedPayment, vehicleType: selectedVehicle, category: category
    };
    setCurrentRide(newRide);
    const tip = await getSafetyTips(destination.name);
    setAiTip(tip);
    setTimeout(() => {
      const bestDriver = drivers.find(d => d.vehicleType === selectedVehicle && d.isAvailable);
      if (bestDriver) setCurrentRide(p => p ? { ...p, status: 'ACCEPTED', driverId: bestDriver.id } : null);
      else { alert("Aucun chauffeur sur ces tronçons."); setCurrentRide(null); }
    }, 3000);
  };

  const handlePaymentSuccess = () => {
    if (!currentUser) return;
    const isTopup = currentView === 'WALLET';
    const amount = paymentAmount;
    
    const updatedUser = { ...currentUser, balance: isTopup ? currentUser.balance + amount : currentUser.balance - amount };
    setCurrentUser(updatedUser);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      amount,
      type: isTopup ? 'CREDIT' : 'DEBIT',
      method: selectedPayment,
      description: isTopup ? 'Rechargement Portefeuille' : 'Paiement Course',
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setTransactions([newTx, ...transactions]);
    setShowPaymentGateway(false);
    if (!isTopup) {
        setCurrentRide(p => p ? { ...p, status: 'COMPLETED' } : null);
        setTimeout(() => setCurrentRide(null), 3000);
    }
  };

  const initiatePayment = (amount: number) => {
    setPaymentAmount(amount);
    if (selectedPayment === 'ESPECE') {
        alert("Paiement en espèce : Veuillez remettre le montant au chauffeur à la fin de la course.");
        setCurrentRide(p => p ? { ...p, status: 'COMPLETED' } : null);
        setTimeout(() => setCurrentRide(null), 3000);
    } else {
        setShowPaymentGateway(true);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderAvatar = (user: User | Driver, size: string = 'w-10 h-10') => {
    if (user.avatar) {
      return <img src={user.avatar} className={`${size} rounded-xl border border-amber-500/50 object-cover`} alt={user.name} />;
    }
    return (
      <div className={`${size} rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500`}>
        <UserIcon size={parseInt(size.split(' ')[0].replace('w-', '')) * 2} />
      </div>
    );
  };

  const renderWallet = () => (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
       <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Mon Portefeuille</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Gérez vos fonds et rechargements</p>
          </div>
          <Badge color="gold" className="px-6 py-2 text-lg">{(currentUser?.balance || 0).toLocaleString()} FG</Badge>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
          <Card className="space-y-6 border-slate-800">
             <h3 className="font-black text-white uppercase italic text-sm">Recharger le compte</h3>
             <div className="grid grid-cols-2 gap-2">
                {[10000, 25000, 50000, 100000].map(amt => (
                   <button key={amt} onClick={() => initiatePayment(amt)} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-black hover:border-amber-500 transition-all">
                      +{amt.toLocaleString()} FG
                   </button>
                ))}
             </div>
             <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Choisir le mode de rechargement</label>
                <div className="flex gap-2">
                    {['ORANGE_MONEY', 'WAVE', 'PAYCARD'].map(m => (
                        <button key={m} onClick={() => setSelectedPayment(m as PaymentMethod)} className={`flex-1 p-3 rounded-xl border font-black text-[10px] ${selectedPayment === m ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-slate-500'}`}>{m.replace('_', ' ')}</button>
                    ))}
                </div>
             </div>
          </Card>

          <Card className="space-y-4 border-slate-800 flex flex-col">
             <div className="flex justify-between items-center">
                <h3 className="font-black text-white uppercase italic text-sm">Historique</h3>
                <History size={16} className="text-slate-500" />
             </div>
             <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 custom-scrollbar pr-2">
                {transactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                        <Wallet size={48} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Aucune transaction</p>
                    </div>
                ) : transactions.map(tx => (
                    <div key={tx.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-xs">{tx.description}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase">{tx.date.split('T')[0]} • {tx.method}</p>
                        </div>
                        <p className={`font-black text-sm ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </p>
                    </div>
                ))}
             </div>
          </Card>
       </div>
    </div>
  );

  const renderAuth = () => (
    <div className="flex items-center justify-center min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1542259682-1c251f62153c?q=80&w=2000')] bg-cover bg-center p-4 relative">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
      <Card className="w-full max-w-md relative z-10 border-slate-800 shadow-2xl p-8 md:p-12">
        {authMode === 'WELCOME' && (
          <div className="space-y-8 text-center animate-fadeIn">
            <div className="bg-amber-500/10 p-6 rounded-3xl inline-block border border-amber-500/20 mb-4"><ShieldCheck size={64} className="text-amber-500" /></div>
            <div><h1 className="text-4xl font-black text-white italic tracking-tighter">WONKHAI 💨</h1><p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Paiements Sécurisés V1.2</p></div>
            <div className="space-y-4"><Button onClick={() => setAuthMode('LOGIN')} className="w-full py-4 font-black">SE CONNECTER</Button><Button onClick={() => setAuthMode('SIGNUP_ROLE')} variant="midnight" className="w-full py-4 font-black">S'INSCRIRE</Button></div>
          </div>
        )}

        {authMode === 'LOGIN' && (
          <div className="space-y-6 animate-fadeIn">
            <button onClick={() => setAuthMode('WELCOME')} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"><ArrowLeft size={16}/> Retour</button>
            <h2 className="text-2xl font-black text-white uppercase italic">Connexion</h2>
            <Input label="Numéro de téléphone" placeholder="622 00 11 22" icon={<Phone size={18}/>} value={authForm.phone} onChange={(e: any) => setAuthForm({...authForm, phone: e.target.value})} />
            <Button onClick={handleLogin} variant="gold" className="w-full font-black mt-4">ENTRER</Button>
          </div>
        )}

        {authMode === 'SIGNUP_ROLE' && (
          <div className="space-y-6 animate-fadeIn">
            <button onClick={() => setAuthMode('WELCOME')} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"><ArrowLeft size={16}/> Retour</button>
            <h2 className="text-2xl font-black text-white uppercase italic mb-8">Nouveau compte</h2>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => {setSignupRole('CLIENT'); setAuthMode('SIGNUP_FORM');}} className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-slate-800 bg-slate-900/50 hover:border-amber-500 transition-all group"><div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-900"><Users size={32}/></div><span className="font-black text-white text-xs">PASSAGER</span></button>
               <button onClick={() => {setSignupRole('DRIVER'); setAuthMode('SIGNUP_FORM');}} className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-slate-800 bg-slate-900/50 hover:border-emerald-500 transition-all group"><div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white"><Car size={32}/></div><span className="font-black text-white text-xs">PILOTE</span></button>
            </div>
          </div>
        )}

        {authMode === 'SIGNUP_FORM' && (
          <div className="space-y-4 animate-fadeIn overflow-y-auto max-h-[80vh] px-2 custom-scrollbar">
            <button onClick={() => setAuthMode('SIGNUP_ROLE')} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"><ArrowLeft size={16}/> Retour</button>
            <h2 className="text-xl font-black text-white uppercase italic mb-4">Infos {signupRole === 'CLIENT' ? 'Passager' : 'Pilote'}</h2>
            
            {/* Champ Photo Optionnel */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-amber-500`}>
                  {authForm.avatar ? (
                    <img src={authForm.avatar} className="w-full h-full object-cover" alt="Avatar preview" />
                  ) : (
                    <Camera size={32} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleAvatarChange} 
                />
                {authForm.avatar && (
                  <button 
                    onClick={() => setAuthForm(prev => ({ ...prev, avatar: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Photo de profil (Optionnel)</p>
            </div>

            <Input label="Nom complet" placeholder="Bangoura Aboubacar" icon={<UserIcon size={18}/>} value={authForm.name} onChange={(e: any) => setAuthForm({...authForm, name: e.target.value})} />
            <Input label="Email" placeholder="votre@email.com" icon={<Mail size={18}/>} value={authForm.email} onChange={(e: any) => setAuthForm({...authForm, email: e.target.value})} />
            <Input label="Numéro" placeholder="6..." icon={<Phone size={18}/>} value={authForm.phone} onChange={(e: any) => setAuthForm({...authForm, phone: e.target.value})} />
            
            {signupRole === 'DRIVER' && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-black text-emerald-500 uppercase">Détails Véhicule</p>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setAuthForm({...authForm, vehicleType: 'VOITURE'})} className={`p-3 rounded-xl border text-xs font-bold ${authForm.vehicleType === 'VOITURE' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>VOITURE</button>
                   <button onClick={() => setAuthForm({...authForm, vehicleType: 'MOTO'})} className={`p-3 rounded-xl border text-xs font-bold ${authForm.vehicleType === 'MOTO' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>MOTO</button>
                </div>
                <Input label="Modèle" placeholder="Toyota..." value={authForm.vehicleModel} onChange={(e: any) => setAuthForm({...authForm, vehicleModel: e.target.value})} />
                <Input label="Plaque" placeholder="RC-..." value={authForm.plateNumber} onChange={(e: any) => setAuthForm({...authForm, plateNumber: e.target.value})} />
              </div>
            )}
            <Button onClick={handleRegister} variant="gold" className="w-full font-black py-4 mt-6" disabled={isSendingCode}>
                {isSendingCode ? <Loader2 className="animate-spin" /> : "VÉRIFIER MON EMAIL"}
            </Button>
          </div>
        )}

        {authMode === 'SIGNUP_VERIFY' && (
          <div className="space-y-8 animate-fadeIn text-center">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
               <Lock className="text-emerald-500" size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white uppercase italic">Vérification</h2>
               <p className="text-slate-400 text-xs mt-2">Un code de sécurité à 6 chiffres a été envoyé à <strong>{authForm.email}</strong></p>
               <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-wider italic">Le code est affiché dans l'alerte du navigateur</p>
            </div>
            <div className="space-y-4">
               <Input 
                  label="Entrez le code" 
                  placeholder="000000" 
                  className="text-center text-2xl tracking-[0.5em] font-black py-4" 
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e: any) => setEnteredOtp(e.target.value)}
                />
               <Button 
                  onClick={handleVerifyOtp} 
                  variant="gold" 
                  className="w-full py-4 font-black"
                  disabled={isVerifying || enteredOtp.length !== 6}
                >
                  {isVerifying ? <Loader2 className="animate-spin" /> : "CONFIRMER L'INSCRIPTION"}
               </Button>
               
               <div className="relative">
                 <button 
                    onClick={() => sendOtpCode(authForm.email)} 
                    className={`text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-full ${isSendingCode ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                    {isSendingCode ? "Envoi en cours..." : "Renvoyer le code"}
                 </button>
                 
                 {showResendSuccess && (
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-black animate-fadeIn">
                     <Check size={12} /> CODE RENVOYÉ !
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderDriverDashboard = () => {
    const driver = currentUser as Driver;
    if (!driver) return null;

    return (
      <div className="h-full bg-[#0b0f19] p-4 md:p-8 flex flex-col gap-8 overflow-auto custom-scrollbar">
        {/* Header - Stats & Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              {renderAvatar(driver, 'w-16 h-16')}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0b0f19] ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase leading-none">Espace Pilote</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500"/> Compte Vérifié • {driver.vehicleModel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <button 
                onClick={() => setIsOnline(!isOnline)} 
                className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all duration-500 ${
                  isOnline 
                  ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/20' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <Power size={20} />
                {isOnline ? 'EN SERVICE' : 'HORS SERVICE'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic GPS Alert */}
        {isTrackingActive && isOnline && (
          <div className="animate-fadeIn">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 animate-pulse">
                  <LocateFixed size={20} />
                </div>
                <div>
                  <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Signal GPS Tronçons : OPTIMAL</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Votre position est mise à jour sur la carte passager</p>
                </div>
              </div>
              <Wifi size={18} className="text-emerald-500 opacity-50" />
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex flex-col p-6 border-slate-800/50 bg-slate-900/30 group hover:border-amber-500/30 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet size={12} /> Gains Aujourd'hui
            </p>
            <h3 className="text-3xl font-black text-white italic">{driver.earningsToday.toLocaleString()} <span className="text-xs text-emerald-500">FG</span></h3>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <p className="text-[9px] font-black text-slate-500 uppercase">8 Courses • <span className="text-amber-500">2 VIP</span></p>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
          </Card>

          <Card className="flex flex-col p-6 border-slate-800/50 bg-slate-900/30 group hover:border-blue-500/30 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={12} /> Temps en ligne
            </p>
            <h3 className="text-3xl font-black text-white italic">05h 42m</h3>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]"></div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-6 border-slate-800/50 bg-slate-900/30 group hover:border-emerald-500/30 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle size={12} /> Taux d'Acceptation
            </p>
            <h3 className="text-3xl font-black text-white italic">94.2%</h3>
            <p className="text-[9px] text-emerald-500 font-bold uppercase mt-4">+2.1% vs hier</p>
          </Card>

          <Card className="flex flex-col p-6 border-slate-800/50 bg-slate-900/30 group hover:border-amber-500/30 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={12} className="text-amber-500 fill-amber-500" /> Note Pilote
            </p>
            <h3 className="text-3xl font-black text-white italic">{driver.rating} <span className="text-xs text-slate-500 italic">/ 5.0</span></h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-4">{driver.ridesCompleted} Trajets au total</p>
          </Card>
        </div>

        {/* Performance & Alerts Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Alerts / Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
                <Bell size={18} className="text-amber-500 animate-bounce" /> Demandes à proximité
              </h4>
              <Badge color="slate" className="font-black">TEMPS RÉEL</Badge>
            </div>

            {!isOnline ? (
              <div className="py-20 flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                <Power size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Passez en ligne pour recevoir des courses</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* Active Ride Alert */}
                <Card className="border-amber-500 border-l-8 bg-amber-500/5 p-6 hover:translate-x-1 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <Badge color="gold" className="px-4 py-1.5 text-[10px] font-black">OFFRE TRONÇON VIP</Badge>
                      <h5 className="text-xl font-black text-white mt-2 uppercase italic tracking-tighter">Course Prioritaire</h5>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-500 font-black text-2xl tracking-tighter">15.000 FG</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase">Tarif Majoré 💨</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <MapPin size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Point de Départ</p>
                          <p className="text-white font-bold text-sm">Cité de l'Air, Kaloum</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Navigation size={14} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Destination</p>
                          <p className="text-white font-bold text-sm">Marché Madina</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-3">
                        <img src="https://i.pravatar.cc/150?u=p1" className="w-10 h-10 rounded-xl border border-amber-500/30" />
                        <div>
                          <p className="text-white font-bold text-xs uppercase">Siba Kolié</p>
                          <div className="flex items-center gap-1">
                            <Star size={10} className="fill-amber-500 text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400">4.9 • 128 trajets</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-500/70 font-bold italic">"Besoin d'aller vite à Madina !"</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="gold" className="flex-1 py-4 font-black shadow-lg shadow-amber-500/20 group">
                      ACCEPTER L'OFFRE <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="danger" className="flex-[0.5] py-4 font-black">IGNORER</Button>
                  </div>
                </Card>

                {/* Second Offer */}
                <Card className="border-slate-800 bg-slate-900/30 p-6 opacity-80 hover:opacity-100 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Badge color="blue" className="px-3 py-1 text-[9px] font-black tracking-widest">STANDARD</Badge>
                      <span className="text-[10px] text-slate-500 font-black uppercase italic">Tronçon: Kaloum → Dixinn</span>
                    </div>
                    <p className="text-white font-black text-xl tracking-tighter">6.000 FG</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/150?u=p2" className="w-8 h-8 rounded-full border-2 border-[#0b0f19]" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#0b0f19] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">+1</div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">2 Passagers • 1.2 km</p>
                    </div>
                    <Button variant="midnight" className="px-6 font-black text-xs uppercase">VOIR DÉTAILS</Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Performance & Targets */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
              <Target size={18} className="text-blue-500" /> Objectifs Hebdo
            </h4>

            <Card className="p-6 border-slate-800 bg-slate-900/30 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Objectif Gains</p>
                    <p className="text-white font-black italic">500.000 / 800.000 <span className="text-[10px] opacity-50 font-normal">FG</span></p>
                  </div>
                  <Badge color="gold" className="text-[9px]">62%</Badge>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[62%]"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Trajets Objectif</p>
                    <p className="text-white font-black italic">45 / 60 <span className="text-[10px] opacity-50 font-normal">Trips</span></p>
                  </div>
                  <Badge color="blue" className="text-[9px]">75%</Badge>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[75%]"></div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={14} className="text-blue-400" />
                  <p className="text-[10px] text-blue-400 font-black uppercase">Bonus de Fin de Semaine</p>
                </div>
                <p className="text-xs text-slate-400 font-medium">Complétez 15 trajets de plus avant dimanche pour débloquer <span className="text-white font-bold">25.000 FG</span> de bonus.</p>
              </div>
            </Card>

            <h4 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3 pt-4">
              <BarChart3 size={18} className="text-emerald-500" /> Rapport Hebdomadaire
            </h4>

            <Card className="p-0 border-slate-800 bg-slate-900/30 overflow-hidden">
              <div className="p-6 flex items-end justify-between h-40 gap-2">
                {[45, 78, 52, 90, 65, 82, 30].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-1000 ${i === 3 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-700 opacity-50'}`} 
                      style={{ height: `${val}%` }}
                    ></div>
                    <span className="text-[8px] font-black text-slate-500 uppercase">{['L','M','M','J','V','S','D'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-black uppercase">Total Semaine</p>
                <p className="text-sm font-black text-white italic">1.250.000 FG</p>
              </div>
            </Card>

            <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4">
               <div className="flex items-center gap-3">
                  <Info size={16} className="text-amber-500" />
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Conseil d'expert 💨</h5>
               </div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"Les zones de Kaloum vers Madina sont saturées. Essayez de rester sur l'Axe Le Prince pour maximiser vos courses courtes et rapides."</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
      {showPaymentGateway && <PaymentGateway method={selectedPayment} amount={paymentAmount} onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentGateway(false)} />}
      
      {!currentUser ? renderAuth() : (
        <>
            <div className={`fixed inset-y-0 left-0 bg-[#0f172a] w-72 border-r border-slate-800/50 z-50 flex flex-col hidden lg:flex shadow-2xl`}>
              <div className="p-10 flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                  <Zap size={24} className="text-slate-900" />
                </div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">WONKHAI<br/>💨</h1>
              </div>
              <div className="px-6 mb-8">
                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-3 hover:border-amber-500/30 transition-all cursor-default">
                    {renderAvatar(currentUser)}
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">{currentUser.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{currentUser.role === 'DRIVER' ? 'Pilote' : 'Passager'}</p>
                    </div>
                 </div>
              </div>
              <div className="px-6 space-y-3 flex-1">
                <button 
                  onClick={() => setCurrentView('CLIENT')} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'CLIENT' ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  <UserIcon size={20}/> Passager
                </button>
                <button 
                  onClick={() => setCurrentView('DRIVER')} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'DRIVER' ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  <Car size={20}/> Pilote
                </button>
                <button 
                  onClick={() => setCurrentView('WALLET')} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'WALLET' ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  <Wallet size={20}/> Portefeuille
                </button>
                <div className="my-8 border-t border-slate-800/50 mx-4"></div>
                <button 
                  onClick={() => setCurrentView('DOCS')} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'DOCS' ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <FileText size={20}/> Documentation
                </button>
              </div>
              <div className="p-8 border-t border-slate-800/50">
                <button onClick={() => {setCurrentUser(null); setAuthMode('WELCOME');}} className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-red-400 transition-colors">
                  <LogOut size={16}/> Déconnexion
                </button>
              </div>
            </div>

            <main className="flex-1 lg:ml-72 h-screen overflow-hidden bg-[#0b0f19]">
              {currentView === 'CLIENT' && (
                <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden bg-[#0b0f19]">
                  <div className="w-full md:w-[450px] flex flex-col gap-4 overflow-y-auto z-10 custom-scrollbar">
                    <Card className="space-y-6 bg-[#0f172a]/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Nouvelle Course</h2>
                        <Badge color="gold" className="px-4 py-1.5 font-black">{currentUser.balance.toLocaleString()} FG</Badge>
                      </div>
                      {!currentRide ? (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <div className="relative">
                              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-2 tracking-widest">Tronçon de Départ</label>
                              <select 
                                value={originId} 
                                onChange={(e) => setOriginId(e.target.value)} 
                                className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                              >
                                {NEIGHBORHOODS_LIST.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                              </select>
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-2 tracking-widest">Tronçon de Destination</label>
                              <select 
                                value={destId} 
                                onChange={(e) => setDestId(e.target.value)} 
                                className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                              >
                                {NEIGHBORHOODS_LIST.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
                            <button 
                              onClick={() => { setSelectedVehicle('VOITURE'); setSelectedCategory('STANDARD'); }} 
                              className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all duration-300 ${selectedVehicle === 'VOITURE' ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-white'}`}
                            >
                              <Car size={20}/> Voiture
                            </button>
                            <button 
                              onClick={() => { setSelectedVehicle('MOTO'); setSelectedCategory('MOTO_SINGLE'); }} 
                              className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all duration-300 ${selectedVehicle === 'MOTO' ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-white'}`}
                            >
                              <Bike size={20}/> Moto
                            </button>
                          </div>
                          {selectedVehicle === 'VOITURE' && (
                            <div className="grid grid-cols-1 gap-2">
                              {(['STANDARD', 'LUXE', 'VIP'] as RideCategory[]).map((cat) => (
                                <button 
                                  key={cat} 
                                  onClick={() => setSelectedCategory(cat)} 
                                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left group ${selectedCategory === cat ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                                >
                                  <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl transition-all duration-300 ${selectedCategory === cat ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                      {cat === 'VIP' ? <Star size={22}/> : cat === 'LUXE' ? <TrendingUp size={22}/> : <Users size={22}/>}
                                    </div>
                                    <div>
                                      <p className={`font-black text-sm uppercase tracking-tight ${selectedCategory === cat ? 'text-amber-500' : 'text-white'}`}>{CATEGORIES_CONFIG[cat].label}</p>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{CATEGORIES_CONFIG[cat].desc}</p>
                                    </div>
                                  </div>
                                  <Badge color={selectedCategory === cat ? 'gold' : 'slate'} className="font-black px-3">{CATEGORIES_CONFIG[cat].capacity}</Badge>
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block tracking-widest">Mode de Paiement</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                {id:'ESPECE',l:'Espèce',i:<Wallet size={16}/>},
                                {id:'ORANGE_MONEY',l:'OM',i:<Zap size={16}/>},
                                {id:'WAVE',l:'Wave',i:<Smartphone size={16}/>},
                                {id:'VISA',l:'VISA',i:<CreditCard size={16}/>}
                              ].map((m) => (
                                <button 
                                  key={m.id} 
                                  onClick={() => setSelectedPayment(m.id as PaymentMethod)} 
                                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-[11px] font-black uppercase transition-all duration-300 ${selectedPayment === m.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white'}`}
                                >
                                  {m.i}
                                  <span className="tracking-widest">{m.l}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex justify-between items-center shadow-inner">
                            <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Estimation Tarif</p>
                              <p className="text-4xl font-black text-white italic tracking-tighter">{finalPrice.toLocaleString()} <span className="text-xs text-emerald-500 not-italic font-bold">FG</span></p>
                            </div>
                            <div className="text-right text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-tighter">
                              Tronçon: {origin.name}<br/>
                              <ArrowRight size={10} className="inline mx-1 text-amber-500" /> 
                              {destination.name}
                            </div>
                          </div>
                          <Button onClick={handleBookRide} variant="gold" className="w-full py-5 text-lg font-black shadow-2xl shadow-amber-500/20 group">
                            COMMANDER MAINTENANT <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform"/>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-8 text-center animate-fadeIn py-4">
                           {currentRide.status === 'SEARCHING' ? (
                               <div className="flex flex-col items-center py-12">
                                   <div className="relative mb-8">
                                       <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                       <div className="absolute inset-0 flex items-center justify-center">
                                           <Zap size={24} className="text-amber-500 animate-pulse" />
                                       </div>
                                   </div>
                                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Recherche Pilote Wonkhai...</h3>
                                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3">Sécurisation du trajet 💨 active</p>
                               </div>
                           ) : (
                               <div className="space-y-6 text-left p-6 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-xl">
                                   <div className="flex justify-between items-center mb-6">
                                       <Badge color={currentRide.status === 'COMPLETED' ? 'green' : 'gold'} className="px-4 py-1.5 font-black tracking-widest uppercase">{currentRide.status}</Badge>
                                       <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] italic">{currentRide.category}</span>
                                   </div>
                                   <div className="space-y-4 relative">
                                       <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-slate-800"></div>
                                       <div className="flex items-center gap-5 relative z-10">
                                           <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-4 border-[#0f172a]"></div>
                                           <div>
                                               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Départ</p>
                                               <p className="text-white font-bold text-base leading-tight">{currentRide.origin}</p>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-5 relative z-10">
                                           <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-4 border-[#0f172a]"></div>
                                           <div>
                                               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Destination</p>
                                               <p className="text-white font-bold text-base leading-tight">{currentRide.destination}</p>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-end">
                                       <div>
                                           <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Total Course</p>
                                           <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">{currentRide.price.toLocaleString()} <span className="text-xs">FG</span></p>
                                       </div>
                                       <div className="text-right">
                                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Paiement</p>
                                           <p className="text-xs text-white font-black uppercase italic">{currentRide.paymentMethod.replace('_', ' ')}</p>
                                       </div>
                                   </div>
                                   {currentRide.status === 'ACCEPTED' && (
                                       <Button onClick={() => initiatePayment(currentRide.price)} variant="gold" className="w-full mt-6 font-black py-4 shadow-xl shadow-amber-500/10">PAYER MAINTENANT</Button>
                                   )}
                               </div>
                           )}
                           {currentRide.driverId && (
                             <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50 text-left flex items-center gap-5 animate-fadeIn shadow-lg">
                                {renderAvatar(MOCK_DRIVERS.find(d => d.id === currentRide.driverId)!, 'w-16 h-16')}
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-black text-white text-lg italic tracking-tight uppercase leading-none">{MOCK_DRIVERS.find(d => d.id === currentRide.driverId)?.name}</p>
                                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mt-1">{MOCK_DRIVERS.find(d => d.id === currentRide.driverId)?.plateNumber}</p>
                                    </div>
                                    <div className="bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
                                      <Star size={12} className="fill-amber-500 text-amber-500"/>
                                      <span className="text-xs font-black text-white">{MOCK_DRIVERS.find(d => d.id === currentRide.driverId)?.rating}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-4 mt-3">
                                    <button className="flex-1 py-2 bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800">Message</button>
                                    <button className="flex-1 py-2 bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800">Appel</button>
                                  </div>
                                </div>
                             </div>
                           )}
                           {aiTip && (
                             <div className="text-xs text-blue-200/90 text-left p-5 bg-blue-600/5 rounded-3xl border border-blue-500/20 italic font-medium leading-relaxed relative overflow-hidden group">
                               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                               <Zap size={14} className="text-blue-400 mb-2 opacity-50" />
                               "{aiTip}"
                             </div>
                           )}
                           <Button variant="danger" className="w-full mt-4 font-black py-4 uppercase tracking-[0.2em] text-[10px]" onClick={() => setCurrentRide(null)}>ANNULER LA COURSE</Button>
                        </div>
                      )}
                    </Card>
                  </div>
                  <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800/50 relative z-0">
                    <MapComponent drivers={drivers} originCoords={origin} destCoords={currentRide ? destination : null} status={currentRide?.status || 'IDLE'} assignedDriverId={currentRide?.driverId} />
                  </div>
                </div>
              )}

              {currentView === 'DRIVER' && renderDriverDashboard()}
              {currentView === 'WALLET' && renderWallet()}
              {currentView === 'DOCS' && <div className="h-full overflow-auto"><DocsView /></div>}
            </main>
        </>
      )}
    </div>
  );
}
