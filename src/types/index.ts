// ============= OpenNation Type System =============

export type UserRole = 'citizen' | 'moderator' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  roles: UserRole[];
  district: string;
  trustScore: number;
  truthScore: number;
  avatar?: string;
  language: 'bn' | 'en';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface OTPRequest {
  phone: string;
}

export interface OTPVerify {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Reports
export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  location: Location;
  evidence: Evidence[];
  authorId: string;
  authorName: string;
  supportCount: number;
  doubtCount: number;
  userVote?: 'support' | 'doubt' | null;
  status: 'pending' | 'verified' | 'hidden' | 'resolved';
  truthProbability?: number;
  authenticityScore?: number;
  approvalDecision?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportCategory =
  | 'infrastructure'
  | 'corruption'
  | 'health'
  | 'education'
  | 'environment'
  | 'safety'
  | 'governance'
  | 'other';

export interface Location {
  district: string;
  upazila?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface Evidence {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  blurred: boolean;
}

export interface ReportSubmission {
  title: string;
  description: string;
  category: ReportCategory;
  location: Location;
  evidence?: File[];
}

// Voting
export interface VotePayload {
  reportId: string;
  type: 'support' | 'doubt';
}

export interface VoteResponse {
  reportId: string;
  supportCount: number;
  doubtCount: number;
  userVote: 'support' | 'doubt';
}

// Projects
export interface GovernmentProject {
  id: string;
  title: string;
  description: string;
  department: string;
  budget: number;
  district: string;
  status: 'proposed' | 'approved' | 'ongoing' | 'completed' | 'frozen';
  startDate?: string;
  endDate?: string;
  opinionCount: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFrozen: boolean;
  createdAt: string;
}

export interface ProjectOpinion {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  opinion: string;
  createdAt: string;
}

export interface OpinionSubmission {
  projectId: string;
  opinion: string;
}

// RTI
export interface RTIRequest {
  id: string;
  subject: string;
  body: string;
  department: string;
  status: 'submitted' | 'processing' | 'responded' | 'appealed' | 'closed';
  response?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RTISubmission {
  subject: string;
  body: string;
  department: string;
}

// Hospital
export interface Hospital {
  id: string;
  name: string;
  district: string;
  type: 'government' | 'private';
  totalBeds: number;
  availableBeds: number;
  rating: number;
  services: string[];
  lastUpdated: string;
}

// Community Repair
export interface RepairRequest {
  id: string;
  title: string;
  description: string;
  location: Location;
  category: 'road' | 'water' | 'electricity' | 'sanitation' | 'other';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'completed';
  supportCount: number;
  createdAt: string;
}

// Integrity
export interface IntegrityMetrics {
  district: string;
  trustScore: number;
  truthScore: number;
  totalReports: number;
  verifiedReports: number;
  resolvedReports: number;
  activeProjects: number;
  rtiResponseRate: number;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'report' | 'vote' | 'project' | 'rti' | 'system' | 'crisis';
  read: boolean;
  createdAt: string;
}

// Admin types
export interface ModerationItem {
  id: string;
  report: Report;
  flagReason: string;
  flaggedBy: string;
  flaggedAt: string;
  status: 'pending' | 'approved' | 'hidden';
}

export interface TenderAnalysis {
  id: string;
  tenderTitle: string;
  department: string;
  estimatedCost: number;
  actualCost: number;
  riskScore: number;
  riskFactors: string[];
  status: 'low_risk' | 'medium_risk' | 'high_risk' | 'critical';
  awardedTo: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByRole: UserRole;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface IdentityUnlockRequest {
  id: string;
  requestedBy: string;
  targetUserId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface VoteAnomaly {
  id: string;
  reportId: string;
  reportTitle: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
  detectedAt: string;
}

export interface CrisisMode {
  active: boolean;
  activatedBy?: string;
  activatedAt?: string;
  reason?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
