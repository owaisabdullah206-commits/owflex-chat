import { MobileBottomNav } from '@/components/portal/MobileBottomNav'

const themeScript = `(function(){
  var stored = localStorage.getItem('owflex-theme-portal');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (systemDark ? 'dark' : 'light');
  document.documentElement.classList.add('portal', theme);
})()`

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <div className="flex min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--surface)]">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        </div>
      </div>
      <MobileBottomNav />
    </>
  )
}
