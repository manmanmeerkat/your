'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-50 shadow-sm">
      <div className="container mx-auto px-16 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            Your Secret Japan
          </Link>
          
          {/* モバイルメニューボタン */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </Button>
          
          {/* デスクトップナビゲーション */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li>
                <Link href="/culture" className="px-4 py-2 hover:text-slate-900">
                  文化
                </Link>
              </li>
              <li>
                <Link href="/mythology" className="px-4 py-2 hover:text-slate-900">
                  神話
                </Link>
              </li>
              <li>
                <Link href="/tradition" className="px-4 py-2 hover:text-slate-900">
                  伝統
                </Link>
              </li>
              <li>
                <Link href="/festivals" className="px-4 py-2 hover:text-slate-900">
                  祭り
                </Link>
              </li>
              <li>
                <Link href="/about" className="px-4 py-2 hover:text-slate-900">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* モバイルメニュー */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <ul className="space-y-2">
              <li>
                <Link href="/culture" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-2 py-1 hover:bg-slate-100 rounded">文化</span>
                </Link>
              </li>
              <li>
                <Link href="/mythology" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-2 py-1 hover:bg-slate-100 rounded">神話</span>
                </Link>
              </li>
              <li>
                <Link href="/tradition" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-2 py-1 hover:bg-slate-100 rounded">伝統</span>
                </Link>
              </li>
              <li>
                <Link href="/festivals" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-2 py-1 hover:bg-slate-100 rounded">祭り</span>
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-2 py-1 hover:bg-slate-100 rounded">About</span>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
