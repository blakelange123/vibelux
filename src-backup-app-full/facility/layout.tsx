import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Users,
  Settings,
  ChevronRight
} from 'lucide-react';

const facilityNavigation = [
  {
    name: 'Overview',
    href: '/facility',
    icon: LayoutDashboard,
    description: 'Facility dashboard and metrics'
  },
  {
    name: 'Investment Hub',
    href: '/facility/investment',
    icon: DollarSign,
    description: 'Manage funding opportunities'
  },
  {
    name: 'Performance',
    href: '/facility/performance',
    icon: BarChart3,
    description: 'Track and report metrics'
  },
  {
    name: 'Documents',
    href: '/facility/documents',
    icon: FileText,
    description: 'Legal and financial documents'
  },
  {
    name: 'Investors',
    href: '/facility/investors',
    icon: Users,
    description: 'Investor relations'
  },
  {
    name: 'Settings',
    href: '/facility/settings',
    icon: Settings,
    description: 'Facility profile and preferences'
  }
];

export default async function FacilityLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Check if user has facility access/role
  // const userRole = await getUserRole(userId);
  // if (!userRole.includes('FACILITY')) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Facility Portal</h1>
                <p className="text-sm text-slate-600">Manage your investment opportunities</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/investment"
                className="px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md font-medium transition-colors"
              >
                Investment Platform
              </Link>
              <Link 
                href="/dashboard"
                className="px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                Main Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] border-r border-slate-200">
          <nav className="p-4 space-y-1">
            {facilityNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-3 py-3 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200"
                >
                  <Icon className="flex-shrink-0 mr-3 h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                  <div className="flex-1">
                    <span className="text-slate-900 group-hover:text-blue-900 font-medium">{item.name}</span>
                    <p className="text-xs text-slate-500 group-hover:text-blue-600 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-slate-200">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Investment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Active Listings</span>
                  <span className="font-semibold text-slate-900">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Total Raised</span>
                  <span className="font-semibold text-slate-900">$1.2M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Investors</span>
                  <span className="font-semibold text-slate-900">8</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}