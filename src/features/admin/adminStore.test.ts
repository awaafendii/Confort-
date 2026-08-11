import { beforeEach, describe, expect, it } from 'vitest';
import { useAdminStore } from './adminStore';
import { useAuthStore } from '@/features/auth/store';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';

/**
 * Régression Phase 9/11 : 'md-1' (MOCK_DRIVERS_POOL) et 'demo-driver'
 * (DEMO_DRIVER_ENTRY) sont la même identité fictive — un doublon invisible
 * jusqu'à ce que la page Chauffeurs les liste côte à côte. Ces tests
 * protègent la déduplication et le journal d'audit qui en a hérité un bug
 * de résolution de nom (corrigé en retombant sur MOCK_DRIVERS_POOL complet).
 */
describe('useAdminStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      account: { id: 'test-admin', name: 'Test Admin', phone: '600000099', role: 'ADMIN', createdAt: new Date().toISOString() },
    });
  });

  it('excludes md-1 from the driver list since it duplicates the demo driver identity', () => {
    const drivers = useAdminStore.getState().drivers;
    expect(drivers.filter((d) => d.name === 'Mamadou Bah')).toHaveLength(1);
    expect(drivers.some((d) => d.id === 'md-1')).toBe(false);
    expect(drivers.some((d) => d.id === 'demo-driver')).toBe(true);
  });

  it('keeps md-1 in the raw pool so other data (ride/ticket history) can still resolve its name', () => {
    expect(MOCK_DRIVERS_POOL.some((d) => d.id === 'md-1')).toBe(true);
  });

  it('logs an audit entry with the currently authenticated actor when blocking a user', () => {
    const before = useAdminStore.getState().auditLog.length;
    const target = useAdminStore.getState().users[0];

    useAdminStore.getState().setUserStatus(target.id, 'BLOCKED');

    const auditLog = useAdminStore.getState().auditLog;
    expect(auditLog.length).toBe(before + 1);
    expect(auditLog[0].actorId).toBe('test-admin');
    expect(auditLog[0].action).toBe('Compte bloqué');
    expect(auditLog[0].target).toBe(target.name);

    useAdminStore.getState().setUserStatus(target.id, 'ACTIVE');
  });

  it('logs an audit entry when suspending a driver', () => {
    const before = useAdminStore.getState().auditLog.length;
    const driver = useAdminStore.getState().drivers[0];

    useAdminStore.getState().setDriverVerification(driver.id, 'SUSPENDED');

    const auditLog = useAdminStore.getState().auditLog;
    expect(auditLog.length).toBe(before + 1);
    expect(auditLog[0].action).toBe('Chauffeur suspendu');
    expect(auditLog[0].target).toBe(driver.name);

    useAdminStore.getState().setDriverVerification(driver.id, 'VERIFIED');
  });

  it('attributes the audit entry to "unknown" if somehow no account is authenticated', () => {
    useAuthStore.setState({ account: null });
    const ticket = useAdminStore.getState().tickets[0];

    useAdminStore.getState().setTicketStatus(ticket.id, 'CLOSED');

    expect(useAdminStore.getState().auditLog[0].actorId).toBe('unknown');
  });
});
