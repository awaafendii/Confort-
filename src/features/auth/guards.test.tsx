import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireDriver, RequirePassenger, RequireSuperAdmin } from './guards';
import { useAuthStore } from './store';
import type { UserRole } from '@/types/user';

function renderGuarded(Guard: ComponentType, role: UserRole | null, protectedPath: string, fallbackPath: string) {
  useAuthStore.setState({
    account: role ? { id: 'u1', name: 'Test', phone: '600000000', role, createdAt: new Date().toISOString() } : null,
  });

  return render(
    <MemoryRouter initialEntries={[protectedPath]}>
      <Routes>
        <Route element={<Guard />}>
          <Route path={protectedPath} element={<div>Zone protégée</div>} />
        </Route>
        <Route path={fallbackPath} element={<div>Redirigé</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequirePassenger', () => {
  it('lets a PASSENGER account through', () => {
    renderGuarded(RequirePassenger, 'PASSENGER', '/passenger', '/home');
    expect(screen.getByText('Zone protégée')).toBeInTheDocument();
  });

  it('redirects a DRIVER account to /home', () => {
    renderGuarded(RequirePassenger, 'DRIVER', '/passenger', '/home');
    expect(screen.getByText('Redirigé')).toBeInTheDocument();
  });
});

describe('RequireDriver', () => {
  it('redirects a PASSENGER account to /home', () => {
    renderGuarded(RequireDriver, 'PASSENGER', '/driver', '/home');
    expect(screen.getByText('Redirigé')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('lets an ADMIN account through', () => {
    renderGuarded(RequireAdmin, 'ADMIN', '/admin', '/home');
    expect(screen.getByText('Zone protégée')).toBeInTheDocument();
  });

  it('lets a SUPER_ADMIN account through', () => {
    renderGuarded(RequireAdmin, 'SUPER_ADMIN', '/admin', '/home');
    expect(screen.getByText('Zone protégée')).toBeInTheDocument();
  });

  it('blocks a PASSENGER account', () => {
    renderGuarded(RequireAdmin, 'PASSENGER', '/admin', '/home');
    expect(screen.getByText('Redirigé')).toBeInTheDocument();
  });
});

describe('RequireSuperAdmin', () => {
  it('lets a SUPER_ADMIN account through', () => {
    renderGuarded(RequireSuperAdmin, 'SUPER_ADMIN', '/admin/audit', '/admin');
    expect(screen.getByText('Zone protégée')).toBeInTheDocument();
  });

  it('redirects a plain ADMIN to /admin, not /home', () => {
    renderGuarded(RequireSuperAdmin, 'ADMIN', '/admin/audit', '/admin');
    expect(screen.getByText('Redirigé')).toBeInTheDocument();
  });
});
