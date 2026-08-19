import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { SEO } from './components/ui/SEO';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { SlidesSection } from './components/sections/SlidesSection';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { supabase } from './lib/supabase';
import { trackPageView } from './utils/analytics';
import { CookieConsent } from './components/ui/CookieConsent';

// Lazy load all non-critical homepage sections
const HistorySection = React.lazy(() => import('./components/sections/HistorySection').then(m => ({ default: m.HistorySection })));
const PhotoGallery = React.lazy(() => import('./components/sections/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const ContactSection = React.lazy(() => import('./components/sections/ContactSection').then(m => ({ default: m.ContactSection })));
const AnnouncementsSection = React.lazy(() => import('./components/sections/AnnouncementsSection').then(m => ({ default: m.AnnouncementsSection })));
const BlogSection = React.lazy(() => import('./components/sections/BlogSection').then(m => ({ default: m.BlogSection })));
const PriestSection = React.lazy(() => import('./components/sections/PriestSection').then(m => ({ default: m.PriestSection })));
const ProgramsSection = React.lazy(() => import('./components/sections/ProgramsSection').then(m => ({ default: m.ProgramsSection })));
const PriestsCarouselSection = React.lazy(() => import('./components/sections/PriestsCarouselSection').then(m => ({ default: m.PriestsCarouselSection })));
const VideosCarouselSection = React.lazy(() => import('./components/sections/VideosCarouselSection').then(m => ({ default: m.VideosCarouselSection })));

// Lazy load all page components (never needed on initial load)
const CelebrationsPage = React.lazy(() => import('./components/sections/CelebrationsPage').then(m => ({ default: m.CelebrationsPage })));
const ProgramsPage = React.lazy(() => import('./pages/ProgramsPage').then(m => ({ default: m.ProgramsPage })));
const ProgramViewPage = React.lazy(() => import('./pages/ProgramViewPage').then(m => ({ default: m.ProgramViewPage })));
const PastoralsPage = React.lazy(() => import('./components/sections/PastoralsPage').then(m => ({ default: m.PastoralsPage })));
const AlbumGallery = React.lazy(() => import('./components/sections/AlbumGallery').then(m => ({ default: m.AlbumGallery })));
const UrgentPopup = React.lazy(() => import('./components/ui/UrgentPopup').then(m => ({ default: m.UrgentPopup })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfUsePage = React.lazy(() => import('./pages/TermsOfUsePage').then(m => ({ default: m.TermsOfUsePage })));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AlbumViewPage = React.lazy(() => import('./pages/AlbumViewPage').then(m => ({ default: m.AlbumViewPage })));
const FestaPatroeiroPage = React.lazy(() => import('./pages/FestaPatroeiroPage').then(m => ({ default: m.FestaPatroeiroPage })));
const AnnouncementsPage = React.lazy(() => import('./pages/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const AnnouncementViewPage = React.lazy(() => import('./pages/AnnouncementViewPage').then(m => ({ default: m.AnnouncementViewPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const VideoTestimonialsPage = React.lazy(() => import('./pages/VideoTestimonialsPage').then(m => ({ default: m.VideoTestimonialsPage })));
const CampaignPage = React.lazy(() => import('./pages/CampaignPage').then(m => ({ default: m.CampaignPage })));
const DonationSuccessPage = React.lazy(() => import('./pages/DonationSuccessPage').then(m => ({ default: m.DonationSuccessPage })));
const DonationFailurePage = React.lazy(() => import('./pages/DonationFailurePage').then(m => ({ default: m.DonationFailurePage })));
const DonationThankYouPage = React.lazy(() => import('./pages/DonationThankYouPage').then(m => ({ default: m.DonationThankYouPage })));
const PriestsGalleryPage = React.lazy(() => import('./pages/PriestsGalleryPage').then(m => ({ default: m.PriestsGalleryPage })));
const CampaignsListPage = React.lazy(() => import('./pages/CampaignsListPage').then(m => ({ default: m.CampaignsListPage })));
const DocumentationsPage = React.lazy(() => import('./pages/DocumentationsPage').then(m => ({ default: m.DocumentationsPage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const LoginForm = React.lazy(() => import('./components/admin/LoginForm').then(m => ({ default: m.LoginForm })));

// Loading fallback for lazy pages
const SuspensePageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-800 border-t-transparent" />
  </div>
);

function App() {
  const [showCelebrations, setShowCelebrations] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);
  const [showPastorals, setShowPastorals] = useState(false);
  const [showAlbumGallery, setShowAlbumGallery] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentBlogPostSlug, setCurrentBlogPostSlug] = useState<string | null>(null);
  const [currentAlbumSlug, setCurrentAlbumSlug] = useState<string | null>(null);
  const [currentAnnouncementSlug, setCurrentAnnouncementSlug] = useState<string | null>(null);
  const [currentProgramSlug, setCurrentProgramSlug] = useState<string | null>(null);
  const [showAnnouncementsPage, setShowAnnouncementsPage] = useState(false);
  const [showFesta2025, setShowFesta2025] = useState(false);
  const [showVideoTestimonials, setShowVideoTestimonials] = useState(false);
  const [currentCampaignSlug, setCurrentCampaignSlug] = useState<string | null>(null);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showDonationFailure, setShowDonationFailure] = useState(false);
  const [showDonationThankYou, setShowDonationThankYou] = useState(false);
  const [showPriestsGallery, setShowPriestsGallery] = useState(false);
  const [showCampaignsList, setShowCampaignsList] = useState(false);
  const [showDocumentations, setShowDocumentations] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [show404, setShow404] = useState(false);
  // Valores padrão para evitar layout shift enquanto carrega do Supabase
  const [homeSections, setHomeSections] = useState<{[key: string]: boolean}>({
    hero: true,
    jubileu_40anos: false,
    history: false,
    priest: true,
    announcements: true,
    blog: false,
    albums: true,
    videos_carousel: true,
    priests_carousel: false,
    programs: true,
    contact: true
  });

  React.useEffect(() => {
    // Fetch home sections configuration - busca TODAS as seções para respeitar is_active=false
    const fetchHomeSections = async () => {
      try {
        const { data } = await supabase
          .from('home_sections')
          .select('section_key, is_active');
        
        if (data && data.length > 0) {
          const sectionsMap = data.reduce((acc: {[key: string]: boolean}, section: any) => {
            acc[section.section_key] = section.is_active === true;
            return acc;
          }, {} as {[key: string]: boolean});
          // Substitui completamente para respeitar seções desativadas
          setHomeSections(sectionsMap);
        }
      } catch (error) {
        console.error('Error fetching home sections:', error);
      }
    };

    fetchHomeSections();
  }, []);

  // Track page views para analytics
  React.useEffect(() => {
    const path = window.location.pathname + window.location.hash;
    const title = document.title;
    trackPageView(path, title);
  }, [
    showCelebrations,
    showPrograms,
    showPastorals,
    showAlbumGallery,
    showPrivacyPolicy,
    showTermsOfUse,
    showFesta2025,
    showVideoTestimonials,
    showPriestsGallery,
    showCampaignsList,
    showDocumentations,
    showSearch,
    currentBlogPostSlug,
    currentAlbumSlug,
    currentAnnouncementSlug,
    showAnnouncementsPage,
    currentCampaignSlug,
    show404
  ]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setShowAdmin(false);
      }
    });

    const validPaths = [
      '/', '/festa-padroeiro', '/programacoes', '/campanhas', '/documentacoes', '/admin', '/login',
      '/privacy', '/terms', '/eventos-informativos', '/galeria-dos-padres', '/galeria-de-padres', '/pesquisar'
    ];
    
    const handleInitialHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      // Check for new path-based routes (without hash)
      const isBlogPath = path.startsWith('/blog/');
      const isAlbumPath = path.startsWith('/album/') || path.startsWith('/albuns/');
      const isAnnouncementPath = path.startsWith('/aviso/') || path.startsWith('/avisos/');
      const isProgramPath = path.startsWith('/programacao/');
      const isCampaignPath = path.startsWith('/campanha/') || path.match(/^\/[a-z0-9-]+$/);

      // Check for success/failure pages first
      if (path === '/doacao-sucesso') {
        setShowDonationSuccess(true);
        return;
      }
      
      if (path === '/doacao-falha') {
        setShowDonationFailure(true);
        return;
      }

      // Check for new path-based routes first
      if (isBlogPath) {
        const slug = path.replace('/blog/', '').split('/')[0];
        setCurrentBlogPostSlug(slug);
        return;
      }
      
      if (isAlbumPath) {
        const slug = path.startsWith('/album/') ? 
          path.replace('/album/', '').split('/')[0] : 
          path.replace('/albuns/', '').split('/')[0];
        setCurrentAlbumSlug(slug);
        return;
      }
      
      if (isAnnouncementPath) {
        const slug = path.startsWith('/aviso/') ? 
          path.replace('/aviso/', '').split('/')[0] : 
          path.replace('/avisos/', '').split('/')[0];
        setCurrentAnnouncementSlug(slug);
        return;
      }

      if (isProgramPath) {
        const slug = path.replace('/programacao/', '').split('/')[0];
        setCurrentProgramSlug(slug);
        return;
      }
      
      // Check for 404
      if (!validPaths.includes(path) && !hash.startsWith('#post/') && !hash.startsWith('#album/') && !hash.startsWith('#avisos') && !isCampaignPath && !isBlogPath && !isAlbumPath && !isAnnouncementPath && !isProgramPath && path !== '/doacao-sucesso' && path !== '/doacao-falha') {
        setShow404(true);
        return;
      }
      
      // Check for campaign path
      if (isCampaignPath && path !== '/' && !validPaths.includes(path)) {
        const slug = path.startsWith('/campanha/') ? 
          path.replace('/campanha/', '').split('/')[0] : 
          path.replace('/', '').split('/')[0];
        setCurrentCampaignSlug(slug);
        return;
      }

      if (path === '/festa-padroeiro') {
        setShowFesta2025(true);
        return;
      }

      if (path === '/programacoes') {
        setShowPrograms(true);
        return;
      }

      // Check for /privacy or /terms or /nossa-historia
      if (path === '/privacy') {
        setShowPrivacyPolicy(true);
        return;
      }
      if (path === '/terms') {
        setShowTermsOfUse(true);
        return;
      }
      if (path === '/eventos-informativos') {
        setShowVideoTestimonials(true);
        return;
      }

      if (path === '/galeria-dos-padres' || path === '/galeria-de-padres') {
        setShowPriestsGallery(true);
        return;
      }

      if (path === '/campanhas') {
        setShowCampaignsList(true);
        return;
      }

      if (path === '/documentacoes') {
        setShowDocumentations(true);
        return;
      }

      if (path === '/pesquisar') {
        setShowSearch(true);
        return;
      }

      // Legacy hash-based routes (for backwards compatibility)
      if (hash.startsWith('#post/')) {
        const slug = hash.replace('#post/', '');
        // Redirect to new path-based route
        window.history.replaceState(null, '', `/blog/${slug}`);
        setCurrentBlogPostSlug(slug);
      } else if (hash.startsWith('#album/')) {
        const slug = hash.replace('#album/', '');
        // Redirect to new path-based route
        window.history.replaceState(null, '', `/album/${slug}`);
        setCurrentAlbumSlug(slug);
      } else if (hash.startsWith('#avisos/')) {
        const slug = hash.replace('#avisos/', '');
        // Redirect to new path-based route
        window.history.replaceState(null, '', `/aviso/${slug}`);
        setCurrentAnnouncementSlug(slug);
      } else if (hash === '#avisos') {
        setShowAnnouncementsPage(true);
      } else if (hash.startsWith('#campanha/')) {
        const slug = hash.replace('#campanha/', '');
        // Redirect to new path-based route
        window.history.replaceState(null, '', `/campanha/${slug}`);
        setCurrentCampaignSlug(slug);
      } else if (path === '/admin' || path === '/login') {
        if (isAuthenticated) {
          setShowAdmin(true);
        } else {
          setShowLogin(true);
        }
      }
    };

    handleInitialHash();

    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      // Clear all full-page views except the current path/hash
      setShowFesta2025(false);
      setShowPrograms(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfUse(false);
      setShowVideoTestimonials(false);
      setShowPriestsGallery(false);
      setShowCampaignsList(false);
      setShowDocumentations(false);
      setShowSearch(false);
      setShow404(false);
      setCurrentBlogPostSlug(null);
      setCurrentAlbumSlug(null);
      setCurrentAnnouncementSlug(null);
      setShowAnnouncementsPage(false);
      setCurrentCampaignSlug(null);
      setCurrentProgramSlug(null);
      setShowDonationSuccess(false);
      setShowDonationFailure(false);
      
      // Check for new path-based routes
      const isBlogPath = path.startsWith('/blog/');
      const isAlbumPath = path.startsWith('/album/') || path.startsWith('/albuns/');
      const isAnnouncementPath = path.startsWith('/aviso/') || path.startsWith('/avisos/');
      const isProgramPath = path.startsWith('/programacao/');
      
      if (isBlogPath) {
        const slug = path.replace('/blog/', '').split('/')[0];
        setCurrentBlogPostSlug(slug);
        return;
      }
      
      if (isAlbumPath) {
        const slug = path.startsWith('/album/') ? 
          path.replace('/album/', '').split('/')[0] : 
          path.replace('/albuns/', '').split('/')[0];
        setCurrentAlbumSlug(slug);
        return;
      }
      
      if (isAnnouncementPath) {
        const slug = path.startsWith('/aviso/') ? 
          path.replace('/aviso/', '').split('/')[0] : 
          path.replace('/avisos/', '').split('/')[0];
        setCurrentAnnouncementSlug(slug);
        return;
      }

      if (isProgramPath) {
        const slug = path.replace('/programacao/', '').split('/')[0];
        setCurrentProgramSlug(slug);
        return;
      }
      
      // Check for campaign path
      const isCampaignPathInHash = path.startsWith('/campanha/') || (path.match(/^\/[a-z0-9-]+$/) && !validPaths.includes(path));
      if (isCampaignPathInHash) {
        const slug = path.startsWith('/campanha/') ? path.replace('/campanha/', '') : path.replace('/', '');
        setCurrentCampaignSlug(slug);
        return;
      }

      if (path === '/festa-padroeiro') {
        setShowFesta2025(true);
        return;
      }

      if (path === '/programacoes') {
        setShowPrograms(true);
        return;
      }

      if (path === '/campanhas') {
        setShowCampaignsList(true);
        return;
      }

      if (path === '/privacy') {
        setShowPrivacyPolicy(true);
        return;
      }

      if (path === '/terms') {
        setShowTermsOfUse(true);
        return;
      }

      if (path === '/eventos-informativos') {
        setShowVideoTestimonials(true);
        return;
      }

      if (path === '/galeria-dos-padres' || path === '/galeria-de-padres') {
        setShowPriestsGallery(true);
        return;
      }

      if (path === '/pesquisar') {
        setShowSearch(true);
        return;
      }

      if (path === '/admin' || path === '/login' || hash === '#admin' || hash === '#login') {
         if (isAuthenticated) {
            setShowAdmin(true);
            setShowLogin(false);
          } else {
            setShowLogin(true);
            setShowAdmin(false);
          }
          return;
      }

      // Legacy hash-based routes (redirect to new paths)
      if (hash.startsWith('#post/')) {
        const slug = hash.replace('#post/', '');
        window.history.replaceState(null, '', `/blog/${slug}`);
        setCurrentBlogPostSlug(slug);
      } else if (hash.startsWith('#album/')) {
        const slug = hash.replace('#album/', '');
        window.history.replaceState(null, '', `/album/${slug}`);
        setCurrentAlbumSlug(slug);
      } else if (hash.startsWith('#avisos/')) {
        const slug = hash.replace('#avisos/', '');
        window.history.replaceState(null, '', `/aviso/${slug}`);
        setCurrentAnnouncementSlug(slug);
      } else if (hash === '#avisos') {
        setShowAnnouncementsPage(true);
      } else if (hash.startsWith('#campanha/')) {
        const slug = hash.replace('#campanha/', '');
        window.history.replaceState(null, '', `/campanha/${slug}`);
        setCurrentCampaignSlug(slug);
      } else if (!validPaths.includes(path) && path !== '/') {
        // If it's not a valid path and not the homepage, show 404
        setShow404(true);
      } else if (path === '/' && hash === '') {
        // Home page, ensure everything is false
      }
      
      if (path === '/doacao-sucesso' || path.includes('/doacao-sucesso')) {
        setShowDonationSuccess(true);
        return;
      }
      
      if (path.includes('/campanha/') && path.includes('/falha')) {
        setShowDonationFailure(true);
        return;
      }

      if (path === '/doacao/obrigado' || path.includes('/doacao/obrigado')) {
        setShowDonationThankYou(true);
        return;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [isAuthenticated]);

  const handleNavigate = (section: string) => {
    // Reset all single-page views
    setShowCelebrations(false);
    setShowPrograms(false);
    setShowPastorals(false);
    setShowAlbumGallery(false);
    setShowPrivacyPolicy(false);
    setShowTermsOfUse(false);
    setShowFesta2025(false);
    setShowPriestsGallery(false);
    setShowCampaignsList(false);
    setShowSearch(false);
    setShow404(false);
    
    // Reset specific views that use URL hash/path
    setCurrentBlogPostSlug(null);
    setCurrentAlbumSlug(null);
    setCurrentAnnouncementSlug(null);
    setShowAnnouncementsPage(false);
    setCurrentCampaignSlug(null);
    setCurrentProgramSlug(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (section === 'festa-padroeiro') {
      setShowFesta2025(true);
      window.history.pushState(null, '', '/festa-padroeiro');
      return;
    }

    if (section === 'celebrations') {
      setShowCelebrations(true);
      return;
    }

    if (section === 'programs') {
      setShowPrograms(true);
      window.history.pushState(null, '', '/programacoes');
      return;
    }

    if (section === 'pastorals') {
      setShowPastorals(true);
      return;
    }

    if (section === 'privacy') {
      setShowPrivacyPolicy(true);
      window.history.pushState(null, '', '/privacy');
      return;
    }

    if (section === 'terms') {
      setShowTermsOfUse(true);
      window.history.pushState(null, '', '/terms');
      return;
    }
    
    // For Home sections, scroll to the element
    if (section === 'home') {
       window.history.pushState(null, '', '/');
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    
    const mobileMenuButton = document.querySelector('[data-mobile-menu]') as HTMLElement;
    if (mobileMenuButton) {
      mobileMenuButton.click();
    }
    
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        const headerHeight = window.innerWidth < 1024 ? 56 : 64;
        const elementPosition = element.offsetTop - headerHeight;
        
        if (window.navigator.userAgent.includes('Android')) {
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'auto'
          });
          setTimeout(() => {
            window.scrollTo({ 
              top: elementPosition, 
              behavior: 'smooth' 
            });
          }, 50);
        } else {
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'smooth' 
          });
        }
      } 
    }, 150);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowAdmin(true);
  };

  const handleShowFullGallery = () => {
    setShowAlbumGallery(true);
    setShowCelebrations(false);
    setShowPrograms(false);
    setShowPastorals(false);
    setShowFesta2025(false);
    setShow404(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromGallery = () => {
    setShowAlbumGallery(false);
    handleNavigate('photos');
  };

  const handleBackFromCelebrations = () => {
    setShowCelebrations(false);
    handleNavigate('home');
  };

  const handleBackFromPrograms = () => {
    setShowPrograms(false);
    window.history.pushState(null, '', '/');
    handleNavigate('home');
  };

  const handleBackFromPastorals = () => {
    setShowPastorals(false);
    handleNavigate('home');
  };

  const handleBackFromFesta = () => {
    setShowFesta2025(false);
    window.history.pushState(null, '', '/');
    handleNavigate('home');
  };

  const handleBackFrom404 = () => {
    setShow404(false);
    window.history.pushState(null, '', '/');
    handleNavigate('home');
  };

  const handleBackFromPriestsGallery = () => {
    setShowPriestsGallery(false);
    window.history.pushState(null, '', '/');
    handleNavigate('home');
  };

  const handleNavigateToPriestsGallery = () => {
    setShowPriestsGallery(true);
    window.history.pushState(null, '', '/galeria-dos-padres');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || path === '/login' || hash === '#admin' || hash === '#login') {
        if (isAuthenticated) {
          setShowAdmin(true);
          setShowLogin(false);
        } else {
          setShowLogin(true);
          setShowAdmin(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#admin' || hash === '#login') {
        if (isAuthenticated) {
          setShowAdmin(true);
          setShowLogin(false);
        } else {
          setShowLogin(true);
          setShowAdmin(false);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);


  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      {/* Default SEO for Homepage */}
      {!showCelebrations && !showPrograms && !showPastorals && !showAdmin && !showLogin && 
       !showAlbumGallery && !currentAlbumSlug && !currentBlogPostSlug && !currentAnnouncementSlug && 
       !showFesta2025 && !showAnnouncementsPage && !show404 && !showPrivacyPolicy && !showTermsOfUse && 
       !showPriestsGallery && !showCampaignsList && !currentCampaignSlug && !currentProgramSlug && (
        <SEO
          title="Paróquia Senhor Santo Cristo dos Milagres - 40 Anos de Fé | Cid, Tiradentes, SP"
          description="Paróquia Senhor Santo Cristo dos Milagres, cidade Tiradentes, São Paulo. Missas, eventos e comunidade unida em Cristo. Celebrando 40 anos de fé, esperança e amor."
          keywords="paróquia, igreja católica, tiradentes, são paulo, santo cristo dos milagres, missa, fé, comunidade, 40 anos"
          url="https://paroquiasantocristo.com.br"
        />
      )}
      
      <Suspense fallback={null}><UrgentPopup /></Suspense>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#7F1D1D',
              secondary: '#FFF',
            },
          },
        }}
      />
      <WhatsAppButton />
      <ScrollToTopButton />
      <CookieConsent
        onNavigate={(section) => {
          if (section === 'privacy') setShowPrivacyPolicy(true);
          else setShowTermsOfUse(true);
        }}
      />

      <Suspense fallback={<SuspensePageLoader />}>
      {/* Search Page */}
      <AnimatePresence mode="wait">
        {showSearch && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchPage
              onBack={() => {
                setShowSearch(false);
                window.history.pushState(null, '', '/');
                handleNavigate('home');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 404 Page */}
      <AnimatePresence mode="wait">
        {show404 && (
          <motion.div
            key="404"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <NotFoundPage onBack={handleBackFrom404} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Page - Tela completa */}
      <AnimatePresence mode="wait">
        {showAdmin && isAuthenticated && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <AdminPage onBack={() => {
              setShowAdmin(false);
              window.history.pushState(null, '', '/');
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <AnimatePresence>
        {showLogin && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Album View Page */}
      <AnimatePresence mode="wait">
        {currentAlbumSlug && (
          <motion.div
            key="album-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <AlbumViewPage
              slug={currentAlbumSlug}
              onBack={() => {
                setCurrentAlbumSlug(null);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement View Page */}
      <AnimatePresence mode="wait">
        {currentAnnouncementSlug && (
          <motion.div
            key="announcement-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <AnnouncementViewPage
              slug={currentAnnouncementSlug}
              onBack={() => {
                setCurrentAnnouncementSlug(null);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Page */}
      <AnimatePresence mode="wait">
        {currentCampaignSlug && (
          <motion.div
            key="campaign-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <CampaignPage
              slug={currentCampaignSlug}
              onBack={() => {
                setCurrentCampaignSlug(null);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Post View */}
      <AnimatePresence mode="wait">
        {currentBlogPostSlug && (
          <motion.div
            key="blog-post"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <BlogPostPage
              slug={currentBlogPostSlug}
              onBack={() => {
                setCurrentBlogPostSlug(null);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements Page */}
      <AnimatePresence mode="wait">
        {showAnnouncementsPage && (
          <motion.div
            key="announcements-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <AnnouncementsPage
              onBack={() => {
                setShowAnnouncementsPage(false);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Festa do Padroeiro 2025 */}
      <AnimatePresence mode="wait">
        {showFesta2025 && (
          <motion.div
            key="festa-2025"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <FestaPatroeiroPage onBack={handleBackFromFesta} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebrations Page */}
      <AnimatePresence mode="wait">
        {showCelebrations && (
          <motion.div
            key="celebrations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <CelebrationsPage onBack={handleBackFromCelebrations} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Donation Success Page */}
      <AnimatePresence mode="wait">
        {showDonationSuccess && (
          <motion.div
            key="donation-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DonationSuccessPage onBack={() => setShowDonationSuccess(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Donation Failure Page */}
      <AnimatePresence mode="wait">
        {showDonationFailure && (
          <motion.div
            key="donation-failure"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DonationFailurePage 
              onRetry={() => {
                setShowDonationFailure(false);
                window.history.back();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documentations Page */}
      <AnimatePresence mode="wait">
        {showDocumentations && (
          <motion.div
            key="documentations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DocumentationsPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Programs Page */}
      <AnimatePresence mode="wait">
        {showPrograms && (
          <motion.div
            key="programs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <ProgramsPage onBack={handleBackFromPrograms} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program View Page (individual) */}
      <AnimatePresence mode="wait">
        {currentProgramSlug && (
          <motion.div
            key="program-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <ProgramViewPage
              slug={currentProgramSlug}
              onBack={() => {
                setCurrentProgramSlug(null);
                window.history.back();
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pastorals Page */}
      <AnimatePresence mode="wait">
        {showPastorals && (
          <motion.div
            key="pastorals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <PastoralsPage onBack={handleBackFromPastorals} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Album Gallery */}
      <AnimatePresence mode="wait">
        {showAlbumGallery && (
          <motion.div
            key="album-gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <AlbumGallery onBack={handleBackFromGallery} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Page */}
      <AnimatePresence mode="wait">
        {showPrivacyPolicy && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} /> 
            <PrivacyPolicyPage onBack={() => setShowPrivacyPolicy(false)} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Use Page */}
      <AnimatePresence mode="wait">
        {showTermsOfUse && (
          <motion.div
            key="terms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <TermsOfUsePage onBack={() => setShowTermsOfUse(false)} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Testimonials Page */}
      <AnimatePresence mode="wait">
        {showVideoTestimonials && (
          <motion.div
            key="videos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <VideoTestimonialsPage 
              onBack={() => {
                setShowVideoTestimonials(false);
                window.history.pushState(null, '', '/');
              }}
              onNavigate={handleNavigate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priests Gallery Page */}
      <AnimatePresence mode="wait">
        {showPriestsGallery && (
          <motion.div
            key="priests-gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PriestsGalleryPage onBack={handleBackFromPriestsGallery} />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns List Page */}
      <AnimatePresence mode="wait">
        {showCampaignsList && (
          <motion.div
            key="campaigns-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header onNavigate={handleNavigate} />
            <CampaignsListPage 
              onBack={() => {
                setShowCampaignsList(false);
                window.history.pushState(null, '', '/');
                handleNavigate('home');
              }}
            />
            <Footer onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You Page */}
      <AnimatePresence mode="wait">
        {showDonationThankYou && (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DonationThankYouPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (Home Page) */}
      {!showCelebrations && 
       !showPrograms && 
       !showPastorals && 
       !showAlbumGallery && 
       !showPrivacyPolicy && 
       !showTermsOfUse && 
       !showFesta2025 &&
       !showVideoTestimonials &&
       !showPriestsGallery &&
       !showCampaignsList &&
       !showDocumentations &&
       !currentBlogPostSlug && 
       !currentAlbumSlug && 
       !currentAnnouncementSlug &&
       !currentProgramSlug &&
       !showAnnouncementsPage &&
       !currentCampaignSlug &&
       !showDonationSuccess &&
       !showDonationFailure &&
       !showDonationThankYou &&
       !show404 &&
       !showAdmin &&
       !showLogin &&
       (
        <>
          <Header onNavigate={handleNavigate} />
          <main>
            {homeSections['hero'] && <SlidesSection />}
            {homeSections['jubileu_40anos'] && <HeroSection onNavigate={handleNavigate} />}
            {homeSections['history'] && <HistorySection />}
            {homeSections['priest'] && <PriestSection />}
            {homeSections['programs'] && <ProgramsSection />}
            {homeSections['announcements'] && <AnnouncementsSection />}
            {homeSections['blog'] && <BlogSection />}
            {homeSections['albums'] && <PhotoGallery onNavigateToFullGallery={handleShowFullGallery} />}
            {homeSections['videos_carousel'] && (
              <VideosCarouselSection onNavigateToVideosPage={() => {
                setShowVideoTestimonials(true);
                window.history.pushState(null, '', '/eventos-informativos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            )}
            {homeSections['priests_carousel'] && (
              <PriestsCarouselSection onNavigateToPriestsGallery={handleNavigateToPriestsGallery} />
            )}
            {homeSections['contact'] && <ContactSection />}
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}
      {/* O Footer duplicado foi removido daqui! */}
      </Suspense>
    </div>
  );
}

export default App;
