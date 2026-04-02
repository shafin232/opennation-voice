const bn = {
  // App
  appName: 'ওপেননেশন',
  appTagline: 'নাগরিক স্বচ্ছতা প্ল্যাটফর্ম',

  // Auth
  login: 'লগইন',
  logout: 'লগআউট',
  phone: 'ফোন নম্বর',
  enterPhone: 'আপনার ফোন নম্বর দিন',
  sendOTP: 'ওটিপি পাঠান',
  enterOTP: 'ওটিপি কোড দিন',
  verifyOTP: 'যাচাই করুন',
  otpSent: 'ওটিপি পাঠানো হয়েছে',
  invalidOTP: 'ভুল ওটিপি কোড',

  // Nav - Citizen
  feed: 'লাইভ ফিড',
  submitReport: 'রিপোর্ট জমা দিন',
  projects: 'সরকারি প্রকল্প',
  projectOpinions: 'প্রকল্প মতামত',
  rti: 'তথ্য অধিকার',
  hospitals: 'হাসপাতাল মনিটর',
  communityRepair: 'কমিউনিটি মেরামত',
  integrity: 'সততা ড্যাশবোর্ড',
  notifications: 'বিজ্ঞপ্তি',
  profile: 'প্রোফাইল',
  settings: 'সেটিংস',

  // Nav - Admin
  moderation: 'মডারেশন কিউ',
  crisisMode: 'ক্রাইসিস মোড',
  tenderAnalysis: 'টেন্ডার বিশ্লেষণ',
  projectApproval: 'প্রকল্প অনুমোদন',
  rtiResponse: 'তথ্য অধিকার প্রতিক্রিয়া',
  identityUnlock: 'পরিচয় আনলক',
  voteAnomaly: 'ভোট অসঙ্গতি',
  evidenceVault: 'প্রমাণ ভল্ট',
  auditLogs: 'অডিট লগ',
  districtIntegrity: 'জেলা সততা নিয়ন্ত্রণ',

  // Actions
  support: 'সমর্থন',
  doubt: 'সন্দেহ',
  submit: 'জমা দিন',
  cancel: 'বাতিল',
  confirm: 'নিশ্চিত করুন',
  approve: 'অনুমোদন',
  reject: 'প্রত্যাখ্যান',
  hide: 'লুকান',
  restore: 'পুনরুদ্ধার',
  save: 'সংরক্ষণ',
  search: 'অনুসন্ধান',
  filter: 'ফিল্টার',
  viewDetails: 'বিস্তারিত দেখুন',

  // Status
  loading: 'লোড হচ্ছে...',
  error: 'ত্রুটি ঘটেছে',
  success: 'সফল',
  noData: 'কোনো তথ্য নেই',
  pending: 'অপেক্ষমাণ',
  verified: 'যাচাইকৃত',
  resolved: 'সমাধানকৃত',
  frozen: 'হিমায়িত',

  // Crisis
  crisisActive: 'ক্রাইসিস মোড সক্রিয়',
  crisisNotice: 'ভোটদান ও জমাদান সাময়িকভাবে বন্ধ আছে',
  crisisActivate: 'ক্রাইসিস মোড সক্রিয় করুন',
  crisisDeactivate: 'ক্রাইসিস মোড নিষ্ক্রিয় করুন',

  // Report
  reportTitle: 'শিরোনাম',
  reportDescription: 'বিবরণ',
  reportCategory: 'বিভাগ',
  reportLocation: 'অবস্থান',
  reportEvidence: 'প্রমাণ',
  reportSubmitted: 'রিপোর্ট সফলভাবে জমা হয়েছে',

  // Categories
  infrastructure: 'অবকাঠামো',
  corruption: 'দুর্নীতি',
  health: 'স্বাস্থ্য',
  education: 'শিক্ষা',
  environment: 'পরিবেশ',
  safety: 'নিরাপত্তা',
  governance: 'শাসন',
  other: 'অন্যান্য',

  // Scores
  trustScore: 'বিশ্বাস স্কোর',
  truthScore: 'সত্যতা স্কোর',

  // Theme
  darkMode: 'ডার্ক মোড',
  lightMode: 'লাইট মোড',
  language: 'ভাষা',
  bengali: 'বাংলা',
  english: 'English',

  // Admin
  adminPanel: 'অ্যাডমিন প্যানেল',
  moderatorPanel: 'মডারেটর প্যানেল',
  totalReports: 'মোট রিপোর্ট',
  pendingModeration: 'মডারেশন অপেক্ষমাণ',
  riskLevel: 'ঝুঁকি স্তর',
  lowRisk: 'কম ঝুঁকি',
  mediumRisk: 'মাঝারি ঝুঁকি',
  highRisk: 'উচ্চ ঝুঁকি',
  critical: 'জটিল',
} as const;

export default bn;
export type TranslationKey = keyof typeof bn;
