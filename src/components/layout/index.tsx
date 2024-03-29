import React from 'react';
import Footer from '../commons/Footer';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      <Footer />
    </div>
  );
}
