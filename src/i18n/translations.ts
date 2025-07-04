// Multi-language Translation System
// Supports dynamic language switching and locale management

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'it' | 'nl';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  [lang: string]: TranslationKey;
}

// English translations (base language)
const en: TranslationKey = {
  common: {
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    open: 'Open',
    download: 'Download',
    upload: 'Upload',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    home: 'Home',
    help: 'Help',
    documentation: 'Documentation',
    support: 'Support',
    about: 'About',
    contact: 'Contact',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    account: 'Account',
    security: 'Security',
    privacy: 'Privacy',
    terms: 'Terms of Service',
    copyright: '© 2025 Vibelux. All rights reserved.'
  },
  
  nav: {
    dashboard: 'Dashboard',
    marketplace: 'Marketplace',
    insights: 'AI Insights',
    projects: 'Projects',
    monitoring: 'Monitoring',
    calculators: 'Calculators',
    design: 'Design Studio',
    reports: 'Reports',
    admin: 'Admin',
    affiliate: 'Affiliate Program',
    support: 'Support',
    settings: 'Settings'
  },
  
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    rememberMe: 'Remember me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    verifyEmail: 'Verify Email',
    emailVerified: 'Email Verified',
    sendVerification: 'Send Verification Email',
    twoFactorAuth: 'Two-Factor Authentication',
    enterCode: 'Enter Code',
    invalidCredentials: 'Invalid email or password',
    accountLocked: 'Account locked. Please contact support.',
    sessionExpired: 'Session expired. Please sign in again.'
  },
  
  dashboard: {
    welcome: 'Welcome back',
    overview: 'Overview',
    recentActivity: 'Recent Activity',
    quickStats: 'Quick Stats',
    revenue: 'Revenue',
    users: 'Users',
    growth: 'Growth',
    performance: 'Performance',
    alerts: 'Alerts',
    tasks: 'Tasks',
    projects: 'Projects',
    systemHealth: 'System Health',
    uptime: 'Uptime',
    responseTime: 'Response Time',
    errorRate: 'Error Rate'
  },
  
  marketplace: {
    title: 'Marketplace',
    browse: 'Browse Products',
    myListings: 'My Listings',
    createListing: 'Create Listing',
    categories: 'Categories',
    lettuce: 'Lettuce',
    herbs: 'Herbs',
    microgreens: 'Microgreens',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    flowers: 'Flowers',
    seeds: 'Seeds',
    equipment: 'Equipment',
    supplies: 'Supplies',
    price: 'Price',
    quantity: 'Quantity',
    quality: 'Quality',
    organic: 'Organic',
    conventional: 'Conventional',
    certified: 'Certified',
    location: 'Location',
    shipping: 'Shipping',
    available: 'Available',
    soldOut: 'Sold Out',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    makeOffer: 'Make Offer',
    contactSeller: 'Contact Seller',
    reviews: 'Reviews',
    rating: 'Rating',
    seller: 'Seller',
    buyer: 'Buyer',
    verified: 'Verified',
    newListing: 'New Listing',
    featured: 'Featured',
    trending: 'Trending',
    recentlyViewed: 'Recently Viewed',
    savedItems: 'Saved Items',
    orderHistory: 'Order History',
    messages: 'Messages'
  },
  
  cultivation: {
    rooms: 'Grow Rooms',
    plants: 'Plants',
    strains: 'Strains',
    cycles: 'Cultivation Cycles',
    tasks: 'Tasks',
    harvests: 'Harvests',
    nutrients: 'Nutrients',
    environment: 'Environment',
    lighting: 'Lighting',
    irrigation: 'Irrigation',
    climate: 'Climate Control',
    sensors: 'Sensors',
    alerts: 'Alerts',
    analytics: 'Analytics',
    yield: 'Yield',
    quality: 'Quality',
    efficiency: 'Efficiency',
    optimization: 'Optimization',
    scheduling: 'Scheduling',
    tracking: 'Tracking',
    reporting: 'Reporting',
    compliance: 'Compliance'
  },
  
  calculations: {
    ppfd: 'PPFD Calculator',
    dli: 'DLI Calculator',
    roi: 'ROI Calculator',
    energy: 'Energy Calculator',
    coverage: 'Coverage Calculator',
    co2: 'CO₂ Calculator',
    vpd: 'VPD Calculator',
    nutrients: 'Nutrient Calculator',
    water: 'Water Usage Calculator',
    cost: 'Cost Calculator',
    inputValues: 'Input Values',
    results: 'Results',
    calculate: 'Calculate',
    reset: 'Reset',
    saveResults: 'Save Results',
    exportResults: 'Export Results',
    compareResults: 'Compare Results',
    history: 'Calculation History'
  },
  
  affiliate: {
    title: 'Affiliate Program',
    dashboard: 'Affiliate Dashboard',
    earnings: 'Earnings',
    commissions: 'Commissions',
    referrals: 'Referrals',
    clicks: 'Clicks',
    conversions: 'Conversions',
    conversionRate: 'Conversion Rate',
    payouts: 'Payouts',
    pendingPayout: 'Pending Payout',
    totalEarned: 'Total Earned',
    currentTier: 'Current Tier',
    nextTier: 'Next Tier',
    affiliateLink: 'Your Affiliate Link',
    copyLink: 'Copy Link',
    shareLink: 'Share Link',
    marketingMaterials: 'Marketing Materials',
    banners: 'Banners',
    emailTemplates: 'Email Templates',
    socialPosts: 'Social Media Posts',
    terms: 'Affiliate Terms',
    faq: 'FAQ',
    support: 'Affiliate Support',
    joinProgram: 'Join Affiliate Program',
    applicationPending: 'Application Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  },
  
  admin: {
    title: 'Admin Panel',
    users: 'User Management',
    roles: 'Roles & Permissions',
    billing: 'Billing',
    subscriptions: 'Subscriptions',
    invoices: 'Invoices',
    payments: 'Payments',
    analytics: 'Analytics',
    reports: 'Reports',
    settings: 'System Settings',
    configuration: 'Configuration',
    integrations: 'Integrations',
    api: 'API Management',
    security: 'Security',
    logs: 'System Logs',
    audit: 'Audit Trail',
    backups: 'Backups',
    maintenance: 'Maintenance',
    updates: 'Updates',
    monitoring: 'Monitoring',
    performance: 'Performance',
    cache: 'Cache Management',
    queue: 'Job Queue',
    emails: 'Email Settings',
    notifications: 'Notification Settings'
  },
  
  errors: {
    generic: 'Something went wrong. Please try again.',
    notFound: 'Page not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    serverError: 'Server error',
    networkError: 'Network error. Please check your connection.',
    validationError: 'Please check your input and try again.',
    requiredField: 'This field is required',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    fileTooBig: 'File size exceeds limit',
    unsupportedFileType: 'Unsupported file type',
    quotaExceeded: 'Quota exceeded',
    rateLimited: 'Too many requests. Please try again later.'
  },
  
  success: {
    saved: 'Successfully saved',
    updated: 'Successfully updated',
    deleted: 'Successfully deleted',
    created: 'Successfully created',
    sent: 'Successfully sent',
    uploaded: 'Successfully uploaded',
    downloaded: 'Successfully downloaded',
    copied: 'Copied to clipboard',
    subscribed: 'Successfully subscribed',
    unsubscribed: 'Successfully unsubscribed',
    verified: 'Successfully verified',
    connected: 'Successfully connected',
    disconnected: 'Successfully disconnected'
  },
  
  time: {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
    ago: 'ago',
    in: 'in',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastYear: 'Last Year'
  },
  
  units: {
    celsius: '°C',
    fahrenheit: '°F',
    kelvin: 'K',
    meters: 'm',
    feet: 'ft',
    inches: 'in',
    kilograms: 'kg',
    pounds: 'lbs',
    grams: 'g',
    ounces: 'oz',
    liters: 'L',
    gallons: 'gal',
    milliliters: 'mL',
    percent: '%',
    ppm: 'ppm',
    ppfd: 'μmol/m²/s',
    dli: 'mol/m²/day',
    watts: 'W',
    kilowatts: 'kW',
    hours: 'hrs',
    square_meters: 'm²',
    square_feet: 'ft²'
  }
};

// Spanish translations
const es: TranslationKey = {
  common: {
    yes: 'Sí',
    no: 'No',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Finalizar',
    submit: 'Enviar',
    reset: 'Restablecer',
    close: 'Cerrar',
    open: 'Abrir',
    download: 'Descargar',
    upload: 'Subir',
    export: 'Exportar',
    import: 'Importar',
    refresh: 'Actualizar',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    dashboard: 'Panel',
    home: 'Inicio',
    help: 'Ayuda',
    documentation: 'Documentación',
    support: 'Soporte',
    about: 'Acerca de',
    contact: 'Contacto',
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    account: 'Cuenta',
    security: 'Seguridad',
    privacy: 'Privacidad',
    terms: 'Términos de servicio',
    copyright: '© 2025 Vibelux. Todos los derechos reservados.'
  },
  // Add more Spanish translations...
};

// French translations
const fr: TranslationKey = {
  common: {
    yes: 'Oui',
    no: 'Non',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    // Add more French translations...
  }
};

// German translations
const de: TranslationKey = {
  common: {
    yes: 'Ja',
    no: 'Nein',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    update: 'Aktualisieren',
    search: 'Suchen',
    filter: 'Filtern',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    warning: 'Warnung',
    info: 'Information',
    // Add more German translations...
  }
};

// Japanese translations
const ja: TranslationKey = {
  common: {
    yes: 'はい',
    no: 'いいえ',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    create: '作成',
    update: '更新',
    search: '検索',
    filter: 'フィルター',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    // Add more Japanese translations...
  }
};

// Chinese translations
const zh: TranslationKey = {
  common: {
    yes: '是',
    no: '否',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    update: '更新',
    search: '搜索',
    filter: '筛选',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    // Add more Chinese translations...
  }
};

// Portuguese translations
const pt: TranslationKey = {
  common: {
    yes: 'Sim',
    no: 'Não',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    update: 'Atualizar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',
    // Add more Portuguese translations...
  }
};

// Italian translations
const it: TranslationKey = {
  common: {
    yes: 'Sì',
    no: 'No',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    create: 'Crea',
    update: 'Aggiorna',
    search: 'Cerca',
    filter: 'Filtra',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    warning: 'Avviso',
    info: 'Informazione',
    // Add more Italian translations...
  }
};

// Dutch translations
const nl: TranslationKey = {
  common: {
    yes: 'Ja',
    no: 'Nee',
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    create: 'Aanmaken',
    update: 'Bijwerken',
    search: 'Zoeken',
    filter: 'Filteren',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',
    warning: 'Waarschuwing',
    info: 'Informatie',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    finish: 'Voltooien',
    submit: 'Verzenden',
    reset: 'Resetten',
    close: 'Sluiten',
    open: 'Openen',
    download: 'Downloaden',
    upload: 'Uploaden',
    export: 'Exporteren',
    import: 'Importeren',
    refresh: 'Vernieuwen',
    settings: 'Instellingen',
    profile: 'Profiel',
    logout: 'Uitloggen',
    login: 'Inloggen',
    signup: 'Registreren',
    dashboard: 'Dashboard',
    home: 'Home',
    help: 'Help',
    documentation: 'Documentatie',
    support: 'Ondersteuning',
    about: 'Over',
    contact: 'Contact',
    language: 'Taal',
    theme: 'Thema',
    notifications: 'Meldingen',
    account: 'Account',
    security: 'Beveiliging',
    privacy: 'Privacy',
    terms: 'Servicevoorwaarden',
    copyright: '© 2025 Vibelux. Alle rechten voorbehouden.'
  },
  
  nav: {
    dashboard: 'Dashboard',
    marketplace: 'Marktplaats',
    insights: 'AI Inzichten',
    projects: 'Projecten',
    monitoring: 'Monitoring',
    calculators: 'Calculators',
    design: 'Design Studio',
    reports: 'Rapporten',
    admin: 'Beheer',
    affiliate: 'Affiliate Programma',
    support: 'Ondersteuning',
    settings: 'Instellingen'
  },
  
  auth: {
    signIn: 'Inloggen',
    signUp: 'Registreren',
    signOut: 'Uitloggen',
    email: 'E-mail',
    password: 'Wachtwoord',
    confirmPassword: 'Bevestig Wachtwoord',
    forgotPassword: 'Wachtwoord vergeten?',
    resetPassword: 'Wachtwoord Resetten',
    rememberMe: 'Onthoud mij',
    dontHaveAccount: 'Heb je nog geen account?',
    alreadyHaveAccount: 'Heb je al een account?',
    createAccount: 'Account Aanmaken',
    verifyEmail: 'E-mail Verifiëren',
    emailVerified: 'E-mail Geverifieerd',
    sendVerification: 'Verificatie E-mail Verzenden',
    twoFactorAuth: 'Tweefactorauthenticatie',
    enterCode: 'Code Invoeren',
    invalidCredentials: 'Ongeldig e-mailadres of wachtwoord',
    accountLocked: 'Account vergrendeld. Neem contact op met ondersteuning.',
    sessionExpired: 'Sessie verlopen. Log opnieuw in.'
  },
  
  dashboard: {
    welcome: 'Welkom terug',
    overview: 'Overzicht',
    recentActivity: 'Recente Activiteit',
    quickStats: 'Snelle Statistieken',
    revenue: 'Omzet',
    users: 'Gebruikers',
    growth: 'Groei',
    performance: 'Prestaties',
    alerts: 'Waarschuwingen',
    tasks: 'Taken',
    projects: 'Projecten',
    systemHealth: 'Systeemgezondheid',
    uptime: 'Uptime',
    responseTime: 'Responstijd',
    errorRate: 'Foutpercentage'
  },
  
  marketplace: {
    title: 'Marktplaats',
    browse: 'Producten Bekijken',
    myListings: 'Mijn Aanbiedingen',
    createListing: 'Aanbieding Maken',
    categories: 'Categorieën',
    lettuce: 'Sla',
    herbs: 'Kruiden',
    microgreens: 'Microgroenten',
    vegetables: 'Groenten',
    fruits: 'Fruit',
    flowers: 'Bloemen',
    seeds: 'Zaden',
    equipment: 'Apparatuur',
    supplies: 'Benodigdheden',
    price: 'Prijs',
    quantity: 'Hoeveelheid',
    quality: 'Kwaliteit',
    organic: 'Biologisch',
    conventional: 'Conventioneel',
    certified: 'Gecertificeerd',
    location: 'Locatie',
    shipping: 'Verzending',
    available: 'Beschikbaar',
    soldOut: 'Uitverkocht',
    addToCart: 'Toevoegen aan Winkelwagen',
    buyNow: 'Nu Kopen',
    makeOffer: 'Bod Doen',
    contactSeller: 'Contact met Verkoper',
    reviews: 'Reviews',
    rating: 'Beoordeling',
    seller: 'Verkoper',
    buyer: 'Koper',
    verified: 'Geverifieerd',
    newListing: 'Nieuwe Aanbieding',
    featured: 'Uitgelicht',
    trending: 'Trending',
    recentlyViewed: 'Recent Bekeken',
    savedItems: 'Opgeslagen Items',
    orderHistory: 'Bestelgeschiedenis',
    messages: 'Berichten'
  },
  
  cultivation: {
    rooms: 'Kweekruimtes',
    plants: 'Planten',
    strains: 'Variëteiten',
    cycles: 'Kweekrondes',
    tasks: 'Taken',
    harvests: 'Oogsten',
    nutrients: 'Voedingsstoffen',
    environment: 'Omgeving',
    lighting: 'Verlichting',
    irrigation: 'Irrigatie',
    climate: 'Klimaatbeheersing',
    sensors: 'Sensoren',
    alerts: 'Waarschuwingen',
    analytics: 'Analyses',
    yield: 'Opbrengst',
    quality: 'Kwaliteit',
    efficiency: 'Efficiëntie',
    optimization: 'Optimalisatie',
    scheduling: 'Planning',
    tracking: 'Tracking',
    reporting: 'Rapportage',
    compliance: 'Compliance'
  },
  
  affiliate: {
    title: 'Affiliate Programma',
    dashboard: 'Affiliate Dashboard',
    earnings: 'Verdiensten',
    commissions: 'Commissies',
    referrals: 'Doorverwijzingen',
    clicks: 'Klikken',
    conversions: 'Conversies',
    conversionRate: 'Conversieratio',
    payouts: 'Uitbetalingen',
    pendingPayout: 'Uitbetaling in Behandeling',
    totalEarned: 'Totaal Verdiend',
    currentTier: 'Huidige Tier',
    nextTier: 'Volgende Tier',
    affiliateLink: 'Jouw Affiliate Link',
    copyLink: 'Link Kopiëren',
    shareLink: 'Link Delen',
    marketingMaterials: 'Marketingmateriaal',
    banners: 'Banners',
    emailTemplates: 'E-mail Templates',
    socialPosts: 'Social Media Posts',
    terms: 'Affiliate Voorwaarden',
    faq: 'FAQ',
    support: 'Affiliate Ondersteuning',
    joinProgram: 'Deelnemen aan Affiliate Programma',
    applicationPending: 'Aanvraag in Behandeling',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen'
  }
};

// All translations
export const translations: Translations = {
  en,
  es,
  fr,
  de,
  ja,
  zh,
  pt,
  it,
  nl
};

// Get nested translation value
export function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Translation function
export function t(key: string, lang: Language = 'en', params?: Record<string, any>): string {
  const translation = getNestedTranslation(translations[lang] || translations.en, key);
  
  if (!params) return translation;
  
  // Replace parameters in translation
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    translation
  );
}

// Available languages
export const languages: Array<{ code: Language; name: string; flag: string }> = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
];

// Get browser language
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return languages.find(lang => lang.code === browserLang)?.code || 'en';
}

// Format number based on locale
export function formatNumber(num: number, lang: Language): string {
  const locales: Record<Language, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    pt: 'pt-BR',
    it: 'it-IT',
    nl: 'nl-NL'
  };
  
  return new Intl.NumberFormat(locales[lang] || 'en-US').format(num);
}

// Format currency based on locale
export function formatCurrency(amount: number, lang: Language, currency = 'USD'): string {
  const locales: Record<Language, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    pt: 'pt-BR',
    it: 'it-IT',
    nl: 'nl-NL'
  };
  
  return new Intl.NumberFormat(locales[lang] || 'en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// Format date based on locale
export function formatDate(date: Date, lang: Language, options?: Intl.DateTimeFormatOptions): string {
  const locales: Record<Language, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    pt: 'pt-BR',
    it: 'it-IT',
    nl: 'nl-NL'
  };
  
  return new Intl.DateTimeFormat(locales[lang] || 'en-US', options).format(date);
}