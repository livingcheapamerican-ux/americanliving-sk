import Domov from './pages/Domov';
import Katalog from './pages/Katalog';
import DetailDomu from './pages/DetailDomu';
import Konfigurator from './pages/Konfigurator';
import AkoToFunguje from './pages/AkoToFunguje';
import ONas from './pages/ONas';
import Kontakt from './pages/Kontakt';
import SrovnaniDomu from './pages/SrovnaniDomu';
import KonfiguratorProstoHouse from './pages/KonfiguratorProstoHouse';
import KonfiguratorTicabhouse from './pages/KonfiguratorTicabhouse';
import AdminGeneratorObrazkov from './pages/AdminGeneratorObrazkov';
import AdminMigraciaObrazkov from './pages/AdminMigraciaObrazkov';
import AdminGoogleDrive from './pages/AdminGoogleDrive';
import AdminDokumenty from './pages/AdminDokumenty';
import InteraktivnyKonfigurator from './pages/InteraktivnyKonfigurator';
import GaleriaRealizacii from './pages/GaleriaRealizacii';
import AdminSpravaDomov from './pages/AdminSpravaDomov';
import AdminAnalyzaDomov from './pages/AdminAnalyzaDomov';
import Konfigurator3D from './pages/Konfigurator3D';
import AdminUploadFotiekDomov from './pages/AdminUploadFotiekDomov';
import KonfiguratorFlatDouble from './pages/KonfiguratorFlatDouble';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Domov": Domov,
    "Katalog": Katalog,
    "DetailDomu": DetailDomu,
    "Konfigurator": Konfigurator,
    "AkoToFunguje": AkoToFunguje,
    "ONas": ONas,
    "Kontakt": Kontakt,
    "SrovnaniDomu": SrovnaniDomu,
    "KonfiguratorProstoHouse": KonfiguratorProstoHouse,
    "KonfiguratorTicabhouse": KonfiguratorTicabhouse,
    "AdminGeneratorObrazkov": AdminGeneratorObrazkov,
    "AdminMigraciaObrazkov": AdminMigraciaObrazkov,
    "AdminGoogleDrive": AdminGoogleDrive,
    "AdminDokumenty": AdminDokumenty,
    "InteraktivnyKonfigurator": InteraktivnyKonfigurator,
    "GaleriaRealizacii": GaleriaRealizacii,
    "AdminSpravaDomov": AdminSpravaDomov,
    "AdminAnalyzaDomov": AdminAnalyzaDomov,
    "Konfigurator3D": Konfigurator3D,
    "AdminUploadFotiekDomov": AdminUploadFotiekDomov,
    "KonfiguratorFlatDouble": KonfiguratorFlatDouble,
}

export const pagesConfig = {
    mainPage: "Domov",
    Pages: PAGES,
    Layout: __Layout,
};