'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div>
      <div className="container">
        <div className="page-selector">
          <nav>
            <Link 
              href="/input-page"
              className={pathname === '/input-page' ? 'is-active' : ''}
            >
              条件の設定
            </Link>
            <Link 
              href="/output-page"
              className={pathname === '/output-page' ? 'is-active' : ''}
            >
              結果
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
