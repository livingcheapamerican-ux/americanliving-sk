import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Key, 
  ArrowRight, 
  Video, 
  FileText, 
  Settings, 
  ShieldCheck, 
  CreditCard, 
  Mail, 
  Smartphone, 
  Sparkles, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  DollarSign,
  AlertTriangle,
  Play,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

// Obrázky z base44 archívu - dom s bazénom (Barnbazen) a ďalšie fotky
const HOUSE_PHOTOS = [
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/cbd41c122_Barnbazen.jpeg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/5ddf7431e_BarnDoubledrevouvodnafotka.jpg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/49133a5d4_Barnhills.jpeg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/24cecde9d_BarnZilina.jpeg"
];

const INITIAL_PROPERTIES = {
  komarno: {
    id: 'komarno',
    name: "Showroom Komárno - Barn House s bazénom",
    location: "Komárno",
    status: "pripravujeme",
    desc: "Luxusný celoročný modulárny dom typu Barn House s veľkými presklenými plochami. Tento showroom disponuje krásnym zapusteným bazénom a saunou. Všetko sa nachádza v tichej prírode, kde si môžete na vlastnej koži otestovať technológie a komfort nášho bývania.",
    price: 120,
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    partnerEmail: "partner.komarno@americanliving.sk",
    iban: "SK1281300000002938475628",
    bic: "SUBASKBX",
    accountName: "Modular Living Partner Komárno s.r.o.",
    prepayPercent: 50,
    stornoDays: 7,
    stornoRefund: 100,
    vop: "Tieto obchodné podmienky upravujú podmienky prenájmu predvádzacieho domu Showroom Komárno. Nájomca je povinný dodržiavať domový poriadok, nočný kľud a odovzdať objekt v stave, v akom ho prevzal. Storno rezervácie je možné bezplatne do 7 dní pred nástupom."
  },
  levoca: {
    id: 'levoca',
    name: "Showroom Levoča - Rodinný Prefab",
    location: "Okolie Levoče",
    status: "pripravujeme",
    desc: "Útulný montovaný rodinný dom zasadený do krásnej prírody Spiša. Ideálny pre rodiny, ktoré chcú zažiť zdravú klímu, ekologické materiály a špičkovú tepelnú izoláciu pred samotným rozhodnutím o kúpe.",
    price: 140,
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    partnerEmail: "partner.levoca@americanliving.sk",
    iban: "SK4911000000002621543789",
    bic: "TATRASKBX",
    accountName: "Spiš Prefab Partner s.r.o.",
    prepayPercent: 30,
    stornoDays: 14,
    stornoRefund: 50,
    vop: "Všeobecné obchodné podmienky pre Showroom Levoča. Rezervácia je platná po uhradení zálohy vo výške 30%. Storno 14 dní pred nástupom garantuje vrátenie 50% zo zaplatenej zálohy. V prípade neskoršieho storna záloha prepadá."
  }
};

const INITIAL_PARTNERS = [
  { email: "partner.komarno@americanliving.sk", password: "partner", name: "Partner Komárno s.r.o.", propertyId: "komarno" },
  { email: "partner.levoca@americanliving.sk", password: "partner", name: "Spiš Prefab Partner s.r.o.", propertyId: "levoca" }
];

export default function Showroom() {
  // --- STATE ---
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('al_showroom_properties');
    let parsed = saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    if (parsed.komarno && (parsed.komarno.desc.includes("vodnej ploche") || parsed.komarno.desc.includes("pri vode"))) {
      parsed.komarno.desc = INITIAL_PROPERTIES.komarno.desc;
    }
    return parsed;
  });
  
  const [partners, setPartners] = useState(() => {
    const saved = localStorage.getItem('al_showroom_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('al_showroom_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  const [emails, setEmails] = useState(() => {
    const saved = localStorage.getItem('al_showroom_emails');
    return saved ? JSON.parse(saved) : [];
  });

  // Klientsky state
  const [selectedLoc, setSelectedLoc] = useState('komarno');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  // Dátumy výberu (Kalendár)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Partnerský Auth a Panel
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'partner'
  const [partnerLoggedIn, setPartnerLoggedIn] = useState(null); // partner objekt
  const [pEmail, setPEmail] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pName, setPName] = useState('');
  const [pProperty, setPProperty] = useState('komarno');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Nastavenia v dashboarde partnera
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState(100);
  const [editVideo, setEditVideo] = useState('');
  const [editIban, setEditIban] = useState('');
  const [editBic, setEditBic] = useState('');
  const [editAccName, setEditAccName] = useState('');
  const [editPrepay, setEditPrepay] = useState(50);
  const [editStornoDays, setEditStornoDays] = useState(7);
  const [editStornoRefund, setEditStornoRefund] = useState(100);
  const [editVop, setEditVop] = useState('');

  // Simulácia času
  const [simulatedTimeOffset, setSimulatedTimeOffset] = useState(() => {
    const saved = localStorage.getItem('al_showroom_time_offset');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Zobrazenie predfaktúry
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- SAVE TO LOCALSTORAGE ON CHANGES ---
  useEffect(() => {
    localStorage.setItem('al_showroom_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('al_showroom_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('al_showroom_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('al_showroom_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('al_showroom_time_offset', simulatedTimeOffset.toString());
  }, [simulatedTimeOffset]);

  // --- CURRENT SIMULATED TIME ---
  const getSimulatedNow = () => {
    return new Date(Date.now() + simulatedTimeOffset);
  };

  // --- AUTO-CANCELLATION LOOP ---
  useEffect(() => {
    const checkExpirations = () => {
      const now = getSimulatedNow();
      let changed = false;
      const updatedReservations = reservations.map(res => {
        if (res.status === 'schvalena' && res.approved_at) {
          const approvedTime = new Date(res.approved_at);
          const limitTime = new Date(approvedTime.getTime() + 24 * 60 * 60 * 1000);
          
          if (now > limitTime) {
            changed = true;
            
            const property = properties[res.propertyId];
            const systemEmail = {
              id: Date.now() + Math.random(),
              from: 'info@americanliving.sk',
              to: res.clientEmail,
              subject: `⚠️ Rezervácia zrušená - Vypršal časový limit (VS: ${res.variableSymbol})`,
              body: `Dobrý deň,\n\nVaša rezervácia showroomu v lokalite ${property.location} na termín ${res.startDate} až ${res.endDate} bola automaticky zrušená, pretože sme nezaznamenali úhradu zálohy vo výške ${res.depositAmount} EUR do 24 hodín od schválenia.\n\nAk máte stále záujem o vyskúšanie domu, urobte prosím novú rezerváciu.\n\nS pozdravom,\nTím American Living s.r.o.`,
              sentAt: getSimulatedNow().toLocaleString()
            };

            const partnerEmail = {
              id: Date.now() + Math.random() + 1,
              from: 'info@americanliving.sk',
              to: property.partnerEmail,
              subject: `⚠️ Rezervácia klienta ${res.clientName} bola stornovaná`,
              body: `Dobrý deň,\n\nRezervácia na termín ${res.startDate} až ${res.endDate} pre klienta ${res.clientName} bola automaticky zrušená z dôvodu neuhradenia zálohy do 24 hodín.\nTermíny boli uvoľnené pre ďalších záujemcov.\n\nS pozdravom,\nAmerican Living Systém`,
              sentAt: getSimulatedNow().toLocaleString()
            };

            setEmails(prev => [systemEmail, partnerEmail, ...prev]);
            
            base44.integrations.Core.SendEmail({
              to: res.clientEmail,
              subject: systemEmail.subject,
              body: systemEmail.body
            }).catch(err => console.log(err));

            base44.integrations.Core.SendEmail({
              to: property.partnerEmail,
              subject: partnerEmail.subject,
              body: partnerEmail.body
            }).catch(err => console.log(err));

            return { ...res, status: 'zrusena_vyprsal_limit', cancelled_at: now.toISOString() };
          }
        }
        return res;
      });

      if (changed) {
        setReservations(updatedReservations);
        toast.info('Rezervácie bez úhrady boli stornované po 24 hodinách.');
      }
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 10000);
    return () => clearInterval(interval);
  }, [reservations, properties, simulatedTimeOffset]);

  // --- INITIALIZE EDIT FORMS ---
  useEffect(() => {
    if (partnerLoggedIn) {
      const prop = properties[partnerLoggedIn.propertyId] || {};
      setEditDesc(prop.desc || '');
      setEditPrice(prop.price || 100);
      setEditVideo(prop.video || '');
      setEditIban(prop.iban || '');
      setEditBic(prop.bic || '');
      setEditAccName(prop.accountName || '');
      setEditPrepay(prop.prepayPercent || 50);
      setEditStornoDays(prop.stornoDays || 7);
      setEditStornoRefund(prop.stornoRefund || 100);
      setEditVop(prop.vop || '');
    }
  }, [partnerLoggedIn, properties]);

  const formatDateString = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const isDateBooked = (date, propertyId) => {
    const dateStr = formatDateString(date);
    return reservations.some(res => 
      res.propertyId === propertyId && 
      (res.status === 'schvalena' || res.status === 'zaplatena') &&
      dateStr >= res.startDate && dateStr <= res.endDate
    );
  };

  const isDateSelectedRange = (date) => {
    if (!startDate) return false;
    const dateStr = formatDateString(date);
    const startStr = formatDateString(startDate);
    if (!endDate) return dateStr === startStr;
    const endStr = formatDateString(endDate);
    return dateStr >= startStr && dateStr <= endStr;
  };

  const handleDateClick = (date, propertyId) => {
    if (isDateBooked(date, propertyId)) {
      toast.error('Tento termín je obsadený.');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
      let hasBookedInRange = false;
      let checkDate = new Date(startDate.getTime());
      while (checkDate <= date) {
        if (isDateBooked(checkDate, propertyId)) {
          hasBookedInRange = true;
          break;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }

      if (hasBookedInRange) {
        toast.error('Interval obsahuje obsadené dni.');
        return;
      }
      setEndDate(date);
    }
  };

  const handleClientBookingSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Zvoľte pobyt v kalendári.');
      return;
    }
    if (!clientName || !clientEmail || !clientPhone) {
      toast.error('Vyplňte kontaktné údaje.');
      return;
    }

    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const diffNights = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const prop = properties[selectedLoc];
    const totalPrice = diffNights * prop.price;
    const depositAmount = parseFloat(((totalPrice * prop.prepayPercent) / 100).toFixed(2));

    const newRes = {
      id: 'res_' + Date.now(),
      propertyId: selectedLoc,
      clientName,
      clientEmail,
      clientPhone,
      clientNote,
      startDate: startStr,
      endDate: endStr,
      nights: diffNights,
      totalPrice,
      depositAmount,
      prepayPercent: prop.prepayPercent,
      status: 'cakajuca',
      created_at: getSimulatedNow().toISOString()
    };

    setReservations(prev => [newRes, ...prev]);

    const emailToPartner = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: prop.partnerEmail,
      subject: `📧 Nová rezervácia Showroomu - ${prop.location} (${startStr} až ${endStr})`,
      body: `Dobrý deň,\n\nNa vašej nehnuteľnosti ${prop.name} pribudol nový dopyt o rezerváciu:\n\nKlient: ${clientName}\nEmail: ${clientEmail}\nTelefón: ${clientPhone}\nTermín: ${startStr} až ${endStr} (${diffNights} nocí)\nCelková cena: ${totalPrice} EUR\nZáloha na úhradu (${prop.prepayPercent}%): ${depositAmount} EUR\nPoznámka: ${clientNote || 'bez poznámky'}\n\nPrihláste sa do partnerskej zóny na našom webe a schváľte alebo zamietnite túto rezerváciu.\n\nS pozdravom,\nAmerican Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString()
    };

    setEmails(prev => [emailToPartner, ...prev]);

    base44.integrations.Core.SendEmail({
      to: prop.partnerEmail,
      subject: emailToPartner.subject,
      body: emailToPartner.body
    }).catch(err => console.log(err));

    toast.success('Rezervačný dopyt bol úspešne odoslaný.');
    
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientNote('');
    setStartDate(null);
    setEndDate(null);
  };

  const handlePartnerLogin = (e) => {
    e.preventDefault();
    const found = partners.find(p => p.email.toLowerCase() === pEmail.toLowerCase() && p.password === pPassword);
    if (found) {
      setPartnerLoggedIn(found);
      toast.success(`Prihlásený: ${found.name}`);
    } else {
      toast.error('Nesprávne údaje.');
    }
  };

  const handlePartnerRegister = (e) => {
    e.preventDefault();
    if (!pEmail || !pPassword || !pName) {
      toast.error('Vyplňte polia.');
      return;
    }
    if (partners.some(p => p.email.toLowerCase() === pEmail.toLowerCase())) {
      toast.error('Partner už existuje.');
      return;
    }

    const newPartner = {
      email: pEmail,
      password: pPassword,
      name: pName,
      propertyId: pProperty
    };

    setPartners(prev => [...prev, newPartner]);
    setPartnerLoggedIn(newPartner);
    toast.success('Partner bol úspešne zaregistrovaný.');
    setIsRegistering(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!editIban) {
      toast.error('Vyplňte IBAN.');
      return;
    }

    const propId = partnerLoggedIn.propertyId;
    setProperties(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        desc: editDesc,
        price: parseFloat(editPrice),
        video: editVideo,
        iban: editIban,
        bic: editBic,
        accountName: editAccName,
        prepayPercent: parseFloat(editPrepay),
        stornoDays: parseInt(editStornoDays, 10),
        stornoRefund: parseInt(editStornoRefund, 10),
        vop: editVop
      }
    }));

    toast.success('Nastavenia uložené.');
  };

  const handleApproveReservation = (resId) => {
    const res = reservations.find(r => r.id === resId);
    const prop = properties[res.propertyId];

    if (!prop.iban || !prop.accountName) {
      toast.error('Vyplňte najskôr platobné údaje v nastaveniach!');
      return;
    }

    const vs = '2026' + String(reservations.length).padStart(4, '0');
    
    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { 
          ...r, 
          status: 'schvalena', 
          approved_at: getSimulatedNow().toISOString(),
          variableSymbol: vs,
          iban: prop.iban,
          bic: prop.bic,
          accountName: prop.accountName,
          prepayPercent: prop.prepayPercent,
          stornoDays: prop.stornoDays,
          stornoRefund: prop.stornoRefund,
          vop: prop.vop
        };
      }
      return r;
    });
    setReservations(updated);

    const sepaCode = `SPD*1.0*ACC:${prop.iban}*AM:${res.depositAmount}*CUR:EUR*VS:${vs}*MSG:Zaloha za Showroom ${prop.location}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(sepaCode)}`;

    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `✅ Rezervácia schválená - Predfaktúra č. ${vs}`,
      body: `Dobrý deň ${res.clientName},\n\nVaša žiadosť o rezerváciu showroomu ${prop.name} na termín ${res.startDate} až ${res.endDate} bola schválená majiteľom nehnuteľnosti.\n\nPre potvrdenie rezervácie je potrebné zaplatiť zálohu vo výške ${prop.prepayPercent}% z celkovej ceny pobytu.\n\nÚDAJE PRE PLATBU:\n--------------------\nCelková suma pobytu: ${res.totalPrice} EUR\nSuma zálohy (k úhrade): ${res.depositAmount} EUR\nČíslo účtu (IBAN): ${prop.iban}\nBIC / SWIFT: ${prop.bic || 'nešpecifikované'}\nNázov účtu: ${prop.accountName}\nVariabilný symbol (VS): ${vs}\nSpráva pre príjemcu: Zaloha za Showroom ${prop.location}\n\n⚠️ DÔLEŽITÉ UPOZORNENIE:\nPlatbu je nutné vykonať do 24 hodín od tohto schválenia, inak bude vaša rezervácia automaticky stornovaná.\n\nS pozdravom,\nAmerican Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString(),
      qrCodeUrl: qrUrl
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log(err));

    toast.success('Rezervácia schválená, predfaktúra odoslaná.');
  };

  const handleRejectReservation = (resId) => {
    const res = reservations.find(r => r.id === resId);
    const prop = properties[res.propertyId];

    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { ...r, status: 'zamietnuta', rejected_at: getSimulatedNow().toISOString() };
      }
      return r;
    });
    setReservations(updated);

    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `❌ Rezervácia showroomu zamietnutá`,
      body: `Dobrý deň ${res.clientName},\n\nVaša žiadosť o rezerváciu predvádzacieho showroomu v lokalite ${prop.location} na termín ${res.startDate} až ${res.endDate} bola zamietnutá majiteľom.\n\nS pozdravom,\nTím American Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString()
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log(err));

    toast.error('Rezervácia zamietnutá.');
  };

  const handleMarkAsPaid = (resId) => {
    const res = reservations.find(r => r.id === resId);
    const prop = properties[res.propertyId];

    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { ...r, status: 'zaplatena', paid_at: getSimulatedNow().toISOString() };
      }
      return r;
    });
    setReservations(updated);

    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `🎉 Platba prijatá - Potvrdenie rezervácie Showroomu (VS: ${res.variableSymbol})`,
      body: `Dobrý deň ${res.clientName},\n\nS radosťou vám oznamujeme, že sme prijali vašu zálohu vo výške ${res.depositAmount} EUR pre rezerváciu showroomu ${prop.name} na termín ${res.startDate} až ${res.endDate}.\n\nVaša rezervácia je odteraz plne záväzná.\n\nStorno podmienky:\nBezplatné zrušenie do ${prop.stornoDays} dní pred príchodom so vrátením ${prop.stornoRefund}% zálohy.\n\nVšeobecné podmienky partnera:\n${prop.vop}\n\nS pozdravom,\nAmerican Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString()
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log(err));

    toast.success('Platba zaznamenaná, rezervácia potvrdená.');
  };

  const handleSimulateTimeJump = (hours) => {
    setSimulatedTimeOffset(prev => prev + hours * 60 * 60 * 1000);
    toast.success(`Simulovaný čas posunutý o +${hours} hodín.`);
  };

  const handleResetTime = () => {
    setSimulatedTimeOffset(0);
    toast.success('Simulovaný čas bol resetovaný.');
  };

  const getRemainingTimeText = (res) => {
    if (!res.approved_at) return '';
    const approvedTime = new Date(res.approved_at);
    const limitTime = new Date(approvedTime.getTime() + 24 * 60 * 60 * 1000);
    const now = getSimulatedNow();
    const diffMs = limitTime - now;

    if (diffMs <= 0) return 'Expirované';

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-hidden transition-colors duration-300">
      
      {/* 1. VRSTVA (SPODNÁ) - LOOPING VIDEO DETÍ V BAZÉNE */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden select-none pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-[1.02] filter brightness-[0.3] contrast-[1.05] saturate-[0.8]"
        >
          <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
        </video>
        {/* Tmavý prekrývajúci filter pre vynikajúcu čitateľnosť textu na vrstve 2 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90 backdrop-blur-[3px]" />
      </div>

      {/* 2. VRSTVA (HORNÁ) - PREMIUM GLASSMORPHIC UI */}
      <div className="relative z-10">
        
        {/* HERO HEADER */}
        <div className="relative pt-20 pb-16 px-4 text-center">
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 backdrop-blur-md animate-pulse">
              <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#E2C799] uppercase">Imersívne 2-vrstvové zobrazenie</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-2xl">
              Rezidenčné Showroomy <span className="bg-gradient-to-r from-[#C5A880] via-[#E2C799] to-[#C5A880] bg-clip-text text-transparent">American Living</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              Pozrite si fotky našich domov z base44 archívu, vyberte si termín v kalendári a vyskúšajte si celoročné bývanie s bazénom a saunou na vlastnej koži.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                onClick={() => setActiveTab('client')}
                className={`rounded-xl px-7 py-6 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border ${
                  activeTab === 'client' 
                    ? 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-slate-950 border-[#C5A880] shadow-[0_0_30px_rgba(197,168,128,0.35)]' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 backdrop-blur-md'
                }`}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Vstúpiť do rezervácií
              </Button>
              <Button 
                onClick={() => setActiveTab('partner')}
                className={`rounded-xl px-7 py-6 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border ${
                  activeTab === 'partner' 
                    ? 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-slate-950 border-[#C5A880] shadow-[0_0_30px_rgba(197,168,128,0.35)]' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 backdrop-blur-md'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Vstup pre partnerov
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="container mx-auto px-4 max-w-6xl pb-16">
          
          {/* CLIENT TAB */}
          {activeTab === 'client' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: LOCATIONS & ARCHIVE PHOTOS */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Location selector cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(properties).map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        setSelectedLoc(prop.id);
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className={`flex flex-col p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                        selectedLoc === prop.id 
                          ? 'border-[#C5A880] bg-slate-900/60 shadow-[0_12px_40px_rgba(197,168,128,0.15)] scale-[1.01]' 
                          : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/40 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-1 text-xs text-[#C5A880] font-black uppercase tracking-wider">
                          <MapPin className="w-4 h-4" />
                          {prop.location}
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-wider py-0.5 px-2">
                          Pripravujeme
                        </Badge>
                      </div>
                      <h3 className="font-black text-lg text-white leading-snug mb-2">{prop.name}</h3>
                      <div className="flex justify-between items-end mt-4 pt-3 border-t border-white/5 w-full">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cena za noc:</span>
                        <span className="text-[#C5A880] font-black text-lg">{prop.price} EUR</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Main details with Base44 Photo Gallery */}
                {(() => {
                  const prop = properties[selectedLoc];
                  return (
                    <Card className="border-white/10 bg-slate-900/45 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                      
                      {/* Base44 House Photo Gallery (Layered Photo Slider) */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 border-b border-white/10 group">
                        <img 
                          src={HOUSE_PHOTOS[activePhotoIndex]} 
                          alt="Fotka domu s bazénom" 
                          className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90 pointer-events-none" />
                        
                        {/* Photo indicators */}
                        <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                          {HOUSE_PHOTOS.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                                activePhotoIndex === idx 
                                  ? 'bg-[#C5A880] border-[#C5A880] scale-110' 
                                  : 'bg-black/50 border-white/30 hover:border-white'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Prev/Next arrows */}
                        <button
                          onClick={() => setActivePhotoIndex(prev => (prev - 1 + HOUSE_PHOTOS.length) % HOUSE_PHOTOS.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full border border-white/10 z-20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex(prev => (prev + 1) % HOUSE_PHOTOS.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full border border-white/10 z-20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="absolute top-4 right-4 z-20">
                          <Badge className="bg-[#C5A880] text-slate-950 font-black text-[9px] uppercase tracking-wider py-1 px-3 border border-[#C5A880] flex items-center gap-1 shadow-lg">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Archív fotiek domu
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="pt-6 border-b border-white/5">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <CardTitle className="text-xl sm:text-2xl font-black text-white">{prop.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 mt-1 font-bold text-[10px] sm:text-xs text-slate-450 uppercase tracking-wider">
                              <span>Partner American Living s.r.o.</span>
                              <span>•</span>
                              <span className="text-[#C5A880]">{prop.location}</span>
                            </CardDescription>
                          </div>
                          <div className="bg-slate-950/60 border border-white/5 rounded-2xl px-5 py-3 text-right">
                            <div className="text-2xl font-black text-[#C5A880] leading-none">{prop.price} EUR</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">za jednu noc</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-6 space-y-6">
                        {/* Description */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A880]">Popis a výbava objektu</h4>
                          <p className="text-sm text-slate-300 leading-relaxed font-light">{prop.desc}</p>
                        </div>

                        {/* Video */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Prezentačné video
                          </h4>
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
                            {prop.video ? (
                              <iframe 
                                src={prop.video} 
                                title={prop.name}
                                className="absolute inset-0 w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Video className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
                                <span className="text-xs">Video nie je k dispozícii</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Policies */}
                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 border-b border-white/5 pb-2">
                            <FileText className="w-4 h-4 text-[#C5A880]" />
                            Zmluvné a storno podmienky
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Storno lehota</p>
                              <p className="text-slate-200 mt-1 font-bold text-sm">Do {prop.stornoDays} dní pred príchodom</p>
                            </div>
                            <div>
                              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Navrátenie platby</p>
                              <p className="text-slate-200 mt-1 font-bold text-sm">Vrátenie {prop.stornoRefund}% zo zálohy</p>
                            </div>
                          </div>
                          {prop.vop && (
                            <div className="pt-3 border-t border-white/5">
                              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1">Obchodné podmienky partnera (VOP)</p>
                              <p className="text-slate-350 leading-relaxed text-xs font-light line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                {prop.vop}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

              </div>

              {/* RIGHT COLUMN: CALENDAR & FORM */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Calendar */}
                <Card className="border-white/10 bg-slate-900/45 backdrop-blur-xl rounded-3xl shadow-2xl">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-black uppercase tracking-wider">Dostupnosť & Termíny</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">Označte požadované dátumy pobytu</CardDescription>
                    </div>
                    <CalendarIcon className="w-5 h-5 text-[#C5A880]" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    
                    <div className="flex justify-between items-center mb-4 bg-slate-950/60 p-2 rounded-xl border border-white/5">
                      <button 
                        onClick={() => {
                          const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                          setCurrentMonth(prev);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                        {currentMonth.toLocaleString('sk-SK', { month: 'long', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => {
                          const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                          setCurrentMonth(next);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      <span>Po</span><span>Ut</span><span>St</span><span>Št</span><span>Pi</span><span>So</span><span>Ne</span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const days = getDaysInMonth(currentMonth);
                        const firstDayIndex = (days[0].getDay() + 6) % 7;
                        const emptyCells = Array.from({ length: firstDayIndex });
                        
                        return (
                          <>
                            {emptyCells.map((_, i) => <div key={`empty-${i}`} />)}
                            {days.map((day) => {
                              const isBooked = isDateBooked(day, selectedLoc);
                              const isSelected = isDateSelectedRange(day);
                              const isToday = formatDateString(day) === formatDateString(getSimulatedNow());
                              
                              return (
                                <button
                                  key={day.toISOString()}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => handleDateClick(day, selectedLoc)}
                                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-bold border ${
                                    isBooked 
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-[#C5A880] text-slate-950 border-[#C5A880] shadow-[0_0_15px_rgba(197,168,128,0.4)] scale-105' 
                                        : 'bg-slate-950/20 border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300'
                                  } ${isToday ? 'border-blue-500' : ''}`}
                                >
                                  <span>{day.getDate()}</span>
                                  {isBooked && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-0.5" />}
                                  {isSelected && !isBooked && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mt-0.5" />}
                                </button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex gap-4 justify-center items-center mt-5 text-[9px] text-slate-400 font-black uppercase tracking-widest border-t border-white/5 pt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#C5A880]" />
                        <span>Vybraté</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30" />
                        <span>Obsadené</span>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Booking Form */}
                <Card className="border-white/10 bg-slate-900/45 backdrop-blur-xl rounded-3xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg font-black uppercase tracking-wider">Rezervačný dopyt</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {startDate && endDate 
                        ? `Zvolený termín: ${formatDateString(startDate)} až ${formatDateString(endDate)}` 
                        : 'Vyberte dni v kalendári.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleClientBookingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1">Meno a priezvisko *</label>
                        <input 
                          type="text" 
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="napr. Ján Kováč"
                          className="w-full bg-slate-950/65 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1">E-mail *</label>
                          <input 
                            type="email" 
                            required
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="jan.kovac@example.com"
                            className="w-full bg-slate-950/65 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1">Telefón *</label>
                          <input 
                            type="tel" 
                            required
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="+421 900 000 000"
                            className="w-full bg-slate-950/65 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1">Poznámka k dopytu</label>
                        <textarea 
                          rows="2"
                          value={clientNote}
                          onChange={(e) => setClientNote(e.target.value)}
                          placeholder="Požiadavky alebo doplňujúce otázky..."
                          className="w-full bg-slate-950/65 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors resize-none"
                        />
                      </div>

                      {startDate && endDate && (
                        <div className="bg-[#C5A880]/10 border border-[#C5A880]/20 rounded-xl p-4 text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Počet nocí:</span>
                            <span className="font-bold text-white">{Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))} nocí</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cena za noc:</span>
                            <span className="font-bold text-white">{properties[selectedLoc].price} EUR</span>
                          </div>
                          <div className="flex justify-between border-t border-[#C5A880]/30 pt-2 text-sm text-slate-200">
                            <span className="font-bold">Celkom:</span>
                            <span className="font-black text-[#C5A880]">
                              {Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) * properties[selectedLoc].price} EUR
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500 mt-1">
                            <span>Záloha na platbu ({properties[selectedLoc].prepayPercent}%):</span>
                            <span className="font-bold">
                              {((Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) * properties[selectedLoc].price * properties[selectedLoc].prepayPercent) / 100).toFixed(2)} EUR
                            </span>
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={!startDate || !endDate}
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg border border-red-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Odoslať dopyt na schválenie</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* PARTNER TAB */}
          {activeTab === 'partner' && (
            <div className="max-w-4xl mx-auto">
              
              {!partnerLoggedIn ? (
                <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10">
                  <div className="text-center mb-8 max-w-md mx-auto">
                    <ShieldCheck className="w-12 h-12 text-[#C5A880] mx-auto mb-3" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">Portál pre partnerov</h2>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Spravujte a schvaľujte rezervácie vašich zážitkových showroomov.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Login */}
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-4">Prihlásenie</h3>
                      <form onSubmit={handlePartnerLogin} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">E-mail partnera</label>
                          <input 
                            type="email" 
                            required
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            placeholder="partner@americanliving.sk"
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">Heslo</label>
                          <input 
                            type="password" 
                            required
                            value={pPassword}
                            onChange={(e) => setPPassword(e.target.value)}
                            placeholder="Heslo"
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-[#C5A880] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#C5A880]/90">
                          Vstúpiť do správy
                        </Button>
                      </form>
                      
                      <div className="bg-slate-950/70 rounded-xl p-4 mt-6 text-[11px] text-slate-500 space-y-1.5 border border-white/5">
                        <p className="font-bold text-slate-350 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-[#C5A880]" /> Testovacie účty:</p>
                        <p><strong>Komárno:</strong> partner.komarno@americanliving.sk / <code className="bg-white/10 px-1 rounded text-white font-bold">partner</code></p>
                        <p><strong>Levoča:</strong> partner.levoca@americanliving.sk / <code className="bg-white/10 px-1 rounded text-white font-bold">partner</code></p>
                      </div>
                    </div>

                    {/* Register */}
                    <div className="border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-4">Registrácia partnera</h3>
                      <form onSubmit={handlePartnerRegister} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">Spoločnosť / Názov partnera</label>
                          <input 
                            type="text" 
                            required
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="napr. Spišská výstavba s.r.o."
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">E-mail</label>
                          <input 
                            type="email" 
                            required
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            placeholder="email@partner.sk"
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">Heslo</label>
                          <input 
                            type="password" 
                            required
                            value={pPassword}
                            onChange={(e) => setPPassword(e.target.value)}
                            placeholder="Heslo"
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 mb-1">Priradený objekt</label>
                          <select 
                            value={pProperty} 
                            onChange={(e) => setPProperty(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500"
                          >
                            <option value="komarno">Showroom Komárno</option>
                            <option value="levoca">Showroom Levoča</option>
                          </select>
                        </div>
                        <Button type="submit" className="w-full bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/10">
                          Vytvoriť partnerský účet
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              ) : (
                
                /* PARTNER DASHBOARD */
                <div className="space-y-6">
                  
                  {/* Header info bar */}
                  <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#C5A880]/20 flex items-center justify-center border border-[#C5A880]/30 shadow-inner">
                        <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">{partnerLoggedIn.name}</h2>
                        <p className="text-xs text-slate-400">Správa showroomu: <span className="font-bold text-[#E2C799]">{properties[partnerLoggedIn.propertyId].name}</span></p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setPartnerLoggedIn(null)}
                      className="rounded-xl border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-slate-300 font-bold uppercase tracking-wider text-xs px-4"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Odhlásiť sa
                    </Button>
                  </div>

                  {/* Dashboard body */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left side: Reservation Request Manager */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-xl">
                        <CardHeader className="pb-3 border-b border-white/5">
                          <CardTitle className="text-base sm:text-lg font-black uppercase tracking-wider">Klientske rezervácie</CardTitle>
                          <CardDescription className="text-xs text-slate-450">Spravujte dopyty, prezerajte platby a zálohy.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          {reservations.filter(r => r.propertyId === partnerLoggedIn.propertyId).length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs font-medium">
                              Zatiaľ žiadne dopyty pre váš objekt.
                            </div>
                          ) : (
                            reservations
                              .filter(r => r.propertyId === partnerLoggedIn.propertyId)
                              .map((res) => {
                                const isPending = res.status === 'cakajuca';
                                const isApproved = res.status === 'schvalena';
                                const isPaid = res.status === 'zaplatena';
                                const isRejected = res.status === 'zamietnuta';
                                const isExpired = res.status === 'zrusena_vyprsal_limit';

                                return (
                                  <div 
                                    key={res.id} 
                                    className="p-4 rounded-2xl border border-white/5 bg-slate-950/60 space-y-3 relative overflow-hidden text-left"
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider">{res.startDate} až {res.endDate} ({res.nights} nocí)</span>
                                      <div>
                                        {isPending && <Badge className="bg-yellow-600/10 text-yellow-500 border border-yellow-500/20 font-black text-[9px] uppercase tracking-wider">Čaká</Badge>}
                                        {isApproved && <Badge className="bg-blue-600/10 text-blue-500 border border-blue-500/20 font-black text-[9px] uppercase tracking-wider">Schválená</Badge>}
                                        {isPaid && <Badge className="bg-green-600/10 text-green-500 border border-green-500/20 font-black text-[9px] uppercase tracking-wider">Zaplatená</Badge>}
                                        {isRejected && <Badge className="bg-red-600/10 text-red-500 border border-red-500/20 font-black text-[9px] uppercase tracking-wider">Zamietnutá</Badge>}
                                        {isExpired && <Badge className="bg-slate-600/10 text-slate-500 border border-slate-500/20 font-black text-[9px] uppercase tracking-wider">Expirovaná</Badge>}
                                      </div>
                                    </div>

                                    <div className="text-xs space-y-1.5">
                                      <p className="font-extrabold text-sm text-white">{res.clientName}</p>
                                      <p className="text-slate-400">Email: <span className="text-slate-200 font-bold">{res.clientEmail}</span> | Tel: <span className="text-slate-200 font-bold">{res.clientPhone}</span></p>
                                      {res.clientNote && <p className="italic text-slate-450 mt-1 border-l-2 border-[#C5A880]/30 pl-2">„{res.clientNote}“</p>}
                                    </div>

                                    <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                                      <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Celková cena</p>
                                        <p className="font-black text-white text-sm">{res.totalPrice} EUR</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Záloha ({res.prepayPercent || properties[partnerLoggedIn.propertyId].prepayPercent}%)</p>
                                        <p className="font-black text-[#C5A880] text-sm">{res.depositAmount} EUR</p>
                                      </div>
                                    </div>

                                    {isApproved && (
                                      <div className="flex justify-between items-center text-[10px] bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl text-blue-400">
                                        <span>VS: <strong className="text-white font-extrabold">{res.variableSymbol}</strong></span>
                                        <span className="flex items-center gap-1 font-bold">
                                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                                          Platobný limit: {getRemainingTimeText(res)}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                      {isPending && (
                                        <>
                                          <Button 
                                            size="sm"
                                            onClick={() => handleApproveReservation(res.id)}
                                            className="flex-1 bg-green-700 hover:bg-green-600 text-white font-black uppercase tracking-wider text-[10px] rounded-lg"
                                          >
                                            Schváliť & Odoslať QR
                                          </Button>
                                          <Button 
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRejectReservation(res.id)}
                                            className="border-white/10 hover:bg-red-500/15 hover:text-red-500 text-[10px] uppercase font-bold tracking-wider rounded-lg"
                                          >
                                            Zamietnuť
                                          </Button>
                                        </>
                                      )}

                                      {isApproved && (
                                        <>
                                          <Button 
                                            size="sm"
                                            onClick={() => handleMarkAsPaid(res.id)}
                                            className="flex-1 bg-[#C5A880] text-slate-950 font-black uppercase tracking-wider text-[10px] rounded-lg hover:bg-[#C5A880]/90"
                                          >
                                            Potvrdiť prijatie zálohy
                                          </Button>
                                          <Button 
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedInvoice(res)}
                                            className="border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                          >
                                            Zobraziť QR Kód
                                          </Button>
                                        </>
                                      )}

                                      {isPaid && (
                                        <div className="flex items-center gap-1.5 text-green-500 font-extrabold text-[10px] uppercase tracking-wider bg-green-500/5 border border-green-500/15 px-3 py-2.5 rounded-xl w-full justify-center">
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Rezervácia zaplatená & Záväzná</span>
                                        </div>
                                      )}

                                      {isExpired && (
                                        <div className="flex items-center gap-1.5 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl w-full justify-center">
                                          <AlertTriangle className="w-4 h-4" />
                                          <span>Vypršal časový limit na platbu</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </CardContent>
                      </Card>

                    </div>

                    {/* Right side: Property Settings Form */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-xl">
                        <CardHeader className="pb-3 border-b border-white/5">
                          <CardTitle className="text-base sm:text-lg font-black uppercase tracking-wider">Nastavenia showroomu</CardTitle>
                          <CardDescription className="text-xs text-slate-450">Konfigurácia cien, storno a obchodných podmienok.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <form onSubmit={handleSaveSettings} className="space-y-4">
                            
                            {/* Payments */}
                            <div className="bg-[#C5A880]/10 p-4 rounded-2xl border border-[#C5A880]/20 space-y-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4" />
                                Bankové spojenie partnera
                              </h4>
                              <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Meno majiteľa účtu</label>
                                <input 
                                  type="text"
                                  required
                                  value={editAccName}
                                  onChange={(e) => setEditAccName(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">IBAN pre platby záloh</label>
                                <input 
                                  type="text"
                                  required
                                  value={editIban}
                                  onChange={(e) => setEditIban(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">BIC / SWIFT</label>
                                  <input 
                                    type="text"
                                    value={editBic}
                                    onChange={(e) => setEditBic(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Výška zálohy (%)</label>
                                  <input 
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    value={editPrepay}
                                    onChange={(e) => setEditPrepay(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Storno */}
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3 text-xs">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-350">Stornovanie rezervácií</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Bezplatné storno do</label>
                                  <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-xl px-3 py-2">
                                    <input 
                                      type="number"
                                      min="0"
                                      value={editStornoDays}
                                      onChange={(e) => setEditStornoDays(e.target.value)}
                                      className="w-full bg-transparent border-none text-white focus:outline-none text-xs font-bold"
                                    />
                                    <span className="text-slate-500 text-[8px] font-bold uppercase shrink-0">dní</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Vrátená suma zálohy</label>
                                  <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-xl px-3 py-2">
                                    <input 
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={editStornoRefund}
                                      onChange={(e) => setEditStornoRefund(e.target.value)}
                                      className="w-full bg-transparent border-none text-white focus:outline-none text-xs font-bold"
                                    />
                                    <span className="text-slate-500 text-[8px] font-bold uppercase shrink-0">%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Custom Terms Txt */}
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Vlastné Obchodné Podmienky (VOP)</label>
                              <textarea 
                                rows="3"
                                value={editVop}
                                onChange={(e) => setEditVop(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] resize-none text-white font-light leading-normal"
                              />
                            </div>

                            {/* Standard details */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cena za noc (EUR)</label>
                                <input 
                                  type="number" 
                                  required
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">URL videa (embed)</label>
                                <input 
                                  type="text" 
                                  value={editVideo}
                                  onChange={(e) => setEditVideo(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Popis nehnuteľnosti</label>
                              <textarea 
                                rows="2"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                              />
                            </div>

                            <Button type="submit" className="w-full bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5">
                              <Settings className="w-4 h-4 text-[#C5A880]" />
                              Uložiť nastavenia
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* PREDFFAKTÚRA A QR DIALOG */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-white/5 bg-slate-950 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white uppercase tracking-wider text-base">Zálohová Predfaktúra</h3>
                <p className="text-[9px] text-slate-450 font-bold uppercase tracking-widest mt-1">Variabilný symbol: {selectedInvoice.variableSymbol}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-xl border border-white/10 hover:bg-white/5"
              >
                <XCircle className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-left">
              
              <div className="border border-[#C5A880]/30 bg-[#C5A880]/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  Bankový prevod
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Príjemca:</span>
                    <p className="font-extrabold text-white mt-0.5">{selectedInvoice.accountName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">IBAN:</span>
                    <p className="font-extrabold text-white mt-0.5 select-all">{selectedInvoice.iban}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">SWIFT / BIC:</span>
                    <p className="font-extrabold text-white mt-0.5">{selectedInvoice.bic || 'SUBASKBX'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Variabilný symbol:</span>
                    <p className="font-extrabold text-white mt-0.5 select-all">{selectedInvoice.variableSymbol}</p>
                  </div>
                  <div className="col-span-2 bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center mt-2">
                    <span className="text-[#C5A880] font-black uppercase tracking-wider text-[10px]">Suma zálohy:</span>
                    <span className="text-[#C5A880] font-black text-base">{selectedInvoice.depositAmount} EUR</span>
                  </div>
                </div>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center justify-center py-4 border-y border-white/5 space-y-3">
                <div className="bg-white p-3.5 rounded-3xl border border-slate-800 shadow-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`SPD*1.0*ACC:${selectedInvoice.iban}*AM:${selectedInvoice.depositAmount}*CUR:EUR*VS:${selectedInvoice.variableSymbol}*MSG:Zaloha za Showroom`)}`}
                    alt="SEPA Pay by Square QR"
                    className="w-[180px] h-[180px]"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-wider">Pay by Square / SEPA QR</p>
                  <p className="text-[10px] text-slate-550">Naskenujte v slovenskej bankovej aplikácii</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                <p className="text-slate-400 text-[10px]">Rezervoval: <strong className="text-white">{selectedInvoice.clientName}</strong></p>
                <p className="text-slate-400 text-[10px]">Termín: <strong className="text-white">{selectedInvoice.startDate} až {selectedInvoice.endDate}</strong></p>
                <p className="text-slate-400 text-[10px]">Doplatok na mieste: <strong className="text-white">{selectedInvoice.totalPrice - selectedInvoice.depositAmount} EUR</strong></p>
              </div>

            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-end">
              <Button onClick={() => setSelectedInvoice(null)} className="bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs uppercase px-5 py-3">
                Zavrieť
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* TEST & DEVELOPER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/10 text-white text-xs shadow-2xl">
        <details className="group">
          
          <summary className="cursor-pointer py-3.5 px-6 flex justify-between items-center bg-slate-950/80 hover:bg-slate-950 transition-colors">
            <span className="font-black text-[10px] uppercase tracking-wider text-[#C5A880] flex items-center gap-2">
              <Smartphone className="w-4 h-4 animate-pulse" />
              Testovacia konzola & Simulátor emailov
            </span>
            <span className="flex items-center gap-3">
              <span className="bg-slate-900 px-3 py-1 rounded text-[10px] text-slate-400">
                Simulovaný čas: <strong className="text-[#C5A880]">{getSimulatedNow().toLocaleTimeString('sk-SK')}</strong>
              </span>
              <span className="text-[#C5A880] font-black group-open:hidden">Zobraziť panel ↑</span>
              <span className="text-[#C5A880] font-black hidden group-open:inline">Skryť panel ↓</span>
            </span>
          </summary>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[350px] overflow-y-auto">
            
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#C5A880] border-b border-white/5 pb-1">
                Ovládanie času a auto-storna
              </h4>
              <p className="text-slate-400 leading-relaxed font-light">
                Posuňte čas o +24 hodín a otestujte automatické stornovanie schválených rezervácií pri neuhradení zálohy.
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm"
                  onClick={() => handleSimulateTimeJump(1)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 font-bold"
                >
                  Posunúť +1 hodinu
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSimulateTimeJump(24)}
                  className="bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black text-xs"
                >
                  Posunúť +24 hodín
                </Button>
                <Button 
                  size="sm"
                  onClick={handleResetTime}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-350 font-bold"
                >
                  Resetovať čas
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#C5A880] border-b border-white/5 pb-1 flex justify-between items-center">
                <span>Simulovaná schránka (Odosielateľ: info@americanliving.sk)</span>
                {emails.length > 0 && (
                  <button onClick={() => setEmails([])} className="text-[9px] text-red-400 hover:text-red-300 font-bold">Vymazať</button>
                )}
              </h4>

              {emails.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                  V schránke nie sú žiadne maily.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {emails.map((email) => (
                    <div 
                      key={email.id} 
                      className="p-3 bg-slate-950 rounded-xl border border-white/5 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold">
                        <span>Odoslané: {email.sentAt}</span>
                        <span className="bg-[#C5A880]/15 text-[#E2C799] px-2 py-0.5 rounded font-black">Od: {email.from}</span>
                      </div>
                      <div className="text-slate-300">
                        <p className="font-extrabold text-[#C5A880] text-xs">Pre: {email.to}</p>
                        <p className="font-black text-white text-xs mt-0.5">Predmet: {email.subject}</p>
                      </div>
                      <pre className="text-[10px] text-slate-400 leading-normal font-sans bg-slate-950 p-2.5 rounded border border-white/5 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                        {email.body}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </details>
      </div>

    </div>
  );
}
