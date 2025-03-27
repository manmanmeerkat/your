import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Your Secret Japan</h3>
            <p className="text-slate-300">
              日本の文化、風習、神話、伝統を探索する旅へようこそ。
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">カテゴリー</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/culture" className="hover:text-white">
                  文化
                </Link>
              </li>
              <li>
                <Link href="/mythology" className="hover:text-white">
                  神話
                </Link>
              </li>
              <li>
                <Link href="/tradition" className="hover:text-white">
                  伝統
                </Link>
              </li>
              <li>
                <Link href="/festivals" className="hover:text-white">
                  祭り
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">リンク</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Your Secret Japan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
