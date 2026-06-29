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
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

// Prednastavené počiatočné dáta pre lokálne úložisko
const INITIAL_PROPERTIES = {
  komarno: {
    id: 'komarno',
    name: "Showroom Komárno - Moderný Barn House",
    location: "Komárno",
    status: "pripravujeme",
    desc: "Luxusný celoročný modulárny dom typu Barn House s veľkými presklenými plochami. Disponuje krásnym bazénom a saunou. Všetko sa nachádza v tichej a čistej prírode, kde si môžete vyskúšať všetky moderné technológie bývania na vlastnej koži.",
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
    name: "Showroom Levoča - Tradičný Prefab",
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

  // Zobrazenie faktúry pre klienta
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

  // --- AUTO-CANCELLATION LOOP (Runs every 10 seconds or on data load) ---
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
            
            // Odoslať email o stornovaní
            const property = properties[res.propertyId];
            const systemEmail = {
              id: Date.now() + Math.random(),
              from: 'info@americanliving.sk',
              to: res.clientEmail,
              subject: `⚠️ Rezervácia zrušená - Vypršal časový limit (VS: ${res.variableSymbol})`,
              body: `Dobrý deň,\n\nVaša rezervácia showroomu v lokalite ${property.location} na termín ${res.startDate} až ${res.endDate} bola automaticky zrušená, pretože sme nezaznamenali úhradu zálohy vo výške ${res.depositAmount} EUR do 24 hodín od schválenia.\n\nAk máte stále záujem o vyskúšanie domu, urobte prosím novú rezerváciu.\n\nS pozdravom,\nTím American Living s.r.o.`,
              sentAt: getSimulatedNow().toLocaleString()
            };

            // Notifikácia aj pre partnera
            const partnerEmail = {
              id: Date.now() + Math.random() + 1,
              from: 'info@americanliving.sk',
              to: property.partnerEmail,
              subject: `⚠️ Rezervácia klienta ${res.clientName} bola stornovaná`,
              body: `Dobrý deň,\n\nRezervácia na termín ${res.startDate} až ${res.endDate} pre klienta ${res.clientName} bola automaticky zrušená z dôvodu neuhradenia zálohy do 24 hodín.\nTermíny boli uvoľnené pre ďalších záujemcov.\n\nS pozdravom,\nAmerican Living Systém`,
              sentAt: getSimulatedNow().toLocaleString()
            };

            setEmails(prev => [systemEmail, partnerEmail, ...prev]);
            
            // Volanie SendEmail integrácie
            base44.integrations.Core.SendEmail({
              to: res.clientEmail,
              subject: systemEmail.subject,
              body: systemEmail.body
            }).catch(err => console.log('Mock SendEmail client error', err));

            base44.integrations.Core.SendEmail({
              to: property.partnerEmail,
              subject: partnerEmail.subject,
              body: partnerEmail.body
            }).catch(err => console.log('Mock SendEmail partner error', err));

            return { ...res, status: 'zrusena_vyprsal_limit', cancelled_at: now.toISOString() };
          }
        }
        return res;
      });

      if (changed) {
        setReservations(updatedReservations);
        toast.info('Niektoré rezervácie boli automaticky stornované kvôli neuhradeniu do 24 hodín.');
      }
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 10000);
    return () => clearInterval(interval);
  }, [reservations, properties, simulatedTimeOffset]);

  // --- PARTNER PANEL INIT FIELDS ---
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

  // --- HELPER FOR DATE PARSING ---
  const formatDateString = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // --- CALENDAR LOGIC ---
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
      toast.error('Tento termín je už obsadený.');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
      // Overenie, či v rozmedzí nie je nejaký rezervovaný termín
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
        toast.error('Zvolený interval obsahuje už obsadené dni.');
        return;
      }
      setEndDate(date);
    }
  };

  // --- CLIENT SUBMIT BOOKING ---
  const handleClientBookingSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Zvoľte prosím začiatok a koniec pobytu v kalendári.');
      return;
    }
    if (!clientName || !clientEmail || !clientPhone) {
      toast.error('Vyplňte prosím všetky povinné kontaktné údaje.');
      return;
    }

    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    
    // Výpočet počtu nocí
    const diffTime = Math.abs(endDate - startDate);
    const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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

    // Uložiť rezerváciu
    setReservations(prev => [newRes, ...prev]);

    // Odoslať email partnerovi
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
    }).catch(err => console.log('Mock SendEmail error', err));

    toast.success('Dopyt na rezerváciu bol úspešne odoslaný. Partner bol informovaný emailom.');
    
    // Reset formulára a dátumov
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientNote('');
    setStartDate(null);
    setEndDate(null);
  };

  // --- PARTNER AUTH ---
  const handlePartnerLogin = (e) => {
    e.preventDefault();
    const found = partners.find(p => p.email.toLowerCase() === pEmail.toLowerCase() && p.password === pPassword);
    if (found) {
      setPartnerLoggedIn(found);
      toast.success(`Prihlásený ako partner: ${found.name}`);
    } else {
      toast.error('Nesprávny e-mail alebo heslo.');
    }
  };

  const handlePartnerRegister = (e) => {
    e.preventDefault();
    if (!pEmail || !pPassword || !pName) {
      toast.error('Vyplňte všetky polia.');
      return;
    }
    if (partners.some(p => p.email.toLowerCase() === pEmail.toLowerCase())) {
      toast.error('Partner s týmto e-mailom už existuje.');
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
    toast.success('Registrácia úspešná. Boli ste prihlásený.');
    setIsRegistering(false);
  };

  // --- PARTNER SAVE SETTINGS ---
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!editIban) {
      toast.error('Pre uloženie musíte vyplniť IBAN.');
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

    toast.success('Nastavenia nehnuteľnosti boli úspešne uložené.');
  };

  // --- PARTNER APPROVE RESERVATION ---
  const handleApproveReservation = (resId) => {
    const res = reservations.find(r => r.id === resId);
    const prop = properties[res.propertyId];

    if (!prop.iban || !prop.accountName) {
      toast.error('Pred schválením rezervácie musíte mať vyplnené vaše platobné údaje v sekcii Nastavenia!');
      return;
    }

    const vs = '2026' + String(reservations.length).padStart(4, '0');
    
    // Aktualizácia rezervácie
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

    // Vytvorenie predfaktúry s QR kódom
    const sepaCode = `SPD*1.0*ACC:${prop.iban}*AM:${res.depositAmount}*CUR:EUR*VS:${vs}*MSG:Zaloha za Showroom ${prop.location}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(sepaCode)}`;

    // Odoslať email klientovi s predfaktúrou
    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `✅ Rezervácia schválená - Predfaktúra č. ${vs}`,
      body: `Dobrý deň ${res.clientName},\n\nVaša žiadosť o rezerváciu showroomu ${prop.name} na termín ${res.startDate} až ${res.endDate} bola schválená majiteľom nehnuteľnosti.\n\nPre potvrdenie rezervácie je potrebné zaplatiť zálohu vo výške ${prop.prepayPercent}% z celkovej ceny pobytu.\n\nÚDAJE PRE PLATBU:\n--------------------\nCelková suma pobytu: ${res.totalPrice} EUR\nSuma zálohy (k úhrade): ${res.depositAmount} EUR\nČíslo účtu (IBAN): ${prop.iban}\nBIC / SWIFT: ${prop.bic || 'nešpecifikované'}\nNázov účtu: ${prop.accountName}\nVariabilný symbol (VS): ${vs}\nSpráva pre príjemcu: Zaloha za Showroom ${prop.location}\n\n⚠️ DÔLEŽITÉ UPOZORNENIE:\nPlatbu je nutné vykonať do 24 hodín od tohto schválenia, inak bude vaša rezervácia automaticky stornovaná a uvoľnená pre iných záujemcov.\n\nObchodné podmienky a storno podmienky majiteľa objektu:\n${prop.vop}\nStorno podmienky: Bezplatné zrušenie do ${prop.stornoDays} dní pred nástupom s vrátením ${prop.stornoRefund}% zálohy.\n\nOdkaz na stiahnutie predfaktúry a naskenovanie QR kódu nájdete na našej stránke.\n\nS pozdravom,\nAmerican Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString(),
      qrCodeUrl: qrUrl
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log('Mock SendEmail error', err));

    toast.success('Rezervácia bola schválená. Predfaktúra s QR kódom bola odoslaná klientovi na e-mail.');
  };

  // --- PARTNER REJECT RESERVATION ---
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

    // Odoslať email klientovi
    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `❌ Rezervácia showroomu zamietnutá`,
      body: `Dobrý deň ${res.clientName},\n\nVaša žiadosť o rezerváciu predvádzacieho showroomu v lokalite ${prop.location} na termín ${res.startDate} až ${res.endDate} bola zamietnutá majiteľom nehnuteľnosti z kapacitných alebo prevádzkových dôvodov.\n\nĎakujeme za záujem a neváhajte vyskúšať iný termín alebo inú lokalitu.\n\nS pozdravom,\nTím American Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString()
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log('Mock SendEmail error', err));

    toast.error('Rezervácia bola zamietnutá. Klient bol informovaný emailom.');
  };

  // --- PARTNER MARK AS PAID ---
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

    // Odoslať email klientovi s potvrdením o platbe
    const emailToClient = {
      id: Date.now() + Math.random(),
      from: 'info@americanliving.sk',
      to: res.clientEmail,
      subject: `🎉 Platba prijatá - Potvrdenie rezervácie Showroomu (VS: ${res.variableSymbol})`,
      body: `Dobrý deň ${res.clientName},\n\nS radosťou vám oznamujeme, že sme prijali vašu zálohu vo výške ${res.depositAmount} EUR pre rezerváciu showroomu ${prop.name} na termín ${res.startDate} až ${res.endDate}.\n\nVaša rezervácia je odteraz plne záväzná a termín bol definitívne zablokovaný.\n\nDOPLŇUJÚCE INFORMÁCIE:\n--------------------\nObjekt: Showroom ${prop.location}\nAdresa: Pripravovaný showroom partnera American Living s.r.o.\nTermín nástupu: ${res.startDate} po 14:00\nTermín odchodu: ${res.endDate} do 10:00\nDoplatok na mieste: ${res.totalPrice - res.depositAmount} EUR\n\nSTORNO PODMIENKY:\n--------------------\nRezerváciu môžete bezplatne stornovať najneskôr ${prop.stornoDays} dní pred nástupom. V takom prípade vám bude vrátených ${prop.stornoRefund}% zo zaplatenej zálohy.\n\nV prílohe tohto mailu nájdete kompletné Obchodné podmienky ubytovania pre partnerov American Living s.r.o.\n\nVšeobecné obchodné podmienky (VOP) partnera:\n${prop.vop}\n\nĎakujeme a tešíme sa na vašu návštevu!\n\nS pozdravom,\nAmerican Living s.r.o.`,
      sentAt: getSimulatedNow().toLocaleString()
    };

    setEmails(prev => [emailToClient, ...prev]);

    base44.integrations.Core.SendEmail({
      to: res.clientEmail,
      subject: emailToClient.subject,
      body: emailToClient.body
    }).catch(err => console.log('Mock SendEmail error', err));

    toast.success('Platba bola úspešne zaznamenaná. Rezervácia je teraz plne potvrdená.');
  };

  // --- TIME SIMULATOR ACTIONS ---
  const handleSimulateTimeJump = (hours) => {
    const ms = hours * 60 * 60 * 1000;
    setSimulatedTimeOffset(prev => prev + ms);
    toast.success(`Čas bol v simulátore posunutý o +${hours} hodín.`);
  };

  const handleResetTime = () => {
    setSimulatedTimeOffset(0);
    toast.info('Čas bol zresetovaný na skutočný reálny čas.');
  };

  // --- COMPUTE REMAINING 24H TIMER ---
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#08080A] text-slate-800 dark:text-slate-100 font-sans pb-24 transition-colors duration-300">
      
      {/* 1. HERO HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white py-16 sm:py-24 px-4 text-center border-b border-[#C5A880]/20">
        <div className="absolute inset-0 opacity-10 bg-[url('https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/cbd41c122_Barnbazen.jpeg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge className="mb-4 bg-[#C5A880] text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider animate-pulse border border-[#C5A880]">
            Vyskúšajte pred kúpou • Pripravujeme
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Nové Showroomy <span className="bg-gradient-to-r from-[#C5A880] via-[#E2C799] to-[#C5A880] bg-clip-text text-transparent">American Living</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-350 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Chcete zažiť atmosféru a kvalitu našich domov skôr, než investujete? Pripravujeme pre vás možnosť krátkodobého prenájmu a otestovania na vlastnej koži.
          </p>

          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => setActiveTab('client')}
              className={`rounded-xl px-6 py-6 font-bold text-sm transition-all ${
                activeTab === 'client' 
                  ? 'bg-[#C5A880] text-slate-950 shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:bg-[#C5A880]/90' 
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              }`}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Prehľad a Rezervácia
            </Button>
            <Button 
              size="lg" 
              onClick={() => setActiveTab('partner')}
              className={`rounded-xl px-6 py-6 font-bold text-sm transition-all ${
                activeTab === 'partner' 
                  ? 'bg-[#C5A880] text-slate-950 shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:bg-[#C5A880]/90' 
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Partnerská Zóna
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* 2. CLIENT TAB - CUSTOMERS */}
        {activeTab === 'client' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LOKALITY A DETAIL */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Location Selectors */}
              <div className="grid grid-cols-2 gap-4">
                {Object.values(properties).map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => {
                      setSelectedLoc(prop.id);
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className={`flex flex-col p-5 rounded-2xl border text-left transition-all ${
                      selectedLoc === prop.id 
                        ? 'border-[#C5A880] bg-white dark:bg-slate-900 shadow-[0_10px_30px_rgba(197,168,128,0.1)]' 
                        : 'border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-955/40 hover:bg-white dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 w-full">
                      <div className="flex items-center gap-1.5 text-xs text-[#C5A880] font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        {prop.location}
                      </div>
                      <Badge className="bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 text-[9px] font-bold px-2 py-0.5 border border-orange-500/20 uppercase tracking-wider">
                        Staviame
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base leading-tight mb-2 text-slate-900 dark:text-white">{prop.name}</h3>
                    <p className="text-xs text-slate-500 mt-auto">Cena za noc: <span className="font-bold text-slate-900 dark:text-white text-sm">{prop.price} EUR</span></p>
                  </button>
                ))}
              </div>

              {/* Selected Location Card */}
              {(() => {
                const prop = properties[selectedLoc];
                return (
                  <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{prop.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1.5 mt-1 font-medium text-xs text-slate-500">
                            <span>Oficiálny partner American Living s.r.o.</span>
                            <span>•</span>
                            <span className="text-orange-500">Staviame - pripravujeme</span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-[#C5A880]">{prop.price} EUR</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">za noc pobytu</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A880] mb-2">O showroom objekte</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-light">{prop.desc}</p>
                      </div>

                      {/* Video Player or Placeholder */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A880] mb-3 flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          Video a vizualizácie
                        </h4>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
                          {prop.video ? (
                            <iframe 
                              src={prop.video} 
                              title={prop.name}
                              className="absolute inset-0 w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
                              <Video className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
                              <p className="text-xs">Vizualizačné video sa pripravuje majiteľom</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Storno & VOP Information */}
                      <div className="bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                          Obchodné a storno podmienky partnera
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Bezplatné storno</p>
                            <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">Do {prop.stornoDays} dní pred príchodom</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Refundácia zálohy</p>
                            <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">Vrátenie {prop.stornoRefund}% zaplatenej sumy</p>
                          </div>
                        </div>
                        {prop.vop && (
                          <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Všeobecné podmienky partnera (VOP)</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-normal text-xs font-light line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
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

            {/* KALENDÁR A REZERVAČNÝ FORMULÁR */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Kalendár voľných dní */}
              <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-lg">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Vyberte si termín</CardTitle>
                    <CardDescription className="text-xs">Kliknutím zvoľte prvý a posledný dňa pobytu</CardDescription>
                  </div>
                  <CalendarIcon className="w-5 h-5 text-[#C5A880]" />
                </CardHeader>
                <CardContent className="pt-2">
                  
                  {/* Kalendár navigácia */}
                  <div className="flex justify-between items-center mb-4">
                    <button 
                      onClick={() => {
                        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                        setCurrentMonth(prev);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {currentMonth.toLocaleString('sk-SK', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => {
                        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                        setCurrentMonth(next);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Kalendár Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
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
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                                  isBooked 
                                    ? 'bg-red-500/10 text-red-500 cursor-not-allowed border border-red-500/20' 
                                    : isSelected 
                                      ? 'bg-[#C5A880] text-slate-950 font-bold scale-105 shadow-md' 
                                      : 'hover:bg-slate-150 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                                } ${isToday ? 'border border-blue-500' : ''}`}
                              >
                                <span>{day.getDate()}</span>
                                {isBooked && (
                                  <span className="w-1 h-1 bg-red-500 rounded-full mt-0.5" />
                                )}
                                {isSelected && !isBooked && (
                                  <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>

                  {/* Kalendár Legend */}
                  <div className="flex gap-4 justify-center items-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-t border-slate-100 dark:border-white/5 pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#C5A880]" />
                      <span>Vybraté</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30" />
                      <span>Obsadené</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded border border-blue-500" />
                      <span>Dnes</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Rezervačný formulár */}
              <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Odoslať dopyt o pobyt</CardTitle>
                  <CardDescription className="text-xs">
                    {startDate && endDate 
                      ? `Zvolený termín: ${formatDateString(startDate)} až ${formatDateString(endDate)}` 
                      : 'Zvoľte termín na kalendári vyššie.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleClientBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Meno a priezvisko *</label>
                      <input 
                        type="text" 
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="napr. Ján Kováč"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">E-mail *</label>
                        <input 
                          type="email" 
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="jan.kovac@example.com"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Telefón *</label>
                        <input 
                          type="tel" 
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+421 900 000 000"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Poznámka k rezervácii</label>
                      <textarea 
                        rows="2"
                        value={clientNote}
                        onChange={(e) => setClientNote(e.target.value)}
                        placeholder="Máte záujem o konkrétny model domu? Chcete počas pobytu prediskutovať možnosti financovania?"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors resize-none"
                      />
                    </div>

                    {startDate && endDate && (
                      <div className="bg-[#C5A880]/10 border border-[#C5A880]/20 rounded-xl p-4 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Počet nocí:</span>
                          <span className="font-bold">{Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))} nocí</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cena za noc:</span>
                          <span className="font-bold">{properties[selectedLoc].price} EUR</span>
                        </div>
                        <div className="flex justify-between border-t border-[#C5A880]/30 pt-2 text-sm text-slate-900 dark:text-white">
                          <span className="font-bold">Celková suma:</span>
                          <span className="font-black text-[#C5A880]">
                            {Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) * properties[selectedLoc].price} EUR
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 mt-1">
                          <span>Požadovaná záloha ({properties[selectedLoc].prepayPercent}%):</span>
                          <span className="font-bold">
                            {((Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) * properties[selectedLoc].price * properties[selectedLoc].prepayPercent) / 100).toFixed(2)} EUR
                          </span>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={!startDate || !endDate}
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg border border-red-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>Odoslať dopyt na rezerváciu</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </div>

          </div>
        )}

        {/* 3. PARTNER TAB - PARTNERS */}
        {activeTab === 'partner' && (
          <div className="max-w-4xl mx-auto">
            
            {/* Prihlásenie partnera */}
            {!partnerLoggedIn ? (
              <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-8">
                <div className="text-center mb-8 max-w-md mx-auto">
                  <ShieldCheck className="w-12 h-12 text-[#C5A880] mx-auto mb-3" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Portál pre partnerov</h2>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Prihláste sa pre správu rezervácií a informácií o vašich showroom domoch.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Login Form */}
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Prihlásenie</h3>
                    <form onSubmit={handlePartnerLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail</label>
                        <input 
                          type="email" 
                          required
                          value={pEmail}
                          onChange={(e) => setPEmail(e.target.value)}
                          placeholder="partner@americanliving.sk"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Heslo</label>
                        <input 
                          type="password" 
                          required
                          value={pPassword}
                          onChange={(e) => setPPassword(e.target.value)}
                          placeholder="Heslo"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-[#C5A880] text-slate-950 font-bold py-3 rounded-xl hover:bg-[#C5A880]/90">
                        Prihlásiť sa
                      </Button>
                    </form>
                    
                    <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 mt-6 text-xs text-slate-500 space-y-1.5 border border-slate-200 dark:border-white/5">
                      <p className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-[#C5A880]" /> Testovacie účty:</p>
                      <p><strong>Komárno:</strong> partner.komarno@americanliving.sk / <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">partner</code></p>
                      <p><strong>Levoča:</strong> partner.levoca@americanliving.sk / <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">partner</code></p>
                    </div>
                  </div>

                  {/* Register Form */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 pt-6 md:pt-0 md:pl-8">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Registrácia nového partnera</h3>
                    <form onSubmit={handlePartnerRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Názov partnera / Spoločnosť</label>
                        <input 
                          type="text" 
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="napr. MojDom s.r.o."
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail</label>
                        <input 
                          type="email" 
                          required
                          value={pEmail}
                          onChange={(e) => setPEmail(e.target.value)}
                          placeholder="email@partner.sk"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Heslo</label>
                        <input 
                          type="password" 
                          required
                          value={pPassword}
                          onChange={(e) => setPPassword(e.target.value)}
                          placeholder="Heslo"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Objekt v správe</label>
                        <select 
                          value={pProperty} 
                          onChange={(e) => setPProperty(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        >
                          <option value="komarno">Showroom Komárno</option>
                          <option value="levoca">Showroom Levoča</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/10">
                        Zaregistrovať sa a vstúpiť
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ) : (
              
              /* PARTNER LOGGED IN DASHBOARD */
              <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{partnerLoggedIn.name}</h2>
                      <p className="text-xs text-slate-500">Správa nehnuteľnosti: <span className="font-bold text-[#C5A880]">{properties[partnerLoggedIn.propertyId].name}</span></p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setPartnerLoggedIn(null)}
                    className="rounded-xl hover:bg-red-500/10 hover:text-red-500 border-slate-200 dark:border-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Odhlásiť sa
                  </Button>
                </div>

                {/* DASHBOARD CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* TAB 1: REZERVÁCIE MAJITEĽA */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Zoznam rezervácií */}
                    <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-md">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
                        <CardTitle className="text-lg font-bold">Žiadosti o rezerváciu</CardTitle>
                        <CardDescription className="text-xs">Spravujte dopyty, schvaľujte a zaznamenávajte platby záloh.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {reservations.filter(r => r.propertyId === partnerLoggedIn.propertyId).length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">
                            Zatiaľ neboli odoslané žiadne dopyty pre váš objekt.
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
                                  className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col space-y-3 shadow-sm relative overflow-hidden"
                                >
                                  {/* Badge status */}
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{res.startDate} až {res.endDate} ({res.nights} nocí)</span>
                                    <div>
                                      {isPending && <Badge className="bg-yellow-600/10 text-yellow-500 border border-yellow-500/20 font-bold text-[9px] uppercase tracking-wider">Čaká na schválenie</Badge>}
                                      {isApproved && <Badge className="bg-blue-600/10 text-blue-500 border border-blue-500/20 font-bold text-[9px] uppercase tracking-wider">Schválená - čaká na platbu</Badge>}
                                      {isPaid && <Badge className="bg-green-600/10 text-green-500 border border-green-500/20 font-bold text-[9px] uppercase tracking-wider">Zaplatená & Potvrdená</Badge>}
                                      {isRejected && <Badge className="bg-red-600/10 text-red-500 border border-red-500/20 font-bold text-[9px] uppercase tracking-wider">Zamietnutá</Badge>}
                                      {isExpired && <Badge className="bg-slate-600/10 text-slate-500 border border-slate-500/20 font-bold text-[9px] uppercase tracking-wider">Vypršal limit (Zrušená)</Badge>}
                                    </div>
                                  </div>

                                  {/* Client Info */}
                                  <div className="text-xs text-slate-600 dark:text-slate-350 space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{res.clientName}</p>
                                    <p>Email: <span className="font-medium">{res.clientEmail}</span> | Tel: <span className="font-medium">{res.clientPhone}</span></p>
                                    {res.clientNote && <p className="italic text-slate-450 mt-1">„{res.clientNote}“</p>}
                                  </div>

                                  {/* Price calculation */}
                                  <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-white/5 text-xs flex justify-between items-center">
                                    <div>
                                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Celková suma</p>
                                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">{res.totalPrice} EUR</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Záloha k úhrade ({res.prepayPercent || properties[partnerLoggedIn.propertyId].prepayPercent}%)</p>
                                      <p className="font-extrabold text-[#C5A880] text-sm">{res.depositAmount} EUR</p>
                                    </div>
                                  </div>

                                  {/* VS & Expiration Countdown for Approved */}
                                  {isApproved && (
                                    <div className="flex justify-between items-center text-xs bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg text-blue-500">
                                      <span>Variabilný Symbol: <strong className="text-slate-800 dark:text-white">{res.variableSymbol}</strong></span>
                                      <span className="flex items-center gap-1 font-bold">
                                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                        Platobný limit: {getRemainingTimeText(res)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-2.5 pt-2">
                                    {isPending && (
                                      <>
                                        <Button 
                                          size="sm"
                                          onClick={() => handleApproveReservation(res.id)}
                                          className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg"
                                        >
                                          Schváliť & Odoslať Predfaktúru
                                        </Button>
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRejectReservation(res.id)}
                                          className="border-slate-200 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-500"
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
                                          className="flex-1 bg-[#C5A880] text-slate-950 font-bold rounded-lg hover:bg-[#C5A880]/90"
                                        >
                                          Zaznamenať prijatie platby
                                        </Button>
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setSelectedInvoice(res)}
                                          className="border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-300"
                                        >
                                          Zobraziť Predfaktúru / QR
                                        </Button>
                                      </>
                                    )}

                                    {isPaid && (
                                      <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg w-full justify-center">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Rezervácia je zaplatená a záväzná. Potvrdenie bolo zaslané.</span>
                                      </div>
                                    )}

                                    {isExpired && (
                                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-slate-500/5 border border-slate-500/10 px-3 py-2 rounded-lg w-full justify-center">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Expirovaná. Termín bol automaticky uvoľnený.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </CardContent>
                    </Card>

                    {/* View Calendar for Partner */}
                    <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Váš kalendár obsadenosti</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
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
                                  const dateStr = formatDateString(day);
                                  const matchingRes = reservations.find(res => 
                                    res.propertyId === partnerLoggedIn.propertyId && 
                                    (res.status === 'schvalena' || res.status === 'zaplatena') &&
                                    dateStr >= res.startDate && dateStr <= res.endDate
                                  );

                                  const isPaid = matchingRes?.status === 'zaplatena';
                                  const isApproved = matchingRes?.status === 'schvalena';

                                  return (
                                    <div
                                      key={day.toISOString()}
                                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative text-xs border ${
                                        isPaid 
                                          ? 'bg-green-500/25 border-green-500/50 text-green-700 dark:text-green-300 font-bold' 
                                          : isApproved
                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold animate-pulse'
                                            : 'border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      <span>{day.getDate()}</span>
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex gap-4 justify-center items-center mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-green-500/25 border border-green-500/50" />
                            <span>Zaplatené</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/40" />
                            <span>Schválené (Čaká na platbu)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>

                  {/* TAB 2: EDIT NASTAVENÍ OBJEKTU */}
                  <div className="lg:col-span-5 space-y-6">
                    <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-md">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
                        <CardTitle className="text-lg font-bold">Nastavenia showroomu</CardTitle>
                        <CardDescription className="text-xs">Upravte texty, storno podmienky a platobné údaje.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                          
                          {/* Platobné údaje */}
                          <div className="bg-[#C5A880]/15 p-4 rounded-xl border border-[#C5A880]/20 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#E2C799] flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4" />
                              Platobné Údaje Majiteľa
                            </h4>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Meno majiteľa účtu *</label>
                              <input 
                                type="text"
                                required
                                value={editAccName}
                                onChange={(e) => setEditAccName(e.target.value)}
                                placeholder="Názov spoločnosti s.r.o."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">IBAN (číslo účtu) *</label>
                              <input 
                                type="text"
                                required
                                value={editIban}
                                onChange={(e) => setEditIban(e.target.value)}
                                placeholder="SK00 0000 0000 0000 0000 0000"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">BIC / SWIFT</label>
                                <input 
                                  type="text"
                                  value={editBic}
                                  onChange={(e) => setEditBic(e.target.value)}
                                  placeholder="SUBASKBX"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Záloha v % *</label>
                                <input 
                                  type="number"
                                  required
                                  min="0"
                                  max="100"
                                  value={editPrepay}
                                  onChange={(e) => setEditPrepay(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Storno podmienky */}
                          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350">
                              Storno a zálohy
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1">Bezplatné storno do</label>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs">
                                  <input 
                                    type="number"
                                    min="0"
                                    value={editStornoDays}
                                    onChange={(e) => setEditStornoDays(e.target.value)}
                                    className="w-full bg-transparent border-none focus:outline-none"
                                  />
                                  <span className="text-slate-400 font-semibold text-[10px] shrink-0">dní pred nástupom</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1">Percento refundácie</label>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs">
                                  <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editStornoRefund}
                                    onChange={(e) => setEditStornoRefund(e.target.value)}
                                    className="w-full bg-transparent border-none focus:outline-none"
                                  />
                                  <span className="text-slate-400 font-semibold text-[10px] shrink-0">% zálohy</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Vlastné VOP text */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Vlastné Obchodné Podmienky (VOP)</label>
                            <textarea 
                              rows="3"
                              value={editVop}
                              onChange={(e) => setEditVop(e.target.value)}
                              placeholder="Nakopírujte alebo napíšte sem vaše všeobecné zmluvné podmienky prenájmu..."
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] resize-none"
                            />
                          </div>

                          {/* Info o objekte */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cena za noc (EUR)</label>
                            <input 
                              type="number" 
                              required
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">URL videa (vizualizácia)</label>
                            <input 
                              type="text" 
                              value={editVideo}
                              onChange={(e) => setEditVideo(e.target.value)}
                              placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Popis nehnuteľnosti</label>
                            <textarea 
                              rows="3"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                            />
                          </div>

                          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl border border-slate-750 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/10 flex items-center justify-center gap-1.5">
                            <Settings className="w-4 h-4" />
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

      {/* 4. MODAL DIALOG - SHOW INVOICE PREVIEW */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white">Predfaktúra k rezervácii</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Variabilný symbol: {selectedInvoice.variableSymbol}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/5"
              >
                <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              
              {/* Payment Details Box */}
              <div className="border border-[#C5A880]/30 bg-[#C5A880]/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  Bankový Prevod
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Príjemca:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedInvoice.accountName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">IBAN:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 select-all">{selectedInvoice.iban}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">BIC / SWIFT:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedInvoice.bic || 'SUBASKBX'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Suma zálohy ({selectedInvoice.prepayPercent}%):</span>
                    <p className="font-black text-[#C5A880] text-sm">{selectedInvoice.depositAmount} EUR</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Variabilný Symbol:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 select-all">{selectedInvoice.variableSymbol}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Zostávajúci limit:</span>
                    <p className="font-bold text-red-500">{getRemainingTimeText(selectedInvoice)}</p>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center py-4 border-y border-slate-150 dark:border-white/5 space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`SPD*1.0*ACC:${selectedInvoice.iban}*AM:${selectedInvoice.depositAmount}*CUR:EUR*VS:${selectedInvoice.variableSymbol}*MSG:Zaloha za Showroom`)}`}
                    alt="SEPA Pay by Square QR Kód"
                    className="w-[180px] h-[180px]"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-150">Naskenujte v bankovej aplikácii</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Podpora Pay by Square / SEPA QR</p>
                </div>
              </div>

              {/* Client Info Summary */}
              <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                <p><strong>Rezervoval:</strong> {selectedInvoice.clientName}</p>
                <p><strong>Termín:</strong> {selectedInvoice.startDate} až {selectedInvoice.endDate} ({selectedInvoice.nights} nocí)</p>
                <p><strong>Celková cena:</strong> {selectedInvoice.totalPrice} EUR</p>
              </div>

              {/* Terms and Conditions */}
              {selectedInvoice.vop && (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-white/5 text-[10px] text-slate-500">
                  <p className="font-bold uppercase tracking-wider text-slate-400 mb-1">VOP a storno podmienky partnera:</p>
                  <p className="leading-relaxed font-light">{selectedInvoice.vop}</p>
                </div>
              )}

            </div>

            {/* Footer close */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-150 dark:bg-slate-955/60 flex justify-end">
              <Button onClick={() => setSelectedInvoice(null)} className="bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                Zavrieť
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 5. TEST & DEBUG SYSTEM CONSOLE (STICKY DEVELOPER BAR) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-750 text-white text-xs shadow-2xl backdrop-blur-md">
        
        {/* Toggle Details */}
        <details className="group">
          
          <summary className="cursor-pointer py-3.5 px-6 flex justify-between items-center bg-slate-955/80 hover:bg-slate-950 transition-colors">
            <span className="font-black text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#C5A880] animate-pulse" />
              Testovacia konzola & Simulátor emailov
            </span>
            <span className="flex items-center gap-3">
              <span className="bg-slate-800 px-3 py-1 rounded text-[10px] text-slate-350">
                Simulovaný čas: <strong className="text-white font-bold">{getSimulatedNow().toLocaleTimeString('sk-SK')}</strong>
              </span>
              <span className="text-[#C5A880] font-black group-open:hidden">Zobraziť panel ↑</span>
              <span className="text-[#C5A880] font-black hidden group-open:inline">Skryť panel ↓</span>
            </span>
          </summary>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[350px] overflow-y-auto">
            
            {/* TIME OFFSET CONTROLLER */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#C5A880] border-b border-slate-805 pb-1">
                Ovládanie času a auto-storna
              </h4>
              <p className="text-slate-400 leading-normal text-xs font-light">
                Predpisy hovoria, že klient musí zaplatiť zálohu do 24 hodín od schválenia partnerom. Posuňte simulovaný čas o +24 hodín a sledujte, ako systém automaticky zruší schválenú rezerváciu a uvoľní dátumy v kalendári.
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm"
                  onClick={() => handleSimulateTimeJump(1)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750"
                >
                  Posunúť +1 hodinu
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSimulateTimeJump(24)}
                  className="bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold"
                >
                  Posunúť +24 hodín (Zruší rezervácie)
                </Button>
                <Button 
                  size="sm"
                  onClick={handleResetTime}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Resetovať na reálny čas
                </Button>
              </div>
            </div>

            {/* EMAIL SIMULATOR STREAM */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#C5A880] border-b border-slate-805 pb-1 flex justify-between items-center">
                <span>Doručená pošta (Simulácia: info@americanliving.sk)</span>
                {emails.length > 0 && (
                  <button 
                    onClick={() => setEmails([])}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold"
                  >
                    Vymazať schránku
                  </button>
                )}
              </h4>

              {emails.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                  Žiadne maily zatiaľ neboli odoslané. Urobte rezerváciu alebo ju schváľte.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {emails.map((email) => (
                    <div 
                      key={email.id} 
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-2 relative"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>Odoslané: {email.sentAt}</span>
                        <span className="bg-[#C5A880]/15 text-[#E2C799] px-2 py-0.5 rounded font-black border border-[#C5A880]/20">Od: {email.from}</span>
                      </div>
                      <div className="text-slate-300">
                        <p className="font-extrabold text-[#C5A880] text-xs">Pre: {email.to}</p>
                        <p className="font-black text-white text-xs mt-0.5">Predmet: {email.subject}</p>
                      </div>
                      <pre className="text-[10px] text-slate-400 leading-normal font-sans bg-slate-955 p-2.5 rounded border border-slate-900 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                        {email.body}
                      </pre>
                      {email.qrCodeUrl && (
                        <div className="flex gap-3 items-center bg-white/5 p-2 rounded-lg border border-white/10">
                          <img src={email.qrCodeUrl} alt="SEPA QR" className="w-12 h-12 bg-white p-0.5 rounded" />
                          <span className="text-[9px] text-slate-400">Predfaktúra obsahuje SEPA Pay by Square QR kód.</span>
                        </div>
                      )}
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
