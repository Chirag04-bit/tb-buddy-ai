import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es" | "fr" | "hi" | "ar";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    appTitle: "TB Detection Assistant",
    appSubtitle: "AI-Powered Tuberculosis Diagnostic Support",
    history: "History",
    signOut: "Sign Out",
    newAssessment: "New Assessment",
    
    // Patient Form
    patientInfo: "Patient Information",
    patientName: "Patient Name",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    symptomDuration: "Duration of Symptoms",
    medicalHistory: "Medical History",
    medicalHistoryPlaceholder: "Previous conditions, medications, allergies...",
    
    // Symptoms
    symptomsAssessment: "Symptoms Assessment",
    persistentCough: "Persistent cough",
    nightSweats: "Night sweats",
    weightLoss: "Weight loss",
    fever: "Fever",
    fatigue: "Fatigue",
    chestPain: "Chest pain",
    lossOfAppetite: "Loss of appetite",
    coughingBlood: "Coughing up blood",
    
    // Lab Results
    labResults: "Laboratory Results (Optional)",
    labResultsPlaceholder: "Enter any available lab test results (e.g., sputum microscopy, GeneXpert, Mantoux test)...",
    
    // Medical Imaging
    medicalImaging: "Medical Imaging",
    uploadImage: "Upload X-ray or CT scan image",
    
    // Actions
    generateDiagnosis: "Generate Diagnosis",
    analyzing: "Analyzing...",
    resetForm: "Reset Form",
    
    // Results
    diagnosticResults: "Diagnostic Results",
    confidenceLevel: "Confidence Level",
    high: "High",
    medium: "Medium",
    low: "Low",
    keyFindings: "Key Findings",
    recommendation: "Recommendation",
    disclaimer: "Disclaimer",
    disclaimerText: "This is an AI-assisted preliminary assessment tool. Always consult qualified healthcare professionals for definitive diagnosis and treatment.",
    
    // History
    assessmentHistory: "Assessment History",
    reviewPast: "Review past diagnostic assessments",
    searchPlaceholder: "Search by patient name or diagnosis...",
    filterByConfidence: "Filter by confidence",
    allConfidenceLevels: "All Confidence Levels",
    date: "Date",
    name: "Name",
    actions: "Actions",
    view: "View",
    delete: "Delete",
    backToList: "Back to List",
    noAssessments: "No assessments found",
    loadingAssessments: "Loading assessments...",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    emailPlaceholder: "your.email@example.com",
    passwordPlaceholder: "••••••••",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    authSubtitle: "Sign in to access your assessments",
    
    // Footer
    footerText: "TB Detection Assistant - For Educational and Screening Purposes Only",
    footerSubtext: "Always consult qualified healthcare professionals for medical advice",
    
    // Toast messages
    missingInfo: "Missing Information",
    missingInfoDesc: "Please fill out the patient information form.",
    missingSymptoms: "Missing Symptoms",
    missingSymptomsDesc: "Please select at least one symptom.",
    analysisComplete: "Analysis Complete",
    analysisCompleteDesc: "Diagnostic analysis has been generated successfully.",
    analysisFailed: "Analysis Failed",
    deleted: "Deleted",
    deletedDesc: "Assessment deleted successfully",
    error: "Error",
    errorLoadHistory: "Failed to load assessment history",
    errorDelete: "Failed to delete assessment",
  },
  es: {
    // Header
    appTitle: "Asistente de Detección de TB",
    appSubtitle: "Soporte Diagnóstico de Tuberculosis con IA",
    history: "Historial",
    signOut: "Cerrar Sesión",
    newAssessment: "Nueva Evaluación",
    
    // Patient Form
    patientInfo: "Información del Paciente",
    patientName: "Nombre del Paciente",
    age: "Edad",
    gender: "Género",
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
    symptomDuration: "Duración de los Síntomas",
    medicalHistory: "Historia Médica",
    medicalHistoryPlaceholder: "Condiciones previas, medicamentos, alergias...",
    
    // Symptoms
    symptomsAssessment: "Evaluación de Síntomas",
    persistentCough: "Tos persistente",
    nightSweats: "Sudores nocturnos",
    weightLoss: "Pérdida de peso",
    fever: "Fiebre",
    fatigue: "Fatiga",
    chestPain: "Dolor en el pecho",
    lossOfAppetite: "Pérdida de apetito",
    coughingBlood: "Tos con sangre",
    
    // Lab Results
    labResults: "Resultados de Laboratorio (Opcional)",
    labResultsPlaceholder: "Ingrese cualquier resultado de prueba disponible...",
    
    // Medical Imaging
    medicalImaging: "Imagenología Médica",
    uploadImage: "Cargar imagen de radiografía o tomografía",
    
    // Actions
    generateDiagnosis: "Generar Diagnóstico",
    analyzing: "Analizando...",
    resetForm: "Reiniciar Formulario",
    
    // Results
    diagnosticResults: "Resultados del Diagnóstico",
    confidenceLevel: "Nivel de Confianza",
    high: "Alto",
    medium: "Medio",
    low: "Bajo",
    keyFindings: "Hallazgos Clave",
    recommendation: "Recomendación",
    disclaimer: "Descargo de Responsabilidad",
    disclaimerText: "Esta es una herramienta de evaluación preliminar asistida por IA. Siempre consulte a profesionales de la salud calificados.",
    
    // History
    assessmentHistory: "Historial de Evaluaciones",
    reviewPast: "Revisar evaluaciones diagnósticas anteriores",
    searchPlaceholder: "Buscar por nombre del paciente o diagnóstico...",
    filterByConfidence: "Filtrar por confianza",
    allConfidenceLevels: "Todos los Niveles de Confianza",
    date: "Fecha",
    name: "Nombre",
    actions: "Acciones",
    view: "Ver",
    delete: "Eliminar",
    backToList: "Volver a la Lista",
    noAssessments: "No se encontraron evaluaciones",
    loadingAssessments: "Cargando evaluaciones...",
    
    // Auth
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    emailPlaceholder: "tu.correo@ejemplo.com",
    passwordPlaceholder: "••••••••",
    signingIn: "Iniciando Sesión...",
    creatingAccount: "Creando Cuenta...",
    authSubtitle: "Inicie sesión para acceder a sus evaluaciones",
    
    // Footer
    footerText: "Asistente de Detección de TB - Solo con Fines Educativos y de Detección",
    footerSubtext: "Siempre consulte a profesionales de la salud calificados",
    
    // Toast messages
    missingInfo: "Información Faltante",
    missingInfoDesc: "Por favor complete el formulario de información del paciente.",
    missingSymptoms: "Síntomas Faltantes",
    missingSymptomsDesc: "Por favor seleccione al menos un síntoma.",
    analysisComplete: "Análisis Completado",
    analysisCompleteDesc: "El análisis diagnóstico se ha generado exitosamente.",
    analysisFailed: "Análisis Fallido",
    deleted: "Eliminado",
    deletedDesc: "Evaluación eliminada exitosamente",
    error: "Error",
    errorLoadHistory: "Error al cargar el historial de evaluaciones",
    errorDelete: "Error al eliminar la evaluación",
  },
  fr: {
    // Header
    appTitle: "Assistant de Détection de la TB",
    appSubtitle: "Soutien Diagnostique de la Tuberculose par IA",
    history: "Historique",
    signOut: "Déconnexion",
    newAssessment: "Nouvelle Évaluation",
    
    // Patient Form
    patientInfo: "Informations sur le Patient",
    patientName: "Nom du Patient",
    age: "Âge",
    gender: "Genre",
    male: "Masculin",
    female: "Féminin",
    other: "Autre",
    symptomDuration: "Durée des Symptômes",
    medicalHistory: "Antécédents Médicaux",
    medicalHistoryPlaceholder: "Conditions antérieures, médicaments, allergies...",
    
    // Symptoms
    symptomsAssessment: "Évaluation des Symptômes",
    persistentCough: "Toux persistante",
    nightSweats: "Sueurs nocturnes",
    weightLoss: "Perte de poids",
    fever: "Fièvre",
    fatigue: "Fatigue",
    chestPain: "Douleur thoracique",
    lossOfAppetite: "Perte d'appétit",
    coughingBlood: "Toux avec du sang",
    
    // Lab Results
    labResults: "Résultats de Laboratoire (Facultatif)",
    labResultsPlaceholder: "Entrez les résultats de test disponibles...",
    
    // Medical Imaging
    medicalImaging: "Imagerie Médicale",
    uploadImage: "Télécharger une image de radiographie ou de scanner",
    
    // Actions
    generateDiagnosis: "Générer le Diagnostic",
    analyzing: "Analyse en cours...",
    resetForm: "Réinitialiser le Formulaire",
    
    // Results
    diagnosticResults: "Résultats du Diagnostic",
    confidenceLevel: "Niveau de Confiance",
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
    keyFindings: "Principales Découvertes",
    recommendation: "Recommandation",
    disclaimer: "Avertissement",
    disclaimerText: "Ceci est un outil d'évaluation préliminaire assisté par IA. Consultez toujours des professionnels de santé qualifiés.",
    
    // History
    assessmentHistory: "Historique des Évaluations",
    reviewPast: "Examiner les évaluations diagnostiques passées",
    searchPlaceholder: "Rechercher par nom du patient ou diagnostic...",
    filterByConfidence: "Filtrer par confiance",
    allConfidenceLevels: "Tous les Niveaux de Confiance",
    date: "Date",
    name: "Nom",
    actions: "Actions",
    view: "Voir",
    delete: "Supprimer",
    backToList: "Retour à la Liste",
    noAssessments: "Aucune évaluation trouvée",
    loadingAssessments: "Chargement des évaluations...",
    
    // Auth
    signIn: "Se Connecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    emailPlaceholder: "votre.email@exemple.com",
    passwordPlaceholder: "••••••••",
    signingIn: "Connexion en cours...",
    creatingAccount: "Création du Compte...",
    authSubtitle: "Connectez-vous pour accéder à vos évaluations",
    
    // Footer
    footerText: "Assistant de Détection de la TB - À Des Fins Éducatives et de Dépistage Uniquement",
    footerSubtext: "Consultez toujours des professionnels de santé qualifiés",
    
    // Toast messages
    missingInfo: "Informations Manquantes",
    missingInfoDesc: "Veuillez remplir le formulaire d'informations sur le patient.",
    missingSymptoms: "Symptômes Manquants",
    missingSymptomsDesc: "Veuillez sélectionner au moins un symptôme.",
    analysisComplete: "Analyse Terminée",
    analysisCompleteDesc: "L'analyse diagnostique a été générée avec succès.",
    analysisFailed: "Échec de l'Analyse",
    deleted: "Supprimé",
    deletedDesc: "Évaluation supprimée avec succès",
    error: "Erreur",
    errorLoadHistory: "Échec du chargement de l'historique des évaluations",
    errorDelete: "Échec de la suppression de l'évaluation",
  },
  hi: {
    // Header
    appTitle: "टीबी पहचान सहायक",
    appSubtitle: "एआई-संचालित तपेदिक निदान सहायता",
    history: "इतिहास",
    signOut: "साइन आउट",
    newAssessment: "नया मूल्यांकन",
    
    // Patient Form
    patientInfo: "रोगी की जानकारी",
    patientName: "रोगी का नाम",
    age: "आयु",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    symptomDuration: "लक्षणों की अवधि",
    medicalHistory: "चिकित्सा इतिहास",
    medicalHistoryPlaceholder: "पिछली स्थितियां, दवाएं, एलर्जी...",
    
    // Symptoms
    symptomsAssessment: "लक्षण मूल्यांकन",
    persistentCough: "लगातार खांसी",
    nightSweats: "रात का पसीना",
    weightLoss: "वजन घटना",
    fever: "बुखार",
    fatigue: "थकान",
    chestPain: "सीने में दर्द",
    lossOfAppetite: "भूख न लगना",
    coughingBlood: "खून के साथ खांसी",
    
    // Lab Results
    labResults: "प्रयोगशाला परिणाम (वैकल्पिक)",
    labResultsPlaceholder: "कोई भी उपलब्ध परीक्षण परिणाम दर्ज करें...",
    
    // Medical Imaging
    medicalImaging: "चिकित्सा इमेजिंग",
    uploadImage: "एक्स-रे या सीटी स्कैन छवि अपलोड करें",
    
    // Actions
    generateDiagnosis: "निदान उत्पन्न करें",
    analyzing: "विश्लेषण कर रहे हैं...",
    resetForm: "फॉर्म रीसेट करें",
    
    // Results
    diagnosticResults: "निदान परिणाम",
    confidenceLevel: "विश्वास स्तर",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    keyFindings: "मुख्य निष्कर्ष",
    recommendation: "सिफारिश",
    disclaimer: "अस्वीकरण",
    disclaimerText: "यह एक एआई-सहायता प्राप्त प्रारंभिक मूल्यांकन उपकरण है। निश्चित निदान और उपचार के लिए हमेशा योग्य स्वास्थ्य पेशेवरों से परामर्श लें।",
    
    // History
    assessmentHistory: "मूल्यांकन इतिहास",
    reviewPast: "पिछले निदान मूल्यांकनों की समीक्षा करें",
    searchPlaceholder: "रोगी के नाम या निदान से खोजें...",
    filterByConfidence: "विश्वास द्वारा फ़िल्टर करें",
    allConfidenceLevels: "सभी विश्वास स्तर",
    date: "तारीख",
    name: "नाम",
    actions: "क्रियाएं",
    view: "देखें",
    delete: "हटाएं",
    backToList: "सूची में वापस जाएं",
    noAssessments: "कोई मूल्यांकन नहीं मिला",
    loadingAssessments: "मूल्यांकन लोड हो रहे हैं...",
    
    // Auth
    signIn: "साइन इन करें",
    signUp: "साइन अप करें",
    email: "ईमेल",
    password: "पासवर्ड",
    emailPlaceholder: "आपका.ईमेल@उदाहरण.com",
    passwordPlaceholder: "••••••••",
    signingIn: "साइन इन हो रहा है...",
    creatingAccount: "खाता बनाया जा रहा है...",
    authSubtitle: "अपने मूल्यांकनों तक पहुँचने के लिए साइन इन करें",
    
    // Footer
    footerText: "टीबी पहचान सहायक - केवल शैक्षिक और जांच उद्देश्यों के लिए",
    footerSubtext: "हमेशा योग्य स्वास्थ्य पेशेवरों से परामर्श लें",
    
    // Toast messages
    missingInfo: "जानकारी गायब है",
    missingInfoDesc: "कृपया रोगी सूचना फॉर्म भरें।",
    missingSymptoms: "लक्षण गायब हैं",
    missingSymptomsDesc: "कृपया कम से कम एक लक्षण चुनें।",
    analysisComplete: "विश्लेषण पूर्ण",
    analysisCompleteDesc: "निदान विश्लेषण सफलतापूर्वक उत्पन्न हो गया है।",
    analysisFailed: "विश्लेषण विफल",
    deleted: "हटाया गया",
    deletedDesc: "मूल्यांकन सफलतापूर्वक हटाया गया",
    error: "त्रुटि",
    errorLoadHistory: "मूल्यांकन इतिहास लोड करने में विफल",
    errorDelete: "मूल्यांकन हटाने में विफल",
  },
  ar: {
    // Header
    appTitle: "مساعد الكشف عن السل",
    appSubtitle: "دعم تشخيص السل بالذكاء الاصطناعي",
    history: "السجل",
    signOut: "تسجيل الخروج",
    newAssessment: "تقييم جديد",
    
    // Patient Form
    patientInfo: "معلومات المريض",
    patientName: "اسم المريض",
    age: "العمر",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    other: "آخر",
    symptomDuration: "مدة الأعراض",
    medicalHistory: "التاريخ الطبي",
    medicalHistoryPlaceholder: "الحالات السابقة، الأدوية، الحساسية...",
    
    // Symptoms
    symptomsAssessment: "تقييم الأعراض",
    persistentCough: "سعال مستمر",
    nightSweats: "تعرق ليلي",
    weightLoss: "فقدان الوزن",
    fever: "حمى",
    fatigue: "تعب",
    chestPain: "ألم في الصدر",
    lossOfAppetite: "فقدان الشهية",
    coughingBlood: "سعال مع دم",
    
    // Lab Results
    labResults: "نتائج المختبر (اختياري)",
    labResultsPlaceholder: "أدخل أي نتائج اختبار متاحة...",
    
    // Medical Imaging
    medicalImaging: "التصوير الطبي",
    uploadImage: "تحميل صورة الأشعة السينية أو الفحص المقطعي",
    
    // Actions
    generateDiagnosis: "إنشاء التشخيص",
    analyzing: "جاري التحليل...",
    resetForm: "إعادة تعيين النموذج",
    
    // Results
    diagnosticResults: "نتائج التشخيص",
    confidenceLevel: "مستوى الثقة",
    high: "عالٍ",
    medium: "متوسط",
    low: "منخفض",
    keyFindings: "النتائج الرئيسية",
    recommendation: "التوصية",
    disclaimer: "إخلاء المسؤولية",
    disclaimerText: "هذه أداة تقييم أولية بمساعدة الذكاء الاصطناعي. استشر دائمًا متخصصي الرعاية الصحية المؤهلين.",
    
    // History
    assessmentHistory: "سجل التقييمات",
    reviewPast: "مراجعة التقييمات التشخيصية السابقة",
    searchPlaceholder: "البحث حسب اسم المريض أو التشخيص...",
    filterByConfidence: "تصفية حسب الثقة",
    allConfidenceLevels: "جميع مستويات الثقة",
    date: "التاريخ",
    name: "الاسم",
    actions: "الإجراءات",
    view: "عرض",
    delete: "حذف",
    backToList: "العودة إلى القائمة",
    noAssessments: "لم يتم العثور على تقييمات",
    loadingAssessments: "جاري تحميل التقييمات...",
    
    // Auth
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    emailPlaceholder: "بريدك.الإلكتروني@مثال.com",
    passwordPlaceholder: "••••••••",
    signingIn: "جاري تسجيل الدخول...",
    creatingAccount: "جاري إنشاء الحساب...",
    authSubtitle: "سجل الدخول للوصول إلى تقييماتك",
    
    // Footer
    footerText: "مساعد الكشف عن السل - لأغراض تعليمية وفحصية فقط",
    footerSubtext: "استشر دائمًا متخصصي الرعاية الصحية المؤهلين",
    
    // Toast messages
    missingInfo: "معلومات مفقودة",
    missingInfoDesc: "يرجى ملء نموذج معلومات المريض.",
    missingSymptoms: "أعراض مفقودة",
    missingSymptomsDesc: "يرجى تحديد عرض واحد على الأقل.",
    analysisComplete: "اكتمل التحليل",
    analysisCompleteDesc: "تم إنشاء التحليل التشخيصي بنجاح.",
    analysisFailed: "فشل التحليل",
    deleted: "تم الحذف",
    deletedDesc: "تم حذف التقييم بنجاح",
    error: "خطأ",
    errorLoadHistory: "فشل تحميل سجل التقييمات",
    errorDelete: "فشل حذف التقييم",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};