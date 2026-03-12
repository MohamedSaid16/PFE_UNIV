/*
  AuthLayout — wrapper for auth pages (login, register, etc.).
  Converted from friend's TS. Design tokens applied.
*/

import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* IK monogram */}
          <div className="mx-auto w-14 h-14 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xl tracking-tight select-none mb-6">
            IK
          </div>

          <h2 className="text-2xl font-bold text-ink tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Or{' '}
            <Link to="/" className="font-medium text-brand hover:text-brand-hover transition-colors">
              return to home
            </Link>
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
