import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { SEO } from './components/ui/SEO';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { SlidesSection } from './components/sections/SlidesSection';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
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
const MassScheduleSection = React.lazy(() => import('./components/sections/MassScheduleSection').then(m => ({ default: m.MassScheduleSection })));

// Lazy load all subpage components
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

// Definitive Atomic Route Type
export type AppRoute =
  | { type: 'home'; section?: string }
  | { type: 'celebrations' }
  | { type: 'programs' }
  | { type: 'program'; slug: string }
  | { type: 'pastorals' }
  | { type: 'albums' }
  | { type: 'album'; slug: string }
  | { type: 'announcements' }
  | { type: 'announcement'; slug: string }
  | { type: 'blog'; slug: string }
  | { type: 'festa-padroeiro' }
  | { type: 'videos' }
  | { type: 'campaigns' }
  | { type: 'campaign'; slug: string }
  | { type: 'donation-success' }
  | { type: 'donation-failure' }
  | { type: 'donation-thank-you' }
  | { type: 'priests-gallery' }
  | { type: 'documentacoes' }
  | { type: 'search' }
  | { type: 'privacy' }
  | { type: 'terms' }
  | { type: 'login' }
  | { type: 'admin' }
  | { type: 'not-found' };

// Parser function to convert pathname & hash into a single atomic route
function parseCurrentRoute(): AppRoute {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hash = window.location.hash;

  if (path === '/admin') return { type: 'admin' };
  if (path === '/login') return { type: 'login' };
  if (path === '/privacy') return { type: 'privacy' };
  if (path === '/terms') return { type: 'terms' };
  if (path === '/festa-padroeiro') return { type: 'festa-padroeiro' };
  if (path === '/programacoes') return { type: 'programs' };
  if (path === '/pastorais') return { type: 'pastorals' };
  if (path === '/celebracoes') return { type: 'celebrations' };
  if (path === '/albuns' || path === '/fotos') return { type: 'albums' };
  if (path === '/avisos') return { type: 'announcements' };
  if (path === '/campanhas') return { type: 'campaigns' };
  if (path === '/documentacoes') return { type: 'documentacoes' };
  if (path === '/galeria-dos-padres' || path === '/galeria-de-padres') return { type: 'priests-gallery' };
  if (path === '/eventos-informativos' || path === '/videos') return { type: 'videos' };
  if (path === '/pesquisar') return { type: 'search' };
  if (path === '/doacao-sucesso') return { type: 'donation-success' };
  if (path === '/doacao-falha') return { type: 'donation-failure' };
  if (path === '/doacao-obrigado') return { type: 'donation-thank-you' };

  // Dynamic slug routes
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '').split('/')[0];
    return slug ? { type: 'blog', slug } : { type: 'not-found' };
  }
  if (path.startsWith('/album/') || path.startsWith('/albuns/')) {
    const slug = path.replace(/^\/albu(m|ns)\//, '').split('/')[0];
    return slug ? { type: 'album', slug } : { type: 'not-found' };
  }
  if (path.startsWith('/aviso/') || path.startsWith('/avisos/')) {
    const slug = path.replace(/^\/aviso(s)?\//, '').split('/')[0];
    return slug ? { type: 'announcement', slug } : { type: 'not-found' };
  }
  if (path.startsWith('/programacao/')) {
    const slug = path.replace('/programacao/', '').split('/')[0];
    return slug ? { type: 'program', slug } : { type: 'not-found' };
  }
  if (path.startsWith('/campanha/')) {
    const slug = path.replace('/campanha/', '').split('/')[0];
    return slug ? { type: 'campaign', slug } : { type: 'not-found' };
  }

  // Hash-based legacy routes
  if (hash.startsWith('#post/')) {
    const slug = hash.replace('#post/', '');
    return { type: 'blog', slug };
  }
  if (hash.startsWith('#album/')) {
    const slug = hash.replace('#album/', '');
    return { type: 'album', slug };
  }

  // Root or section hash
  if (path === '/') {
    const section = hash.replace('#', '') || undefined;
    return { type: 'home', section };
  }

  return { type: 'not-found' };
}

const SuspensePageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-900">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e8c872] border-t-transparent" />
  </div>
);

function App() {
  const [route, setRoute] = useState<AppRoute>(parseCurrentRoute);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [homeSections, setHomeSections] = useState<{ [key: string]: boolean }>({
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
    contact: true,
  });

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && route.type === 'admin') {
        navigateTo('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [route.type]);

  // Load home section settings
  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        const { data } = await supabase
          .from('home_sections')
          .select('section_key, is_active');

        if (data && data.length > 0) {
          const map = data.reduce((acc: { [key: string]: boolean }, s: any) => {
            acc[s.section_key] = s.is_active === true;
            return acc;
          }, {} as { [key: string]: boolean });
          setHomeSections(map);
        }
      } catch (e) {
        console.error('Error fetching home sections:', e);
      }
    };
    fetchHomeSections();
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const onPopState = () => {
      setRoute(parseCurrentRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Track page views on route change
  useEffect(() => {
    const path = window.location.pathname + window.location.hash;
    trackPageView(path, document.title);
  }, [route]);

  // Unified Navigator function
  const navigateTo = useCallback((target: string) => {
    if (target === 'home' || target === '/') {
      window.history.pushState(null, '', '/');
      setRoute({ type: 'home' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'privacy') {
      window.history.pushState(null, '', '/privacy');
      setRoute({ type: 'privacy' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'terms') {
      window.history.pushState(null, '', '/terms');
      setRoute({ type: 'terms' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'documentacoes') {
      window.history.pushState(null, '', '/documentacoes');
      setRoute({ type: 'documentacoes' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'campanhas') {
      window.history.pushState(null, '', '/campanhas');
      setRoute({ type: 'campanhas' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'eventos-informativos' || target === 'videos') {
      window.history.pushState(null, '', '/eventos-informativos');
      setRoute({ type: 'videos' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'galeria-dos-padres') {
      window.history.pushState(null, '', '/galeria-dos-padres');
      setRoute({ type: 'priests-gallery' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'festa-padroeiro') {
      window.history.pushState(null, '', '/festa-padroeiro');
      setRoute({ type: 'festa-padroeiro' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'programacoes') {
      window.history.pushState(null, '', '/programacoes');
      setRoute({ type: 'programs' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'avisos') {
      window.history.pushState(null, '', '/avisos');
      setRoute({ type: 'announcements' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'login') {
      window.history.pushState(null, '', '/login');
      setRoute({ type: 'login' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'admin') {
      window.history.pushState(null, '', '/admin');
      setRoute({ type: 'admin' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Path starting with '/' (e.g. '/aviso/meu-slug', '/campanha/slug')
    if (target.startsWith('/')) {
      window.history.pushState(null, '', target);
      setRoute(parseCurrentRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Home Section scroll (e.g. 'history', 'programs', 'announcements', 'pastorals', 'photos', 'contact', 'priest', 'horarios-missas')
    const validSections = ['history', 'programs', 'announcements', 'pastorals', 'photos', 'contact', 'priest', 'horarios-missas'];
    if (validSections.includes(target)) {
      if (route.type !== 'home') {
        window.history.pushState(null, '', '/#' + target);
        setRoute({ type: 'home', section: target });
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        window.history.pushState(null, '', '/#' + target);
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Default fallback: parse as route
    window.history.pushState(null, '', target);
    setRoute(parseCurrentRoute());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route.type]);

  // Render individual active page component
  const renderContent = () => {
    switch (route.type) {
      case 'home':
        return (
          <main>
            {homeSections['hero'] && <SlidesSection />}
            {homeSections['jubileu_40anos'] && <HeroSection onNavigate={navigateTo} />}
            <MassScheduleSection />
            {homeSections['announcements'] && <AnnouncementsSection />}
            {homeSections['programs'] && <ProgramsSection />}
            {homeSections['priest'] && <PriestSection />}
            {homeSections['history'] && <HistorySection />}
            {homeSections['blog'] && <BlogSection />}
            {homeSections['albums'] && (
              <PhotoGallery onNavigateToFullGallery={() => navigateTo('/albuns')} />
            )}
            {homeSections['videos_carousel'] && (
              <VideosCarouselSection onNavigateToVideosPage={() => navigateTo('/eventos-informativos')} />
            )}
            {homeSections['priests_carousel'] && (
              <PriestsCarouselSection onNavigateToPriestsGallery={() => navigateTo('/galeria-dos-padres')} />
            )}
            {homeSections['contact'] && <ContactSection />}
          </main>
        );

      case 'privacy':
        return <PrivacyPolicyPage onBack={() => navigateTo('home')} />;

      case 'terms':
        return <TermsOfUsePage onBack={() => navigateTo('home')} />;

      case 'festa-padroeiro':
        return <FestaPatroeiroPage onBack={() => navigateTo('home')} />;

      case 'programs':
        return <ProgramsPage onBack={() => navigateTo('home')} />;

      case 'program':
        return (
          <ProgramViewPage
            slug={route.slug}
            onBack={() => {
              window.history.back();
            }}
          />
        );

      case 'pastorals':
        return <PastoralsPage onBack={() => navigateTo('home')} />;

      case 'celebrations':
        return <CelebrationsPage onBack={() => navigateTo('home')} />;

      case 'albums':
        return <AlbumGallery onBack={() => navigateTo('home')} />;

      case 'album':
        return (
          <AlbumViewPage
            slug={route.slug}
            onBack={() => {
              window.history.back();
            }}
          />
        );

      case 'announcements':
        return <AnnouncementsPage onBack={() => navigateTo('home')} />;

      case 'announcement':
        return (
          <AnnouncementViewPage
            slug={route.slug}
            onBack={() => {
              window.history.back();
            }}
          />
        );

      case 'blog':
        return (
          <BlogPostPage
            slug={route.slug}
            onBack={() => {
              window.history.back();
            }}
          />
        );

      case 'campaigns':
        return <CampaignsListPage onBack={() => navigateTo('home')} />;

      case 'campaign':
        return (
          <CampaignPage
            slug={route.slug}
            onBack={() => {
              window.history.back();
            }}
          />
        );

      case 'documentacoes':
        return <DocumentationsPage />;

      case 'priests-gallery':
        return <PriestsGalleryPage onBack={() => navigateTo('home')} />;

      case 'videos':
        return <VideoTestimonialsPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />;

      case 'search':
        return <SearchPage onBack={() => navigateTo('home')} />;

      case 'donation-success':
        return <DonationSuccessPage onBack={() => navigateTo('home')} />;

      case 'donation-failure':
        return <DonationFailurePage onRetry={() => navigateTo('/campanhas')} />;

      case 'donation-thank-you':
        return <DonationThankYouPage />;

      case 'login':
        return (
          <LoginForm
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              navigateTo('/admin');
            }}
          />
        );

      case 'admin':
        if (!isAuthenticated) {
          return (
            <LoginForm
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                navigateTo('/admin');
              }}
            />
          );
        }
        return <AdminPage onBack={() => navigateTo('home')} />;

      case 'not-found':
      default:
        return <NotFoundPage onBack={() => navigateTo('home')} />;
    }
  };

  // Full-screen standalone routes without regular Header/Footer wrapper
  const isFullScreen = route.type === 'admin' && isAuthenticated;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      <SEO />
      <Toaster position="top-right" />
      <UrgentPopup onNavigate={navigateTo} />
      <ScrollToTopButton />
      <WhatsAppButton />
      <CookieConsent />

      <Suspense fallback={<SuspensePageLoader />}>
        {isFullScreen ? (
          renderContent()
        ) : (
          <>
            <Header onNavigate={navigateTo} />
            <AnimatePresence mode="wait">
              <motion.div
                key={route.type + (('slug' in route && route.slug) ? route.slug : '')}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className={`flex-1 ${route.type === 'home' ? '' : 'pt-16 sm:pt-20'}`}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
            <Footer onNavigate={navigateTo} />
            <MobileBottomNav
              onNavigate={navigateTo}
              onOpenMenu={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              activeSection={route.type === 'home' ? 'home' : (route.type as string)}
            />
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;
