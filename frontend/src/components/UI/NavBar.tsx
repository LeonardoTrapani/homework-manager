import React from 'react';

import { AcademicCapIcon } from '@heroicons/react/outline';
const NavBar: React.FC = () => {
  return (
    <header>
      <nav className='bg-blue-900 h-14 flex items-center p-3 w-screen'>
        <ul className='flex gap-3 items-center text-slate-200'>
          <li>
            <AcademicCapIcon className='h-8' />
          </li>
          <li>Signup</li>
          <li>Search</li>
          <li>Home</li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
