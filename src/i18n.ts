/**
 * Meridian i18n — PT · EN · ES · FR
 * data-i18n="key" | data-i18n-html="key" | data-i18n-attr="aria-label:key,title:key2"
 */
export type Lang = 'pt' | 'en' | 'es' | 'fr';

export const LANGS: { id: Lang; label: string; htmlLang: string }[] = [
  { id: 'pt', label: 'PT', htmlLang: 'pt-BR' },
  { id: 'en', label: 'EN', htmlLang: 'en' },
  { id: 'es', label: 'ES', htmlLang: 'es' },
  { id: 'fr', label: 'FR', htmlLang: 'fr' },
];

const STORAGE_KEY = 'meridian-lang';

type Dict = Record<string, string>;

const pt: Dict = {
  'lang.label': 'Idioma',
  'skip': 'Ir ao conteúdo',
  'nav.historia': 'História',
  'nav.surfaces': 'Superfícies',
  'nav.tokens': 'Tokens',
  'nav.type': 'Tipografia',
  'nav.system': 'Sistema',
  'nav.studio': 'Studio',
  'nav.lab': 'Lab',
  'nav.archive': 'Arquivo',
  'nav.places': 'Ir',
  'nav.shortcuts': 'Atalhos',
  'nav.foundations': 'Fundamentos',
  'nav.workshops': 'Oficinas',
  'nav.surface': 'Superfície',
  'nav.motion': 'Motion',
  'nav.editorial': 'Editorial',
  'nav.lifeline': 'Lifeline',
  'nav.svg': 'SVG 1:1',
  'nav.atelier': 'Atelier TS',
  'nav.skills': 'Skills & Taste',
  'nav.star': 'Estrelar',
  'nav.githubAria': 'Dar estrela ao Meridian no GitHub',
  'nav.openMenu': 'Abrir menu',
  'nav.closeMenu': 'Fechar menu',
  'nav.sections': 'Seções do Design System',
  'top.mode': 'B2C Invisível',
  'top.grain': 'Grain',
  'top.tokens': 'Tokens',
  'top.preview': 'Prévia ↗',
  'top.components': 'Components ↗',
  'top.componentsShort': 'Lab ↗',
  'hero.eyebrow': 'Meridian · Sistema Visual & Motion',
  'hero.title': 'Meridian Design System',
  'hero.lead':
    'Um meridiano visual entre o cotidiano calmo e o rigor técnico: papel tátil, uma só tinta, navegação sem latência — para React Native, Web em CSS puro e SVG 1:1.',
  'hero.lab': 'Abrir Components Lab ↗',
  'hero.preview': 'Prévia de App ↗',
  'hero.manifesto': 'Manifesto ↗',
  'hero.farol': 'O Farol e o Meridiano ↗',
  'hero.gann': 'Dossiê W.D. Gann ↗',
  'hero.tokens': 'Inspecionar Tokens CSS & TS',
  'hero.cmdk': 'Navegação Rápida',
  'hero.cycle': 'Alternar Atmosfera →',
  'tel.surface': 'Superfície Ativa',
  'tel.ground': 'Ground / Ink',
  'tel.contrast': 'Contraste WCAG',
  'tel.grain': 'PaperGrain & Modo',
  'coda.eyebrow': 'Por isso Meridian',
  'coda.title': 'Uma linha invisível entre o cotidiano e o rigor',
  'coda.body':
    'O design system herda essa pergunta: cada token, cada superfície e cada gesto precisam ajudar quem navega a interface a encontrar o caminho — sem ruído, sem desvio, com uma só tinta e uma referência estável.',
  'coda.manifesto': 'Manifesto ↗',
  'coda.dossier': 'Dossiê ilustrado ↗',
  'footer.manifesto': 'Manifesto ↗',
  'footer.farol': 'O Farol e o Meridiano ↗',
  'footer.gann': 'Dossiê W.D. Gann ↗',
  'ds.link': 'Meridian DS ↗',
  'layout.header': 'Header',
  'layout.menu': 'Menu',
  'gann.skip': 'Ir ao conteúdo',
  'gann.eyebrow': 'Dossiê arquivístico · 1878–1955',
  'gann.title': 'William Delbert Gann',
  'gann.lead':
    'Trader, autor e geometrista de mercado — a trajetória que liga o algodão do Texas ao papel quadriculado de Wall Street.',
  'gann.nav.origem': 'Origem',
  'gann.nav.wall': 'Wall Street',
  'gann.nav.geo': 'Geometria',
  'gann.nav.obras': 'Obras',
  'gann.nav.legado': 'Legado',
  'gann.contents': 'Contents',
  'gann.glance': 'At a glance',
  'hist.brand': 'O Farol',
  'hist.eyebrow': 'Dossiê editorial · ensaio de marca',
  'hist.title': 'O Farol e o Meridiano',
  'hist.docTitle': 'O Farol e o Meridiano — História · Meridian Archival',
  'hist.footer': 'Meridian Design System · O Farol e o Meridiano',
  'hist.lead':
    'Antes dos mapas e dos instrumentos, atravessar o oceano era um exercício de convicção — e a referência estável que torna uma marca confiável.',
  'hist.nav.oceano': 'Oceano',
  'hist.nav.desvio': 'Desvio',
  'hist.nav.meridianos': 'Meridianos',
  'hist.nav.farol': 'Farol',
  'hist.nav.placa': 'Placa',
  'hist.nav.identidade': 'Identidade',
  'hist.nav.marca': 'Marca',
  'hist.rail.oceano': '01 · Oceano',
  'hist.rail.desvio': '02 · Desvio',
  'hist.rail.meridianos': '03 · Meridianos',
  'hist.rail.farol': '04 · Farol',
  'hist.rail.placa': '05 · Placa',
  'hist.rail.identidade': '06 · Identidade',
  'hist.rail.marca': '07 · Marca',
  'hist.s1': 'O oceano sem mapa',
  'hist.s2': 'Ninguém se perde de uma vez',
  'hist.s3': 'Linhas que ninguém admira',
  'hist.s4': 'O farol na costa',
  'hist.s5': 'A pergunta na placa',
  'hist.s6': 'O que não se vê',
  'hist.s7': 'Permanecer alinhado',
  'man.eyebrow': 'Documento fundador · Meridian Design System',
  'man.title': 'Manifesto Meridian',
  'man.lead':
    'Não perseguimos atenção. Mantemos direção — uma linha invisível entre o cotidiano calmo e o rigor que se pode auditar.',
  'man.nav.pre': 'Preâmbulo',
  'man.nav.ref': 'Referência',
  'man.nav.ink': 'Tinta',
  'man.nav.sil': 'Silêncio',
  'man.nav.paper': 'Papel',
  'man.nav.rigor': 'Rigor',
  'man.nav.util': 'Utilidade',
  'man.nav.oath': 'Juramento',
  'lab.ds': 'Design System',
  'lab.studio': 'Studio',
  'prev.studio': 'Meridian Studio',
  'src.orbital': 'orbital-archive · Série histórica orbital',
  'src.orbitalYears': 'orbital-archive · Série histórica 2020–2026',
  'src.solar': 'solar-model · Radiação anual incidente',
};

const en: Dict = {
  'lang.label': 'Language',
  'skip': 'Skip to content',
  'nav.historia': 'History',
  'nav.surfaces': 'Surfaces',
  'nav.tokens': 'Tokens',
  'nav.type': 'Typography',
  'nav.system': 'System',
  'nav.studio': 'Studio',
  'nav.lab': 'Lab',
  'nav.archive': 'Archive',
  'nav.places': 'Go',
  'nav.shortcuts': 'Shortcuts',
  'nav.foundations': 'Foundations',
  'nav.workshops': 'Workshops',
  'nav.surface': 'Surface',
  'nav.motion': 'Motion',
  'nav.editorial': 'Editorial',
  'nav.lifeline': 'Lifeline',
  'nav.svg': 'SVG 1:1',
  'nav.atelier': 'Atelier TS',
  'nav.skills': 'Skills & Taste',
  'nav.star': 'Star',
  'nav.githubAria': 'Star Meridian on GitHub',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.sections': 'Design System sections',
  'top.mode': 'B2C Invisible',
  'top.grain': 'Grain',
  'top.tokens': 'Tokens',
  'top.preview': 'Preview ↗',
  'top.components': 'Components ↗',
  'top.componentsShort': 'Lab ↗',
  'hero.eyebrow': 'Meridian · Visual & Motion System',
  'hero.title': 'Meridian Design System',
  'hero.lead':
    'A visual meridian between calm everyday life and technical rigor: tactile paper, a single ink, zero-latency navigation — for React Native, pure CSS Web, and 1:1 SVG.',
  'hero.lab': 'Open Components Lab ↗',
  'hero.preview': 'App Preview ↗',
  'hero.manifesto': 'Manifesto ↗',
  'hero.farol': 'The Lighthouse & the Meridian ↗',
  'hero.gann': 'W.D. Gann Dossier ↗',
  'hero.tokens': 'Inspect CSS & TS Tokens',
  'hero.cmdk': 'Quick Navigation',
  'hero.cycle': 'Cycle Atmosphere →',
  'tel.surface': 'Active Surface',
  'tel.ground': 'Ground / Ink',
  'tel.contrast': 'WCAG Contrast',
  'tel.grain': 'PaperGrain & Mode',
  'coda.eyebrow': 'Why Meridian',
  'coda.title': 'An invisible line between the everyday and rigor',
  'coda.body':
    'The design system inherits this question: every token, surface, and gesture must help whoever navigates the interface find the way — no noise, no drift, one ink, one stable reference.',
  'coda.manifesto': 'Manifesto ↗',
  'coda.dossier': 'Illustrated dossier ↗',
  'footer.manifesto': 'Manifesto ↗',
  'footer.farol': 'The Lighthouse & the Meridian ↗',
  'footer.gann': 'W.D. Gann Dossier ↗',
  'ds.link': 'Meridian DS ↗',
  'layout.header': 'Header',
  'layout.menu': 'Menu',
  'gann.skip': 'Skip to content',
  'gann.eyebrow': 'Archival dossier · 1878–1955',
  'gann.title': 'William Delbert Gann',
  'gann.lead':
    'Trader, author, and market geometrist — the path from Texas cotton to Wall Street graph paper.',
  'gann.nav.origem': 'Origin',
  'gann.nav.wall': 'Wall Street',
  'gann.nav.geo': 'Geometry',
  'gann.nav.obras': 'Works',
  'gann.nav.legado': 'Legacy',
  'gann.contents': 'Contents',
  'gann.glance': 'At a glance',
  'hist.brand': 'Lighthouse',
  'hist.eyebrow': 'Editorial dossier · brand essay',
  'hist.title': 'The Lighthouse & the Meridian',
  'hist.docTitle': 'The Lighthouse & the Meridian — History · Meridian Archival',
  'hist.footer': 'Meridian Design System · The Lighthouse & the Meridian',
  'hist.lead':
    'Before maps and instruments, crossing the ocean was an act of conviction — and the stable reference that makes a brand trustworthy.',
  'hist.nav.oceano': 'Ocean',
  'hist.nav.desvio': 'Drift',
  'hist.nav.meridianos': 'Meridians',
  'hist.nav.farol': 'Lighthouse',
  'hist.nav.placa': 'Plaque',
  'hist.nav.identidade': 'Identity',
  'hist.nav.marca': 'Brand',
  'hist.rail.oceano': '01 · Ocean',
  'hist.rail.desvio': '02 · Drift',
  'hist.rail.meridianos': '03 · Meridians',
  'hist.rail.farol': '04 · Lighthouse',
  'hist.rail.placa': '05 · Plaque',
  'hist.rail.identidade': '06 · Identity',
  'hist.rail.marca': '07 · Brand',
  'hist.s1': 'The ocean without a map',
  'hist.s2': 'No one is lost all at once',
  'hist.s3': 'Lines nobody applauds',
  'hist.s4': 'The lighthouse on the coast',
  'hist.s5': 'The question on the plaque',
  'hist.s6': 'What cannot be seen',
  'hist.s7': 'Staying aligned',
  'man.eyebrow': 'Founding document · Meridian Design System',
  'man.title': 'Meridian Manifesto',
  'man.lead':
    'We do not chase attention. We keep direction — an invisible line between calm everyday life and rigor you can audit.',
  'man.nav.pre': 'Preamble',
  'man.nav.ref': 'Reference',
  'man.nav.ink': 'Ink',
  'man.nav.sil': 'Silence',
  'man.nav.paper': 'Paper',
  'man.nav.rigor': 'Rigor',
  'man.nav.util': 'Utility',
  'man.nav.oath': 'Oath',
  'lab.ds': 'Design System',
  'lab.studio': 'Studio',
  'prev.studio': 'Meridian Studio',
  'src.orbital': 'orbital-archive · Historical orbital series',
  'src.orbitalYears': 'orbital-archive · Historical series 2020–2026',
  'src.solar': 'solar-model · Annual incident radiation',
};

const es: Dict = {
  'lang.label': 'Idioma',
  'skip': 'Ir al contenido',
  'nav.historia': 'Historia',
  'nav.surfaces': 'Superficies',
  'nav.tokens': 'Tokens',
  'nav.type': 'Tipografía',
  'nav.system': 'Sistema',
  'nav.studio': 'Studio',
  'nav.lab': 'Lab',
  'nav.archive': 'Archivo',
  'nav.places': 'Ir',
  'nav.shortcuts': 'Atajos',
  'nav.foundations': 'Fundamentos',
  'nav.workshops': 'Talleres',
  'nav.surface': 'Superficie',
  'nav.motion': 'Motion',
  'nav.editorial': 'Editorial',
  'nav.lifeline': 'Lifeline',
  'nav.svg': 'SVG 1:1',
  'nav.atelier': 'Atelier TS',
  'nav.skills': 'Skills y Taste',
  'nav.star': 'Estrella',
  'nav.githubAria': 'Dar estrella a Meridian en GitHub',
  'nav.openMenu': 'Abrir menú',
  'nav.closeMenu': 'Cerrar menú',
  'nav.sections': 'Secciones del Design System',
  'top.mode': 'B2C Invisible',
  'top.grain': 'Grain',
  'top.tokens': 'Tokens',
  'top.preview': 'Vista previa ↗',
  'top.components': 'Components ↗',
  'top.componentsShort': 'Lab ↗',
  'hero.eyebrow': 'Meridian · Sistema Visual y Motion',
  'hero.title': 'Meridian Design System',
  'hero.lead':
    'Un meridiano visual entre lo cotidiano calmado y el rigor técnico: papel táctil, una sola tinta, navegación sin latencia — para React Native, Web en CSS puro y SVG 1:1.',
  'hero.lab': 'Abrir Components Lab ↗',
  'hero.preview': 'Vista previa de App ↗',
  'hero.manifesto': 'Manifiesto ↗',
  'hero.farol': 'El Faro y el Meridiano ↗',
  'hero.gann': 'Dossier W.D. Gann ↗',
  'hero.tokens': 'Inspeccionar Tokens CSS y TS',
  'hero.cmdk': 'Navegación rápida',
  'hero.cycle': 'Cambiar atmósfera →',
  'tel.surface': 'Superficie activa',
  'tel.ground': 'Ground / Ink',
  'tel.contrast': 'Contraste WCAG',
  'tel.grain': 'PaperGrain y Modo',
  'coda.eyebrow': 'Por eso Meridian',
  'coda.title': 'Una línea invisible entre lo cotidiano y el rigor',
  'coda.body':
    'El design system hereda esta pregunta: cada token, superficie y gesto debe ayudar a quien navega la interfaz a encontrar el camino — sin ruido, sin desvío, con una sola tinta y una referencia estable.',
  'coda.manifesto': 'Manifiesto ↗',
  'coda.dossier': 'Dossier ilustrado ↗',
  'footer.manifesto': 'Manifiesto ↗',
  'footer.farol': 'El Faro y el Meridiano ↗',
  'footer.gann': 'Dossier W.D. Gann ↗',
  'ds.link': 'Meridian DS ↗',
  'layout.header': 'Header',
  'layout.menu': 'Menú',
  'gann.skip': 'Ir al contenido',
  'gann.eyebrow': 'Dossier de archivo · 1878–1955',
  'gann.title': 'William Delbert Gann',
  'gann.lead':
    'Trader, autor y geometrista de mercado — la trayectoria que une el algodón de Texas al papel cuadriculado de Wall Street.',
  'gann.nav.origem': 'Origen',
  'gann.nav.wall': 'Wall Street',
  'gann.nav.geo': 'Geometría',
  'gann.nav.obras': 'Obras',
  'gann.nav.legado': 'Legado',
  'gann.contents': 'Contents',
  'gann.glance': 'At a glance',
  'hist.brand': 'El Faro',
  'hist.eyebrow': 'Dossier editorial · ensayo de marca',
  'hist.title': 'El Faro y el Meridiano',
  'hist.docTitle': 'El Faro y el Meridiano — Historia · Meridian Archival',
  'hist.footer': 'Meridian Design System · El Faro y el Meridiano',
  'hist.lead':
    'Antes de los mapas y los instrumentos, cruzar el océano era un ejercicio de convicción — y la referencia estable que hace confiable una marca.',
  'hist.nav.oceano': 'Océano',
  'hist.nav.desvio': 'Desvío',
  'hist.nav.meridianos': 'Meridianos',
  'hist.nav.farol': 'Faro',
  'hist.nav.placa': 'Placa',
  'hist.nav.identidade': 'Identidad',
  'hist.nav.marca': 'Marca',
  'hist.rail.oceano': '01 · Océano',
  'hist.rail.desvio': '02 · Desvío',
  'hist.rail.meridianos': '03 · Meridianos',
  'hist.rail.farol': '04 · Faro',
  'hist.rail.placa': '05 · Placa',
  'hist.rail.identidade': '06 · Identidad',
  'hist.rail.marca': '07 · Marca',
  'hist.s1': 'El océano sin mapa',
  'hist.s2': 'Nadie se pierde de una vez',
  'hist.s3': 'Líneas que nadie admira',
  'hist.s4': 'El faro en la costa',
  'hist.s5': 'La pregunta en la placa',
  'hist.s6': 'Lo que no se ve',
  'hist.s7': 'Permanecer alineado',
  'man.eyebrow': 'Documento fundacional · Meridian Design System',
  'man.title': 'Manifiesto Meridian',
  'man.lead':
    'No perseguimos atención. Mantenemos dirección — una línea invisible entre lo cotidiano calmado y el rigor que se puede auditar.',
  'man.nav.pre': 'Preámbulo',
  'man.nav.ref': 'Referencia',
  'man.nav.ink': 'Tinta',
  'man.nav.sil': 'Silencio',
  'man.nav.paper': 'Papel',
  'man.nav.rigor': 'Rigor',
  'man.nav.util': 'Utilidad',
  'man.nav.oath': 'Juramento',
  'lab.ds': 'Design System',
  'lab.studio': 'Studio',
  'prev.studio': 'Meridian Studio',
  'src.orbital': 'orbital-archive · Serie histórica orbital',
  'src.orbitalYears': 'orbital-archive · Serie histórica 2020–2026',
  'src.solar': 'solar-model · Radiación anual incidente',
};

const fr: Dict = {
  'lang.label': 'Langue',
  'skip': 'Aller au contenu',
  'nav.historia': 'Histoire',
  'nav.surfaces': 'Surfaces',
  'nav.tokens': 'Tokens',
  'nav.type': 'Typographie',
  'nav.system': 'Système',
  'nav.studio': 'Studio',
  'nav.lab': 'Lab',
  'nav.archive': 'Archive',
  'nav.places': 'Aller',
  'nav.shortcuts': 'Raccourcis',
  'nav.foundations': 'Fondations',
  'nav.workshops': 'Ateliers',
  'nav.surface': 'Surface',
  'nav.motion': 'Motion',
  'nav.editorial': 'Éditorial',
  'nav.lifeline': 'Lifeline',
  'nav.svg': 'SVG 1:1',
  'nav.atelier': 'Atelier TS',
  'nav.skills': 'Skills & Taste',
  'nav.star': 'Étoile',
  'nav.githubAria': 'Mettre une étoile à Meridian sur GitHub',
  'nav.openMenu': 'Ouvrir le menu',
  'nav.closeMenu': 'Fermer le menu',
  'nav.sections': 'Sections du Design System',
  'top.mode': 'B2C Invisible',
  'top.grain': 'Grain',
  'top.tokens': 'Tokens',
  'top.preview': 'Aperçu ↗',
  'top.components': 'Components ↗',
  'top.componentsShort': 'Lab ↗',
  'hero.eyebrow': 'Meridian · Système Visuel & Motion',
  'hero.title': 'Meridian Design System',
  'hero.lead':
    'Un méridien visuel entre le quotidien calme et la rigueur technique : papier tactile, une seule encre, navigation sans latence — pour React Native, Web en CSS pur et SVG 1:1.',
  'hero.lab': 'Ouvrir Components Lab ↗',
  'hero.preview': 'Aperçu App ↗',
  'hero.manifesto': 'Manifeste ↗',
  'hero.farol': 'Le Phare et le Méridien ↗',
  'hero.gann': 'Dossier W.D. Gann ↗',
  'hero.tokens': 'Inspecter les tokens CSS & TS',
  'hero.cmdk': 'Navigation rapide',
  'hero.cycle': 'Changer d’atmosphère →',
  'tel.surface': 'Surface active',
  'tel.ground': 'Ground / Ink',
  'tel.contrast': 'Contraste WCAG',
  'tel.grain': 'PaperGrain & Mode',
  'coda.eyebrow': 'Pourquoi Meridian',
  'coda.title': 'Une ligne invisible entre le quotidien et la rigueur',
  'coda.body':
    'Le design system hérite de cette question : chaque token, surface et geste doit aider qui navigue l’interface à trouver le chemin — sans bruit, sans dérive, une seule encre, une référence stable.',
  'coda.manifesto': 'Manifeste ↗',
  'coda.dossier': 'Dossier illustré ↗',
  'footer.manifesto': 'Manifeste ↗',
  'footer.farol': 'Le Phare et le Méridien ↗',
  'footer.gann': 'Dossier W.D. Gann ↗',
  'ds.link': 'Meridian DS ↗',
  'layout.header': 'Header',
  'layout.menu': 'Menu',
  'gann.skip': 'Aller au contenu',
  'gann.eyebrow': 'Dossier d’archives · 1878–1955',
  'gann.title': 'William Delbert Gann',
  'gann.lead':
    'Trader, auteur et géométriste de marché — le trajet du coton du Texas au papier millimétré de Wall Street.',
  'gann.nav.origem': 'Origine',
  'gann.nav.wall': 'Wall Street',
  'gann.nav.geo': 'Géométrie',
  'gann.nav.obras': 'Œuvres',
  'gann.nav.legado': 'Héritage',
  'gann.contents': 'Contents',
  'gann.glance': 'At a glance',
  'hist.brand': 'Le Phare',
  'hist.eyebrow': 'Dossier éditorial · essai de marque',
  'hist.title': 'Le Phare et le Méridien',
  'hist.docTitle': 'Le Phare et le Méridien — Histoire · Meridian Archival',
  'hist.footer': 'Meridian Design System · Le Phare et le Méridien',
  'hist.lead':
    'Avant les cartes et les instruments, traverser l’océan était un exercice de conviction — et la référence stable qui rend une marque digne de confiance.',
  'hist.nav.oceano': 'Océan',
  'hist.nav.desvio': 'Dérive',
  'hist.nav.meridianos': 'Méridiens',
  'hist.nav.farol': 'Phare',
  'hist.nav.placa': 'Plaque',
  'hist.nav.identidade': 'Identité',
  'hist.nav.marca': 'Marque',
  'hist.rail.oceano': '01 · Océan',
  'hist.rail.desvio': '02 · Dérive',
  'hist.rail.meridianos': '03 · Méridiens',
  'hist.rail.farol': '04 · Phare',
  'hist.rail.placa': '05 · Plaque',
  'hist.rail.identidade': '06 · Identité',
  'hist.rail.marca': '07 · Marque',
  'hist.s1': 'L’océan sans carte',
  'hist.s2': 'Personne ne se perd d’un coup',
  'hist.s3': 'Des lignes que personne n’admire',
  'hist.s4': 'Le phare sur la côte',
  'hist.s5': 'La question sur la plaque',
  'hist.s6': 'Ce que l’on ne voit pas',
  'hist.s7': 'Rester aligné',
  'man.eyebrow': 'Document fondateur · Meridian Design System',
  'man.title': 'Manifeste Meridian',
  'man.lead':
    'Nous ne poursuivons pas l’attention. Nous maintenons la direction — une ligne invisible entre le quotidien calme et la rigueur auditable.',
  'man.nav.pre': 'Préambule',
  'man.nav.ref': 'Référence',
  'man.nav.ink': 'Encre',
  'man.nav.sil': 'Silence',
  'man.nav.paper': 'Papier',
  'man.nav.rigor': 'Rigueur',
  'man.nav.util': 'Utilité',
  'man.nav.oath': 'Serment',
  'lab.ds': 'Design System',
  'lab.studio': 'Studio',
  'prev.studio': 'Meridian Studio',
  'src.orbital': 'orbital-archive · Série historique orbitale',
  'src.orbitalYears': 'orbital-archive · Série historique 2020–2026',
  'src.solar': 'solar-model · Rayonnement annuel incident',
};

const CATALOG: Record<Lang, Dict> = { pt, en, es, fr };

let current: Lang = 'pt';

export function getLang(): Lang {
  return current;
}

export function t(key: string, lang: Lang = current): string {
  return CATALOG[lang][key] ?? CATALOG.pt[key] ?? key;
}

function detectLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved && CATALOG[saved]) return saved;
  const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
  if (nav === 'en' || nav === 'es' || nav === 'fr' || nav === 'pt') return nav;
  return 'pt';
}

export function applyI18n(lang: Lang = current): void {
  current = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  const meta = LANGS.find((l) => l.id === lang)!;
  document.documentElement.lang = meta.htmlLang;

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const val = t(key, lang);
    if (el.childElementCount === 0) el.textContent = val;
    else {
      // Preserve nested markup (e.g. kbd) — replace only text nodes when possible
      const textChild = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
      if (textChild) textChild.textContent = val + (val.endsWith(' ') ? '' : ' ');
      else el.textContent = val;
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (!key) return;
    el.innerHTML = t(key, lang);
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr');
    if (!spec) return;
    spec.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key, lang));
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  window.dispatchEvent(new CustomEvent('meridian:lang', { detail: { lang } }));
}

export function setLang(lang: Lang): void {
  if (!CATALOG[lang]) return;
  applyI18n(lang);
}

export function mountLangSwitcher(slot: Element | null): void {
  if (!slot) return;
  const wrap = document.createElement('div');
  wrap.className = 'ds-lang';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', t('lang.label'));
  wrap.setAttribute('data-i18n-attr', 'aria-label:lang.label');

  LANGS.forEach((l) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.lang = l.id;
    btn.textContent = l.label;
    btn.setAttribute('aria-pressed', l.id === current ? 'true' : 'false');
    btn.title = l.htmlLang;
    btn.addEventListener('click', () => setLang(l.id));
    wrap.appendChild(btn);
  });

  slot.replaceChildren(wrap);
}

export function initI18n(options: { slots?: string | string[] } = {}): Lang {
  current = detectLang();
  const selectors = options.slots
    ? Array.isArray(options.slots)
      ? options.slots
      : [options.slots]
    : ['[data-lang-slot]'];
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((slot) => mountLangSwitcher(slot));
  });
  applyI18n(current);
  return current;
}
