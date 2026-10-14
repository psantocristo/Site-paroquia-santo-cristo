import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, FileText, Image, Calendar, Users, LogOut,
  Video, FileCheck, ChevronDown, ChevronRight,
  Home, Newspaper, AlertCircle, Heart, FolderOpen, Clock,
  ListTodo, LayoutGrid, Cloud,
  User, Presentation, ArrowLeft, Menu, X, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ParishManager } from '../components/admin/ParishManager';
import { PhotoManager } from '../components/admin/PhotoManager';
import { TimelineManager } from '../components/admin/TimelineManager';
import { SlideManager } from '../components/admin/SlideManager';
import { BlogManager } from '../components/admin/BlogManager';
import { AnnouncementManager } from '../components/admin/AnnouncementManager';
import { CelebrationManager } from '../components/admin/CelebrationManager';
import { PriestManager } from '../components/admin/PriestManager';
import { PriestGalleryManager } from '../components/admin/PriestGalleryManager';
import { CloudinarySettings } from '../components/admin/CloudinarySettings';
import { ProgramManager } from '../components/admin/ProgramManager';
import { PastoralManager } from '../components/admin/PastoralManager';
import { UrgentPopupManager } from '../components/admin/UrgentPopupManager';
import { AlbumManager } from '../components/admin/AlbumManager';
import { LogoManager } from '../components/admin/LogoManager';
import { VideoTestimonialManager } from '../components/admin/VideoTestimonialManager';
import { DocumentationManager } from '../components/admin/DocumentationManager';
import { HomeSectionManager } from '../components/admin/HomeSectionManager';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AdminPageProps {
  onBack: () => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TabGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tabs: TabItem[];
}

const tabGroups: TabGroup[] = [
  {
    id: 'geral',
    label: 'Geral',
    icon: Settings,
    tabs: [
      { id: 'parish', label: 'Informações da Paróquia', icon: FileText },
      { id: 'logo', label: 'Logo do Site', icon: Image },
      { id: 'home-sections', label: 'Seções da Home', icon: LayoutGrid },
      { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
    ]
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    icon: Newspaper,
    tabs: [
      { id: 'blog', label: 'Blog', icon: Newspaper },
      { id: 'announcements', label: 'Eventos e Avisos', icon: Calendar },
      { id: 'popups', label: 'Pop-ups Urgentes', icon: AlertCircle },
      { id: 'videos', label: 'Vídeos Testemunhais', icon: Video },
    ]
  },
  {
    id: 'pessoas',
    label: 'Pessoas',
    icon: Users,
    tabs: [
      { id: 'priests', label: 'Clero', icon: User },
      { id: 'priests-gallery', label: 'Galeria dos Padres', icon: Users },
      { id: 'pastorals', label: 'Pastorais', icon: Heart },
    ]
  },
  {
    id: 'midia',
    label: 'Mídia',
    icon: Image,
    tabs: [
      { id: 'albums', label: 'Álbuns de Fotos', icon: FolderOpen },
      { id: 'photos', label: 'Galeria de Fotos', icon: Image },
      { id: 'slides', label: 'Slides do Site', icon: Presentation },
      { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
    ]
  },
  {
    id: 'operacional',
    label: 'Operacional',
    icon: Calendar,
    tabs: [
      { id: 'schedules', label: 'Missas e Celebrações', icon: Calendar },
      { id: 'programs', label: 'Programações', icon: ListTodo },
      { id: 'documentations', label: 'Documentações', icon: FileCheck },
    ]
  },
];

// Mapa para encontrar o label de uma tab pelo id
const getTabLabel = (tabId: string): string => {
  for (const group of tabGroups) {
    const tab = group.tabs.find(t => t.id === tabId);
    if (tab) return tab.label;
  }
  return 'Painel Administrativo';
};

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('parish');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['geral']);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    supabase.rpc('is_super_admin').then(({ data }) => setIsSuperAdmin(data === true));
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      onBack();
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleTabClick = (tabId: string, groupId: string) => {
    setActiveTab(tabId);
    // Garante que o grupo esteja expandido ao clicar em uma tab
    if (!expandedGroups.includes(groupId)) {
      setExpandedGroups(prev => [...prev, groupId]);
    }
    // Fechar sidebar em mobile após selecionar
    setMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'parish':
        return (
          <div className="space-y-8">
            <ParishManager />
            <div className="border-t border-gray-200 pt-8">
              <AnalyticsDashboard />
            </div>
          </div>
        );
      case 'logo':
        return <LogoManager />;
      case 'home-sections':
        return <HomeSectionManager />;
      case 'cloudinary':
        return <CloudinarySettings />;
      case 'popups':
        return <UrgentPopupManager />;
      case 'pastorals':
        return <PastoralManager />;
      case 'documentations':
        return <DocumentationManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'blog':
        return <BlogManager />;
      case 'videos':
        return <VideoTestimonialManager />;
      case 'priests':
        return <PriestManager />;
      case 'priests-gallery':
        return <PriestGalleryManager />;
      case 'programs':
        return <ProgramManager />;
      case 'albums':
        return <AlbumManager />;
      case 'photos':
        return <PhotoManager />;
      case 'timeline':
        return <TimelineManager />;
      case 'slides':
        return <SlideManager />;
      case 'schedules':
        return <CelebrationManager />;
      default:
        return <ParishManager />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header fixo */}
      <header className="bg-[#240404] text-white border-b border-[#c5a059]/40 shadow-lg z-50 sticky top-0">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botão hambúrguer mobile */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-[#e8c872] cursor-pointer"
                aria-label="Abrir menu lateral"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-stone-300 hover:text-[#e8c872] transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-semibold">Voltar ao Site</span>
              </button>
              <div className="h-6 w-px bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-[#c5a059] hidden sm:block" />
                <h1 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide truncate max-w-[150px] sm:max-w-none">
                  Painel Administrativo
                </h1>
                {isSuperAdmin && (
                  <span className="hidden xl:inline-flex items-center gap-1 rounded-sm border border-[#c5a059]/40 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e8c872]">
                    <ShieldCheck className="h-3 w-3" />
                    Super administrador
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#e8c872] hidden md:inline px-3 py-1 bg-white/5 rounded-full border border-[#c5a059]/30">
                {getTabLabel(activeTab)}
              </span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-[#e8c872] px-3 py-1 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1.5">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Overlay escuro em mobile quando sidebar está aberta */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto 
            transition-all duration-300
            fixed lg:relative inset-y-0 left-0 z-50
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-72 lg:w-64
          `}
        >
          {/* Header da sidebar mobile */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <span className="font-semibold text-gray-900">Menu</span>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-3">
            <nav className="space-y-1">
              {tabGroups.map((group) => (
                <div key={group.id} className="mb-2">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 font-medium cursor-pointer ${
                      expandedGroups.includes(group.id)
                        ? 'bg-[#240404]/5 text-[#240404] font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <group.icon className="h-4 w-4 text-[#c5a059] flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm">{group.label}</span>
                    {expandedGroups.includes(group.id) ? (
                      <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                    )}
                  </button>

                  {/* Group Items */}
                  <AnimatePresence>
                    {expandedGroups.includes(group.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#c5a059]/30 pl-2.5">
                          {group.tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleTabClick(tab.id, group.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 text-xs sm:text-sm cursor-pointer ${
                                activeTab === tab.id
                                  ? 'bg-[#240404] text-[#e8c872] shadow-sm font-bold'
                                  : 'text-stone-600 hover:bg-stone-100 hover:text-[#240404]'
                              }`}
                            >
                              <tab.icon className={`h-3.5 w-3.5 flex-shrink-0 ${activeTab === tab.id ? 'text-[#e8c872]' : 'text-stone-400'}`} />
                              <span className="truncate">{tab.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <Home className="h-4 w-4" />
              <span>/</span>
              <span className="text-gray-900 font-medium">{getTabLabel(activeTab)}</span>
            </div>

            {/* Content Card */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};
