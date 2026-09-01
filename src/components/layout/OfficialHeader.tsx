'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, X, ArrowRight, UserCheck, LogOut, ChevronDown, LayoutDashboard, FileText, Folder, CheckSquare, Settings, Bell, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath, normalizeRole, NormalizedRole } from '@/lib/rbac';
import { getRoleDisplayName } from '@/components/auth/AccessDeniedPage';
import { WorkflowStore, PersistentNotification } from '@/lib/workflow-store';

interface OfficialHeaderProps {
  currentLang?: string;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

export const OfficialHeader: React.FC<OfficialHeaderProps> = ({
  currentLang = 'en',
  userRole: propRole,
  userName: propName,
  onLogout: propLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { currentUser, role: authRole, signOut } = useAuth();

  const activeName = propName || currentUser?.name;
  const activeRole = propRole || authRole;
  const normRole = normalizeRole(activeRole);
  const targetDashboard = getRoleDashboardPath(normRole);

  const notifications = WorkflowStore.getNotifications(normRole);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notif: PersistentNotification) => {
    WorkflowStore.markNotificationRead(notif.id);
    setShowNotificationMenu(false);
    router.push(notif.route);
  };

  const handleLogoutAction = async () => {
    setShowConfirmLogout(false);
    if (propLogout) {
      propLogout();
    } else {
      await signOut();
      router.push(ROUTES.login);
    }
  };

  // Role-tailored navigation items
  const getNavLinksForRole = (role: NormalizedRole) => {
    switch (role) {
      case 'applicant':
        return [
          { href: ROUTES.dashboard, label: 'My Dashboard' },
          { href: '/select-project', label: 'Approval Journey' },
          { href: ROUTES.projects, label: 'My Projects' },
          { href: ROUTES.applications, label: 'Applications' },
          { href: ROUTES.vault, label: 'Document Vault' },
          { href: ROUTES.compliance, label: 'Compliance' },
          { href: ROUTES.renewals, label: 'Renewals' },
          { href: ROUTES.schemes, label: 'Schemes' },
          { href: ROUTES.grievances, label: 'Grievances' },
        ];
      case 'department_officer':
        return [
          { href: '/officer/dashboard', label: 'Officer Dashboard' },
          { href: ROUTES.applications, label: 'Application Queue' },
          { href: ROUTES.inspections, label: 'Inspections' },
          { href: ROUTES.grievances, label: 'Grievances' },
        ];
      case 'inspector':
        return [
          { href: '/inspector/dashboard', label: 'Inspector Dashboard' },
          { href: ROUTES.inspections, label: 'Assigned Inspections' },
        ];
      case 'administrator':
        return [
          { href: '/admin/dashboard', label: 'Admin Dashboard' },
          { href: ROUTES.applications, label: 'All Applications' },
          { href: ROUTES.vault, label: 'Vault Rules' },
        ];
      default:
        // Guest / Public Mode: Minimal informational links only
        return [
          { href: ROUTES.home, label: getTranslation(currentLang, 'nav_home') },
          { href: ROUTES.howItWorks, label: getTranslation(currentLang, 'nav_how_it_works') },
          { href: ROUTES.about, label: getTranslation(currentLang, 'nav_about') },
          { href: ROUTES.faq, label: getTranslation(currentLang, 'nav_faq') },
          { href: ROUTES.contact, label: 'Help & Support' },
          { href: ROUTES.accessibility, label: 'Accessibility' },
        ];
    }
  };

  const navLinks = getNavLinksForRole(normRole);

  // Role-tailored dropdown items
  const getDropdownLinksForRole = (role: NormalizedRole) => {
    switch (role) {
      case 'applicant':
        return [
          { href: ROUTES.dashboard, label: 'My Projects & Applications' },
          { href: ROUTES.approvalWizard, label: 'Approval Checklist Wizard' },
          { href: ROUTES.vault, label: 'Document Vault & Pre-Validation' },
          { href: ROUTES.schemes, label: 'Incentive Matcher' },
        ];
      case 'department_officer':
        return [
          { href: '/officer/dashboard', label: 'Application Queue Scrutiny' },
          { href: '/officer/dashboard', label: 'Inspection Coordination' },
          { href: ROUTES.knowledgeBase, label: 'Statutory Compliance KB' },
        ];
      case 'inspector':
        return [
          { href: '/inspector/dashboard', label: 'Assigned Inspection Queue' },
          { href: '/inspector/dashboard', label: 'Upload Field Evidence' },
          { href: ROUTES.sectorGuides, label: 'DISH Safety Standards' },
        ];
      case 'administrator':
        return [
          { href: '/admin/dashboard', label: 'Statewide Scrutiny Overview' },
          { href: '/admin/dashboard', label: 'Manage Approval Rules' },
          { href: '/admin/dashboard', label: 'Audit Logs & Escalation' },
        ];
      default:
        return [];
    }
  };

  const profileLinks = getDropdownLinksForRole(normRole);

  return (
    <header className="bg-white border-b border-govBorder shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Emblem */}
        <Link href={currentUser ? targetDashboard : ROUTES.home} className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-govBlue to-govBlue-dark flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-saffron/40">
            <Shield className="w-7 h-7 text-saffron" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-govBlue tracking-tight group-hover:text-saffron transition-colors">
                UdyogSathi
              </h1>
              <span className="bg-govBlue-50 text-govBlue text-[10px] font-bold px-2 py-0.5 rounded border border-govBlue/20">
                Maharashtra
              </span>
            </div>
            <p className="text-[11px] text-govMuted leading-none mt-0.5">
              Industrial Approvals, Compliance & Incentives Gateway
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-govBlue text-white shadow-sm font-bold'
                    : 'text-govText hover:bg-govBlue-50 hover:text-govBlue'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Active Profile */}
        <div className="hidden sm:flex items-center gap-2">
          {activeName ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                {/* Notification Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotificationMenu(!showNotificationMenu);
                      setShowProfileMenu(false);
                    }}
                    className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-govBlue" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Menu */}
                  {showNotificationMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs text-slate-900 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 font-extrabold text-govBlue">
                          <Bell className="w-4 h-4 text-saffron" />
                          <span>In-App Notifications</span>
                        </div>
                        <span className="bg-saffron/10 text-saffron font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {unreadCount} Unread
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center text-slate-500 py-4 text-[11px]">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                n.isRead
                                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                                  : 'bg-saffron/5 border-saffron/30 font-semibold text-slate-900 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-govBlue text-xs">{n.title}</span>
                                {n.priority === 'high' && (
                                  <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    HIGH
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] mt-1 leading-snug">{n.message}</p>
                              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                {n.createdAt.split('T')[0]}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={targetDashboard}
                  className="flex items-center gap-1.5 bg-govBlue hover:bg-govBlue-dark text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-saffron" />
                  <span>Dashboard ({activeName.split(' ')[0]})</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotificationMenu(false);
                  }}
                  className="p-2 rounded-lg text-govText hover:bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs"
                  aria-label="User Profile Options"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs text-slate-900 space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] text-govMuted uppercase tracking-wider block font-bold">
                      Active Signed-In Account
                    </span>
                    <div className="font-extrabold text-govBlue mt-0.5">{activeName}</div>
                    <div className="text-[11px] text-saffron font-bold mt-0.5">
                      {getRoleDisplayName(normRole)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={targetDashboard}
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 rounded-lg font-bold text-govBlue bg-slate-50 hover:bg-govBlue-50 transition-colors"
                    >
                      Go to My Dashboard
                    </Link>

                    {profileLinks.map(pLink => (
                      <Link
                        key={pLink.label}
                        href={pLink.href}
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-3 py-1.5 rounded-lg font-semibold hover:bg-govBlue-50 hover:text-govBlue transition-colors"
                      >
                        {pLink.label}
                      </Link>
                    ))}

                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowConfirmLogout(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.login}
                className="text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3.5 py-2 rounded-lg transition-colors border border-govBlue/30"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-3.5 py-2 rounded-lg shadow-md transition-all"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-govText hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-govBorder p-4 shadow-xl space-y-4">
          {activeName && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] text-govMuted uppercase tracking-wider block font-bold">
                Signed in as
              </span>
              <div className="font-extrabold text-govBlue">{activeName}</div>
              <div className="text-[11px] text-saffron font-bold">{getRoleDisplayName(normRole)}</div>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-govText hover:bg-govBlue-50 hover:text-govBlue rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!activeName ? (
              <>
                <Link
                  href={ROUTES.approvalWizard}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-saffron text-white text-center text-xs font-bold py-2.5 rounded-lg shadow"
                >
                  Start Approval Journey
                </Link>
                <Link
                  href={ROUTES.login}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold text-govBlue border border-govBlue py-2.5 rounded-lg"
                >
                  Sign In to Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={targetDashboard}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-govBlue text-white text-center text-xs font-bold py-2.5 rounded-lg"
                >
                  Go to My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowConfirmLogout(true);
                  }}
                  className="w-full text-center text-xs font-bold text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Logout Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-govBlue">Confirm Sign Out</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to end your active session, {activeName}?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleLogoutAction}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
