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
import Layout from './Layout.jsx';


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
}

export const pagesConfig = {
    mainPage: "Domov",
    Pages: PAGES,
    Layout: Layout,
};