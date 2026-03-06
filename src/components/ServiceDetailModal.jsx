import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from './LanguageContext';

const CALL_LABELS = {
  sk: 'Zavolať', en: 'Call', de: 'Anrufen', fr: 'Appeler', hu: 'Hívás', pl: 'Zadzwoń',
  uk: 'Зателефонувати', sr: 'Позовите', hr: 'Nazovite', el: 'Καλέστε'
};
const EMAIL_LABELS = {
  sk: 'Napísať e-mail', en: 'Send email', de: 'E-Mail schreiben', fr: 'Envoyer un e-mail',
  hu: 'E-mail küldése', pl: 'Wyślij e-mail', uk: 'Надіслати email',
  sr: 'Напишите е-пошту', hr: 'Pošalji e-mail', el: 'Αποστολή email'
};

const SERVICE_TRANSLATIONS = {
  1: {
    sk: { headline: "Kapitál pre váš nový domov získame rýchlo a bezpečne.", body: "Aby ste mohli stavať nové, musíte najprv dobre predať to staré. Postaráme sa o kompletný realitný servis. Nastavíme trhovú cenu, zabezpečíme home staging, profesionálne fotenie, právny servis a prevod peňazí na financovanie vášho nového projektu." },
    en: { headline: "We get capital for your new home quickly and safely.", body: "To build new, you first need to sell the old one well. We'll handle complete real estate service for your current property. We set the market price, arrange home staging, professional photography, legal service and fund transfer to finance your new project." },
    de: { headline: "Kapital für Ihr neues Zuhause schnell und sicher.", body: "Um neu zu bauen, müssen Sie zuerst das Alte gut verkaufen. Wir übernehmen den kompletten Immobilien-Service. Wir setzen den Marktpreis, arrangieren Home Staging, professionelle Fotografie, Rechtsservice und Geldüberweisung zur Finanzierung Ihres neuen Projekts." },
    fr: { headline: "Nous obtenons le capital pour votre nouvelle maison rapidement et en sécurité.", body: "Pour construire du neuf, il faut d'abord bien vendre l'ancien. Nous gérons le service immobilier complet. Nous fixons le prix du marché, organisons le home staging, la photographie professionnelle, le service juridique et le transfert de fonds." },
    hu: { headline: "Az új otthonához szükséges tőkét gyorsan és biztonságosan szerezzük meg.", body: "Az újjáépítéshez először jól kell eladni a régit. Teljes ingatlan-szolgáltatást biztosítunk. Meghatározzuk a piaci árat, megszervezzük a home staginget, a professzionális fotózást, a jogi szolgáltatást és a pénzátutalást." },
    pl: { headline: "Kapitał na nowy dom uzyskamy szybko i bezpiecznie.", body: "Aby budować nowe, najpierw trzeba dobrze sprzedać stare. Zajmiemy się kompletną obsługą nieruchomości. Ustalimy cenę rynkową, zapewnimy home staging, profesjonalne zdjęcia, obsługę prawną i przekazanie środków." },
    uk: { headline: "Капітал для вашого нового дому отримаємо швидко та безпечно.", body: "Щоб будувати нове, спочатку треба добре продати старе. Ми подбаємо про повний ріелторський сервіс. Встановимо ринкову ціну, організуємо хоум-стейджинг, професійне фото, юридичний сервіс та переказ коштів." },
    sr: { headline: "Капитал за ваш нови дом добићемо брзо и безбедно.", body: "Да бисте градили ново, прво морате добро продати старо. Побринућемо се за комплетну некретнинску услугу. Поставићемо тржишну цену, организовати home staging, професионалне фотографије, правну услугу и пренос средстава." },
    hr: { headline: "Kapital za vaš novi dom dobivamo brzo i sigurno.", body: "Da biste gradili novo, prvo morate dobro prodati staro. Pobrinut ćemo se za kompletnu uslugu nekretnina. Postavit ćemo tržišnu cijenu, osigurati home staging, profesionalno fotografiranje, pravnu uslugu i prijenos sredstava." },
    el: { headline: "Βρίσκουμε κεφάλαιο για το νέο σας σπίτι γρήγορα και ασφαλώς.", body: "Για να χτίσετε νέο, πρέπει πρώτα να πουλήσετε καλά το παλιό. Θα αναλάβουμε πλήρη υπηρεσία ακινήτων. Ορίζουμε τιμή αγοράς, οργανώνουμε home staging, επαγγελματική φωτογράφηση, νομική υπηρεσία και μεταφορά κεφαλαίων." },
  },
  2: {
    sk: { headline: "Nie každá lúka je vhodný stavebný pozemok.", body: "Nájdeme pre vás pozemok, ktorý nie je len \"pekný\", ale aj \"staviteľný\". Ešte pred kúpou preveríme územný plán, dostupnosť inžinierskych sietí, geologické podložie a orientáciu na svetové strany. Upozorníme vás na skryté vady a právne ťarchy." },
    en: { headline: "Not every meadow is a suitable building plot.", body: "We'll find you a plot that is not just 'pretty', but also 'buildable'. Before purchase, we check the land use plan, utility availability, geological base and orientation. We'll warn you of hidden defects and legal encumbrances." },
    de: { headline: "Nicht jede Wiese ist ein geeignetes Baugrundstück.", body: "Wir finden ein Grundstück für Sie, das nicht nur 'schön', sondern auch 'bebaubar' ist. Vor dem Kauf prüfen wir Bebauungsplan, Versorgungsverfügbarkeit, geologischen Untergrund und Ausrichtung. Wir weisen auf versteckte Mängel und rechtliche Lasten hin." },
    fr: { headline: "Chaque prairie n'est pas un terrain constructible adapté.", body: "Nous trouverons un terrain qui n'est pas seulement 'beau', mais aussi 'constructible'. Avant l'achat, nous vérifions le plan d'urbanisme, la disponibilité des réseaux, le sous-sol géologique et l'orientation." },
    hu: { headline: "Nem minden rét alkalmas építési teleknek.", body: "Olyan telket keresünk Önnek, amely nem csak 'szép', hanem 'beépíthető' is. A vásárlás előtt ellenőrizzük a területrendezési tervet, a közművek elérhetőségét, a geológiai alapot és a tájolást." },
    pl: { headline: "Nie każda łąka jest odpowiednią działką budowlaną.", body: "Znajdziemy działkę, która jest nie tylko 'ładna', ale też 'budowlana'. Przed zakupem sprawdzimy plan zagospodarowania, dostępność mediów, podłoże geologiczne i orientację." },
    uk: { headline: "Не кожен луг - підходяща будівельна ділянка.", body: "Ми знайдемо для вас ділянку, яка не просто 'гарна', але й 'придатна для будівництва'. До купівлі перевіримо генплан, доступність комунікацій, геологічний ґрунт та орієнтацію." },
    sr: { headline: "Није свака ливада погодна грађевинска парцела.", body: "Наћи ћемо парцелу која није само 'лепа', већ и 'грађевински погодна'. Пре куповине проверићемо просторни план, доступност мрежа, геолошко тло и оријентацију." },
    hr: { headline: "Nije svaka livada prikladna građevinska parcela.", body: "Pronaći ćemo parcelu koja nije samo 'lijepa', već i 'gradiva'. Prije kupnje provjerit ćemo prostorni plan, dostupnost mreža, geološki teren i orijentaciju." },
    el: { headline: "Δεν είναι κάθε λιβάδι κατάλληλο οικόπεδο.", body: "Θα βρούμε οικόπεδο που δεν είναι μόνο 'όμορφο' αλλά και 'κατασκευάσιμο'. Πριν την αγορά ελέγχουμε το πολεοδομικό σχέδιο, τη διαθεσιμότητα δικτύων, το γεωλογικό υπέδαφος και τον προσανατολισμό." },
  },
  3: {
    sk: { headline: "Financovanie výstavby domu nie je bežná hypotéka.", body: "Stavba domu vyžaduje špecifické čerpanie úveru v tranžiach. Naši finanční špecialisti nastavia hypotéku presne na mieru harmonogramu výstavby. Komunikujeme priamo s bankou a znalcami, takže vy nemusíte nosiť faktúry. Garancia najlepších podmienok na trhu." },
    en: { headline: "Financing house construction is not a standard mortgage.", body: "House construction requires specific loan drawdowns in tranches. Our financial specialists tailor the mortgage to the construction schedule. We communicate directly with the bank and appraisers, so you don't need to carry invoices. Guarantee of the best market terms." },
    de: { headline: "Hausbaufinanzierung ist keine normale Hypothek.", body: "Der Hausbau erfordert spezifische Kreditauszahlungen in Tranchen. Unsere Finanzspezialisten passen die Hypothek genau auf den Bauplan an. Wir kommunizieren direkt mit der Bank und Gutachtern, damit Sie keine Rechnungen schleppen müssen." },
    fr: { headline: "Le financement de la construction d'une maison n'est pas une hypothèque ordinaire.", body: "La construction nécessite des décaissements de crédit en tranches. Nos spécialistes financiers adaptent l'hypothèque au calendrier de construction. Nous communiquons directement avec la banque et les experts." },
    hu: { headline: "A házépítés finanszírozása nem szokásos jelzáloghitel.", body: "Az építkezés specifikus hitelfelvételt igényel transzokban. Pénzügyi szakembereink pontosan az építési ütemtervhez igazítják a jelzáloghitelt. Közvetlenül kommunikálunk a bankkal és az értékbecslőkkel." },
    pl: { headline: "Finansowanie budowy domu to nie zwykły kredyt hipoteczny.", body: "Budowa domu wymaga specyficznego wykorzystania kredytu w transzach. Nasi specjaliści finansowi dostosują hipotekę do harmonogramu budowy. Komunikujemy się bezpośrednio z bankiem i rzeczoznawcami." },
    uk: { headline: "Фінансування будівництва дому - це не звичайна іпотека.", body: "Будівництво будинку потребує специфічного отримання кредиту траншами. Наші фінансові фахівці налаштують іпотеку під графік будівництва. Ми спілкуємося безпосередньо з банком та оцінювачами." },
    sr: { headline: "Финансирање изградње куће није обична хипотека.", body: "Изградња куће захтева специфично подизање кредита у траншама. Наши финансијски специјалисти прилагодиће хипотеку тачно распореду изградње. Комуницирамо директно са банком и проценитељима." },
    hr: { headline: "Financiranje izgradnje kuće nije obična hipoteka.", body: "Izgradnja kuće zahtijeva specifično podizanje kredita u tranšama. Naši financijski stručnjaci prilagoditi će hipoteku točno rasporedu izgradnje. Komuniciramo izravno s bankom i procjeniteljima." },
    el: { headline: "Η χρηματοδότηση κατασκευής σπιτιού δεν είναι συνηθισμένη υποθήκη.", body: "Η κατασκευή σπιτιού απαιτεί ειδική εκταμίευση δανείου σε δόσεις. Οι χρηματοοικονομικοί μας ειδικοί προσαρμόζουν την υποθήκη στο χρονοδιάγραμμα κατασκευής. Επικοινωνούμε απευθείας με την τράπεζα και τους εκτιμητές." },
  },
  4: {
    sk: { headline: "Dom, ktorý má hlavu a pätu ešte pred prvým výkopom.", body: "Naši architekti sú vám k dispozícii pre katalógové aj unikátne projekty. Pripravíme kompletnú projektovú dokumentáciu pre stavebné povolenie aj realizáciu. Myslíme na detaily, presvetlenie izieb aj energetickú úspornosť." },
    en: { headline: "A house that makes sense even before the first dig.", body: "Our architects are available for both catalog and unique projects. We prepare complete project documentation for building permits and construction. We think about details, room lighting and energy efficiency." },
    de: { headline: "Ein Haus, das vor dem ersten Spatenstich Sinn ergibt.", body: "Unsere Architekten stehen für Katalog- und einzigartige Projekte zur Verfügung. Wir erstellen vollständige Projektdokumentation für Baugenehmigungen und Bau. Wir denken an Details, Raumbeleuchtung und Energieeffizienz." },
    fr: { headline: "Une maison qui a du sens avant le premier terrassement.", body: "Nos architectes sont disponibles pour des projets catalogue et uniques. Nous préparons une documentation de projet complète pour les permis de construire et la réalisation. Nous pensons aux détails, à l'éclairage et à l'efficacité énergétique." },
    hu: { headline: "Ház, amely fejből és talpból áll az első ásónyom előtt.", body: "Építészeink rendelkezésre állnak katalógus és egyedi projektekhez egyaránt. Teljes projektdokumentációt készítünk az építési engedélyhez és a megvalósításhoz. Gondolunk a részletekre, a szobák megvilágítására és az energiahatékonyságra." },
    pl: { headline: "Dom z głową i sensem jeszcze przed pierwszym wykopem.", body: "Nasi architekci są do dyspozycji przy projektach katalogowych i unikalnych. Przygotowujemy kompletną dokumentację projektową do pozwolenia na budowę i realizacji. Myślimy o szczegółach, oświetleniu pomieszczeń i oszczędności energii." },
    uk: { headline: "Будинок, що має голову і хвіст ще до першого копку.", body: "Наші архітектори доступні для каталогових та унікальних проектів. Підготуємо повну проектну документацію для дозволу на будівництво та реалізації. Думаємо про деталі, освітлення кімнат та енергоефективність." },
    sr: { headline: "Кућа која има главу и реп пре прве копачине.", body: "Наши архитекти су на располагању за каталошке и јединствене пројекте. Припремамо комплетну пројектну документацију за грађевинску дозволу и реализацију. Мислимо на детаље, осветљење соба и енергетску ефикасност." },
    hr: { headline: "Kuća koja ima glavu i rep i prije prvog iskopa.", body: "Naši arhitekti su dostupni za kataloške i jedinstvene projekte. Pripremamo kompletnu projektnu dokumentaciju za građevinsku dozvolu i realizaciju. Mislimo na detalje, osvjetljenje soba i energetsku učinkovitost." },
    el: { headline: "Ένα σπίτι που έχει νόημα πριν από την πρώτη εκσκαφή.", body: "Οι αρχιτέκτονές μας είναι διαθέσιμοι για καταλογικά και μοναδικά έργα. Ετοιμάζουμε πλήρη τεκμηρίωση για άδειες δόμησης και κατασκευή. Σκεφτόμαστε λεπτομέρειες, φωτισμό και ενεργειακή απόδοση." },
  },
  5: {
    sk: { headline: "Byrokraciu nechajte na nás.", body: "Získanie stavebného povolenia je pre bežného človeka nočnou morou – pre nás je to rutina. Zastúpime vás v celom inžinierskom procese. Obiehame úrady, vybavujeme vyjadrenia dotknutých orgánov, správcov sietí a obce. Vy len počkáte na právoplatné rozhodnutie." },
    en: { headline: "Leave the bureaucracy to us.", body: "Getting a building permit is a nightmare for ordinary people – for us it's routine. We represent you in the entire engineering process. We visit offices, arrange statements from affected authorities, network managers and municipality. You just wait for the valid decision." },
    de: { headline: "Lassen Sie die Bürokratie uns überlassen.", body: "Eine Baugenehmigung zu erhalten ist für gewöhnliche Menschen ein Albtraum – für uns ist es Routine. Wir vertreten Sie im gesamten Ingenieurbüro-Prozess. Wir besuchen Behörden, arrangieren Stellungnahmen von betroffenen Behörden und Netzmanagern." },
    fr: { headline: "Laissez-nous gérer la bureaucratie.", body: "Obtenir un permis de construire est un cauchemar pour les gens ordinaires – pour nous, c'est de la routine. Nous vous représentons dans tout le processus d'ingénierie. Nous visitons les bureaux, organisons les avis des autorités concernées." },
    hu: { headline: "Bízza ránk a bürokratikus teendőket.", body: "Az építési engedély megszerzése a hétköznapi embereknek rémálom – nekünk rutin. Képviseljük Önt a teljes mérnöki folyamatban. Meglátogatjuk a hatóságokat, begyűjtjük az érintett szervek nyilatkozatait." },
    pl: { headline: "Biurokrację zostaw nam.", body: "Uzyskanie pozwolenia na budowę to koszmar dla zwykłych ludzi – dla nas rutyna. Reprezentujemy Cię w całym procesie inżynierskim. Chodzimy do urzędów, uzyskujemy opinie zainteresowanych organów, zarządców sieci i gminy." },
    uk: { headline: "Бюрократію залиште нам.", body: "Отримання дозволу на будівництво для звичайної людини - це кошмар, для нас - рутина. Представляємо вас у всьому інжиніринговому процесі. Ходимо по органах, отримуємо висновки причетних органів, управляючих мережами та громади." },
    sr: { headline: "Бирократију препустите нама.", body: "Добијање грађевинске дозволе је за обичне људе ноћна мора – за нас је рутина. Заступамо вас у целом инжењерском процесу. Обилазимо надлежне, прибављамо мишљења затечених органа, управника мрежа и општине." },
    hr: { headline: "Birokratiju prepustite nama.", body: "Dobivanje građevinske dozvole je za obične ljude noćna mora – za nas je rutina. Zastupamo vas u cijelom inženjerskom procesu. Obilazimo nadležne, pribavljamo mišljenja zahvaćenih tijela, upravljača mreža i općine." },
    el: { headline: "Αφήστε τη γραφειοκρατία σε εμάς.", body: "Η λήψη οικοδομικής άδειας είναι εφιάλτης για απλούς ανθρώπους – για εμάς είναι ρουτίνα. Σας εκπροσωπούμε σε όλη τη μηχανολογική διαδικασία. Επισκεπτόμαστε αρχές, συλλέγουμε γνωμοδοτήσεις από εμπλεκόμενες αρχές." },
  },
  6: {
    sk: { headline: "Kvalitná realizácia bez skrytých poplatkov.", body: "Realizujeme hrubé stavby, holodomy aj domy na kľúč. Pracujeme s overenými materiálmi a vlastným tímom odborníkov. Garantujeme dodržanie dohodnutého rozpočtu a termínov. Počas výstavby máte k dispozícii stavebný dozor a pravidelné reporty." },
    en: { headline: "Quality construction without hidden fees.", body: "We build shell structures, shell houses and turnkey homes. We work with verified materials and our own team of experts. We guarantee adherence to the agreed budget and deadlines. During construction you have a building supervisor and regular reports." },
    de: { headline: "Qualitätsbau ohne versteckte Gebühren.", body: "Wir bauen Rohbauten, Rohgehäuse und schlüsselfertige Häuser. Wir arbeiten mit verifizierten Materialien und unserem eigenen Expertenteam. Wir garantieren die Einhaltung des vereinbarten Budgets und der Termine." },
    fr: { headline: "Construction de qualité sans frais cachés.", body: "Nous réalisons des gros œuvres, maisons coques et maisons clé en main. Nous travaillons avec des matériaux vérifiés et notre propre équipe d'experts. Nous garantissons le respect du budget et des délais convenus." },
    hu: { headline: "Minőségi kivitelezés rejtett díjak nélkül.", body: "Szerkezetkész, héjházas és kulcsrakész épületeket valósítunk meg. Ellenőrzött anyagokkal és saját szakértői csapattal dolgozunk. Garantáljuk az elfogadott költségvetés és határidők betartását." },
    pl: { headline: "Jakościowa realizacja bez ukrytych opłat.", body: "Realizujemy stany surowe, domy szkieletowe i domy pod klucz. Pracujemy ze sprawdzonymi materiałami i własnym zespołem ekspertów. Gwarantujemy przestrzeganie uzgodnionego budżetu i terminów." },
    uk: { headline: "Якісна реалізація без прихованих платежів.", body: "Реалізуємо чорнові будівлі, каркасні будинки та будинки під ключ. Працюємо з перевіреними матеріалами та власною командою фахівців. Гарантуємо дотримання погодженого бюджету та термінів." },
    sr: { headline: "Квалитетна реализација без скривених накнада.", body: "Реализујемо грубе градње, куће у скелету и куће под кључ. Радимо са проверееним материјалима и сопственим тимом стручњака. Гарантујемо поштовање договореног буџета и рокова." },
    hr: { headline: "Kvalitetna realizacija bez skrivenih naknada.", body: "Realiziramo grube gradnje, kuće u skeletu i kuće pod ključ. Radimo s provjerenim materijalima i vlastitim timom stručnjaka. Jamčimo poštivanje dogovorenog proračuna i rokova." },
    el: { headline: "Ποιοτική κατασκευή χωρίς κρυφές χρεώσεις.", body: "Κατασκευάζουμε σκελετούς, κελύφη και παραδοτέα σπίτια. Εργαζόμαστε με ελεγμένα υλικά και τη δική μας ομάδα ειδικών. Εγγυόμαστε τήρηση του συμφωνηθέντος προϋπολογισμού και χρονοδιαγράμματος." },
  },
  7: {
    sk: { headline: "Aby všetko fungovalo po otočení kohútikom.", body: "Dom bez sietí je len hrubá stavba. Zabezpečíme kompletnú realizáciu prípojok vody, elektriny, plynu a kanalizácie. Riešime výkopy, pokládku, revízne správy aj finálne osadenie meračov. Koordinujeme všetko tak, aby bol dom pripravený na plnohodnotné užívanie." },
    en: { headline: "So everything works when you turn the tap.", body: "A house without utilities is just a shell. We provide complete installation of water, electricity, gas and sewage connections. We handle excavations, laying, revision reports and final meter installation. We coordinate everything for full occupancy." },
    de: { headline: "Damit beim Aufdrehen des Hahns alles funktioniert.", body: "Ein Haus ohne Versorgungsanschlüsse ist nur ein Rohbau. Wir sorgen für vollständige Installation von Wasser, Strom, Gas und Kanalisation. Wir führen Erdarbeiten, Verlegung, Revisionsberichte und finale Zählerinstallation durch." },
    fr: { headline: "Pour que tout fonctionne en ouvrant le robinet.", body: "Une maison sans réseaux n'est qu'une coque. Nous assurons l'installation complète des raccordements eau, électricité, gaz et égouts. Nous gérons les fouilles, la pose, les rapports de révision et l'installation finale des compteurs." },
    hu: { headline: "Hogy minden működjön, amikor elfordítja a csapot.", body: "A közművek nélküli ház csak héjszerkezet. Biztosítjuk a víz, villany, gáz és csatornacsatlakozók teljes telepítését. Kezeljük a földmunkákat, fektetést, felülvizsgálati jelentéseket és a végső mérőtepítést." },
    pl: { headline: "Żeby wszystko działało po odkręceniu kranu.", body: "Dom bez sieci to tylko stan surowy. Zapewniamy kompleksową realizację przyłączy wody, elektryczności, gazu i kanalizacji. Zajmujemy się wykopami, układaniem, protokołami rewizyjnymi i finalnym montażem liczników." },
    uk: { headline: "Щоб все працювало після повороту крана.", body: "Будинок без комунікацій - це лише чорнова будівля. Забезпечуємо повне підключення води, електрики, газу та каналізації. Вирішуємо земляні роботи, прокладку, ревізійні звіти та фінальне встановлення лічильників." },
    sr: { headline: "Да би све радило при окретању славине.", body: "Кућа без мрежа је само груба градња. Обезбеђујемо комплетну реализацију прикључака воде, струје, гаса и канализације. Решавамо ископе, полагање, ревизијске извештаје и финалну монтажу мерача." },
    hr: { headline: "Da sve funkcionira kad okrećete slavinu.", body: "Kuća bez mreža je samo gruba gradnja. Osiguravamo kompletnu realizaciju priključaka vode, struje, plina i kanalizacije. Rješavamo iskope, polaganje, revizijske izvještaje i finalnu montažu mjerača." },
    el: { headline: "Ώστε όλα να λειτουργούν όταν ανοίγετε τη βρύση.", body: "Ένα σπίτι χωρίς δίκτυα είναι μόνο κέλυφος. Παρέχουμε πλήρη εγκατάσταση συνδέσεων νερού, ρεύματος, αερίου και αποχέτευσης. Διαχειριζόμαστε εκσκαφές, τοποθέτηση, αναφορές αναθεώρησης και τελική εγκατάσταση μετρητών." },
  },
  8: {
    sk: { headline: "Posledná pečiatka a odovzdanie kľúčov.", body: "Cieľová rovinka. Pripravíme všetky revízie, certifikáty, geometrické plány a dokumenty potrebné ku kolaudačnému konaniu. Zastúpime vás pri miestnom šetrení stavebného úradu. Vám odovzdáme už skolaudovaný dom so súpisným číslom, pripravený na nasťahovanie." },
    en: { headline: "The final stamp and handing over the keys.", body: "The home stretch. We prepare all revisions, certificates, geometric plans and documents needed for approval proceedings. We represent you at the local building authority inspection. We hand you a fully approved house with a registration number, ready to move in." },
    de: { headline: "Der letzte Stempel und die Schlüsselübergabe.", body: "Die Zielgerade. Wir bereiten alle Revisionen, Zertifikate, Lagepläne und Dokumente für das Abnahmeverfahren vor. Wir vertreten Sie bei der örtlichen Prüfung der Baubehörde. Wir übergeben Ihnen ein bereits abgenommenes Haus mit Hausnummer, bereit zum Einzug." },
    fr: { headline: "Le dernier tampon et la remise des clés.", body: "La ligne d'arrivée. Nous préparons toutes les révisions, certificats, plans géométriques et documents nécessaires pour la réception. Nous vous représentons lors de l'inspection locale de l'autorité d'urbanisme. Nous vous remettons une maison déjà réceptionnée avec numéro d'inventaire, prête à emménager." },
    hu: { headline: "Az utolsó pecsét és a kulcsátadás.", body: "A végegyenes. Elkészítjük az összes felülvizsgálatot, tanúsítványt, geometriai tervet és az engedélyezési eljáráshoz szükséges dokumentumokat. Képviseljük Önt a helyi építési hatóság helyszíni vizsgálatán. Átadjuk a már engedélyezett házat leltári számmal, készen a beköltözésre." },
    pl: { headline: "Ostatnia pieczątka i przekazanie kluczy.", body: "Meta. Przygotowujemy wszystkie rewizje, certyfikaty, plany geodezyjne i dokumenty niezbędne do procedury odbioru. Reprezentujemy Cię podczas lokalnej inspekcji urzędu budowlanego. Przekazujemy Ci już odebrany dom z numerem inwentaryzacyjnym, gotowy do zamieszkania." },
    uk: { headline: "Остання печатка та передача ключів.", body: "Фінішна пряма. Готуємо всі ревізії, сертифікати, геодезичні плани та документи, необхідні для колаудаційного провадження. Представляємо вас на місцевій перевірці будівельного органу. Передаємо вже прийнятий будинок з інвентарним номером, готовий до заселення." },
    sr: { headline: "Последни печат и предаја кључева.", body: "Циљна равница. Припремамо све ревизије, сертификате, геодетске планове и документе потребне за поступак колаудације. Заступамо вас при локалном испитивању грађевинске управе. Предајемо вам већ колаудовану кућу са инвентарским бројем, спремну за усељавање." },
    hr: { headline: "Posljednji pečat i predaja ključeva.", body: "Ciljna ravnica. Pripremamo sve revizije, certifikate, geodetske planove i dokumente potrebne za kolaudacijski postupak. Zastupamo vas pri lokalnoj provjeri građevinskog ureda. Predajemo vam već kolaudiranu kuću s inventarnim brojem, spremu za useljavanje." },
    el: { headline: "Η τελευταία σφραγίδα και η παράδοση κλειδιών.", body: "Η τελική ευθεία. Ετοιμάζουμε όλες τις αναθεωρήσεις, πιστοποιητικά, γεωμετρικά σχέδια και έγγραφα για τη διαδικασία παραλαβής. Σας εκπροσωπούμε στην τοπική επιθεώρηση της αρχής δόμησης. Σας παραδίδουμε ένα ήδη εγκεκριμένο σπίτι με αριθμό καταγραφής, έτοιμο για μετακόμιση." },
  },
};

const SERVICE_INDEX_MAP = {
  sellYourProperty: 1, selectAndBuyLand: 2, mortgageArrangement: 3, projectDocumentation: 4,
  buildingPermitService: 5, houseConstruction: 6, utilityConnection: 7, finalApproval: 8
};

export default function ServiceDetailModal({ isOpen, onClose, service }) {
  const { language, t } = useLanguage();
  if (!service) return null;

  const idx = SERVICE_INDEX_MAP[service.nazovKey];
  const trans = idx && SERVICE_TRANSLATIONS[idx] ? (SERVICE_TRANSLATIONS[idx][language] || SERVICE_TRANSLATIONS[idx]['sk']) : null;
  const headline = trans ? trans.headline : service.headline;
  const body = trans ? trans.body : service.body;
  const name = service.nazovKey ? t(service.nazovKey) : service.nazov;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <service.icon className="w-6 h-6 text-white" />
            </div>
            {name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{headline}</h3>
          </div>

          {service.detailImages && service.detailImages.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {service.detailImages.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow-lg">
                  <img src={img} alt={`${name} - ${idx + 1}`} className="w-full h-64 object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">{body}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <a href="tel:+421905138124" className="flex-1">
              <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all text-lg">
                📞 {CALL_LABELS[language] || CALL_LABELS.en}: +421 905 138 124
              </button>
            </a>
            <a href={`mailto:info@americanliving.sk?subject=${encodeURIComponent(name)}`} className="flex-1">
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all">
                ✉️ {EMAIL_LABELS[language] || EMAIL_LABELS.en}
              </button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}