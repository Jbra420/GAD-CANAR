import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

// Auth
import { LoginPage } from '@/pages/auth/login.page'
import { RegisterPage } from '@/pages/auth/register.page'
import { RegisterArchitectPage } from '@/pages/auth/register.architect.page'

// Landing
import { LandingPage } from '@/pages/landing.page'

// Layouts
import { CitizenLayout } from '@/layouts/citizen.layout'
import { ArchitectLayout } from '@/layouts/architect.layout'
import { TechnicianLayout } from '@/layouts/technician.layout'
import { SecretaryLayout } from '@/layouts/secretary.layout'
import { FinanceLayout } from '@/layouts/finance.layout'
import { AdminLayout } from '@/layouts/admin.layout'

// Citizen
import { CitizenDashboard } from '@/pages/citizen/citizen.dashboard'
import { MyApplications } from '@/pages/citizen/my.applications'
import { NewApplication } from '@/pages/citizen/new.application'
import { ApplicationDetail } from '@/pages/citizen/application.detail'

// Architect
import { ArchitectDashboard } from '@/pages/architect/architect.dashboard'
import { MyProcedures } from '@/pages/architect/my.procedures'
import { NewProcedure } from '@/pages/architect/new.procedure'
import { ProcedureDetail } from '@/pages/architect/procedure.detail'

// Technician
import { TechnicianDashboard } from '@/pages/technician/technician.dashboard'
import { TechnicianInbox } from '@/pages/technician/technician.inbox'
import { InspectionPage } from '@/pages/technician/inspection.page'

// Secretary
import { SecretaryDashboard } from '@/pages/secretary/secretary.dashboard'
import { SecretaryInbox } from '@/pages/secretary/secretary.inbox'
import { ApplicationDetailSecretary } from '@/pages/secretary/application.detail.secretary'
import { SecretaryTechnicians } from '@/pages/secretary/secretary.technicians'
import { ArchitectApproval } from '@/pages/secretary/architect.approval'

// Finance
import { FinanceDashboard } from '@/pages/finance/finance.dashboard'
import { PendingPayments } from '@/pages/finance/pending.payments'
import { PaymentDetailPage } from '@/pages/finance/payment.detail.page'

// Admin
import { AdminDashboard } from '@/pages/admin/admin.dashboard'
import { AdminUsers } from '@/pages/admin/admin.users'
import { AdminApplications } from '@/pages/admin/admin.applications'
import { AdminAudit } from '@/pages/admin/admin.audit'
import { AdminApplicationDetail } from '@/pages/admin/admin.application.detail'

// Role redirection map
const ROLE_REDIRECT: Record<string, string> = {
  CITIZEN:    '/citizen',
  GUEST:      '/citizen',
  ARCHITECT:  '/architect',
  TECHNICIAN: '/technician',
  SECRETARY:  '/secretary',
  FINANCE:    '/finance',
  SUPERADMIN: '/admin',
}

// Role guard component
function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, access_token } = useAuthStore()
  if (!access_token) return <Navigate to="/login" replace />
  if (!allowed.includes(user?.role ?? '')) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Intelligent redirect on login or unknown routes
function RoleRedirect() {
  const { user } = useAuthStore()
  const dest = ROLE_REDIRECT[user?.role ?? ''] ?? '/citizen'
  return <Navigate to={dest} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-architect" element={<RegisterArchitectPage />} />

        {/* ---- Citizen Portal ---- */}
        <Route
          path="/citizen"
          element={<RequireRole allowed={['CITIZEN', 'GUEST']}><CitizenLayout /></RequireRole>}
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
        </Route>

        {/* ---- Portal Architect ---- */}
        <Route
          path="/architect"
          element={<RequireRole allowed={['ARCHITECT']}><ArchitectLayout /></RequireRole>}
        >
          <Route index element={<ArchitectDashboard />} />
          <Route path="procedures" element={<MyProcedures />} />
          <Route path="procedures/new" element={<NewProcedure />} />
          <Route path="procedures/:id" element={<ProcedureDetail />} />
        </Route>

        {/* ---- Portal Secretary ---- */}
        <Route
          path="/secretary"
          element={<RequireRole allowed={['SECRETARY']}><SecretaryLayout /></RequireRole>}
        >
          <Route index element={<SecretaryDashboard />} />
          <Route path="inbox" element={<SecretaryInbox />} />
          <Route path="inbox/:id" element={<ApplicationDetailSecretary />} />
          <Route path="technicians" element={<SecretaryTechnicians />} />
          <Route path="architects" element={<ArchitectApproval />} />
          <Route path="history" element={<SecretaryInbox />} />
        </Route>

        {/* ---- Portal Technician ---- */}
        <Route
          path="/technician"
          element={<RequireRole allowed={['TECHNICIAN']}><TechnicianLayout /></RequireRole>}
        >
          <Route index element={<TechnicianDashboard />} />
          <Route path="inbox" element={<TechnicianInbox />} />
          <Route path="inbox/:id" element={<InspectionPage />} />
        </Route>

        {/* ---- Portal Finance ---- */}
        <Route
          path="/finance"
          element={<RequireRole allowed={['FINANCE']}><FinanceLayout /></RequireRole>}
        >
          <Route index element={<FinanceDashboard />} />
          <Route path="payments" element={<PendingPayments />} />
          <Route path="payments/:id" element={<PaymentDetailPage />} />
          <Route path="history" element={<PendingPayments />} />
          <Route path="settled" element={<PendingPayments />} />
        </Route>

        {/* ---- Admin Portal ---- */}
        <Route
          path="/admin"
          element={<RequireRole allowed={['SUPERADMIN']}><AdminLayout /></RequireRole>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationDetail />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
