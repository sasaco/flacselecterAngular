import Image from 'next/image';

export default function Header() {
  return (
    <div className="header">
      <div className="container">
        <div className="liner">
          <Image 
            src="/assets/img/logo.png" 
            alt="Logo"
            width={100}
            height={100}
          />
          <div className="title-and-version">
            <h1>変状対策工設計ツール</h1>
            <div>Ver.2.1.1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
