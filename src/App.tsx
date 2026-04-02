import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

// Layouts
import CitizenLayout from "@/layouts/CitizenLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Pages
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/LoginPage";
import Index from "@/pages/Index";

// Citizen Pages
import FeedPage from "@/pages/citizen/FeedPage";
import SubmitReportPage from "@/pages/citizen/SubmitReportPage";
import ProjectsPage from "@/pages/citizen/ProjectsPage";
import RTIPage from "@/pages/citizen/RTIPage";
import HospitalsPage from "@/pages/citizen/HospitalsPage";
import CommunityRepairPage from "@/pages/citizen/CommunityRepairPage";
import IntegrityPage from "@/pages/citizen/IntegrityPage";
import NotificationsPage from "@/pages/citizen/NotificationsPage";
import ProfilePage from "@/pages/citizen/ProfilePage";
import ProfileEditPage from "@/pages/citizen/ProfileEditPage";
import ReportDetailPage from "@/pages/citizen/ReportDetailPage";
import SettingsPage from "@/pages/citizen/SettingsPage";
import CitizenTenderPage from "@/pages/citizen/TenderAnalysisPage";

// Admin Pages
import ModerationPage from "@/pages/admin/ModerationPage";
import CrisisModePage from "@/pages/admin/CrisisModePage";
import TenderAnalysisPage from "@/pages/admin/TenderAnalysisPage";
import ProjectApprovalPage from "@/pages/admin/ProjectApprovalPage";
import RTIResponsePage from "@/pages/admin/RTIResponsePage";
import IdentityUnlockPage from "@/pages/admin/IdentityUnlockPage";
import VoteAnomalyPage from "@/pages/admin/VoteAnomalyPage";
import EvidenceVaultPage from "@/pages/admin/EvidenceVaultPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import DistrictIntegrityPage from "@/pages/admin/DistrictIntegrityPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import HospitalManagementPage from "@/pages/admin/HospitalManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AppProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Index />} />

                {/* Citizen Area */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<FeedPage />} />
                  <Route path="submit-report" element={<SubmitReportPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="rti" element={<RTIPage />} />
                  <Route path="hospitals" element={<HospitalsPage />} />
                  <Route path="tenders" element={<CitizenTenderPage />} />
                  <Route path="community-repair" element={<CommunityRepairPage />} />
                  <Route path="integrity" element={<IntegrityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/edit" element={<ProfileEditPage />} />
                  <Route path="report/:id" element={<ReportDetailPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin Panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['moderator', 'admin', 'superadmin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ModerationPage />} />
                  <Route path="crisis-mode" element={<CrisisModePage />} />
                  <Route path="tenders" element={<TenderAnalysisPage />} />
                  <Route path="project-approval" element={<ProjectApprovalPage />} />
                  <Route path="rti-response" element={<RTIResponsePage />} />
                  <Route path="identity-unlock" element={<IdentityUnlockPage />} />
                  <Route path="vote-anomaly" element={<VoteAnomalyPage />} />
                  <Route path="evidence-vault" element={<EvidenceVaultPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route path="district-integrity" element={<DistrictIntegrityPage />} />
                  <Route path="user-management" element={<UserManagementPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="hospitals" element={<HospitalManagementPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </AppProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
