import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Obligation Hub",
  description: "契約義務管理・案件追跡システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    Contract Hub
                  </span>
                </a>
                <span className="text-gray-300 hidden sm:block">|</span>
                <span className="text-sm text-gray-500 hidden sm:block">
                  契約義務管理システム
                </span>
              </div>
              <nav className="flex items-center gap-4">
                <a
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  案件一覧
                </a>
                <a
                  href="/cases/new"
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
                >
                  ＋ 新規起票
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
