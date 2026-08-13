const SESSION_STORAGE_KEY = 'confort-plus-session-id';

/**
 * Identifiant de session navigateur réel — généré une fois par onglet (sessionStorage,
 * pas localStorage) et réutilisé pour toute la durée de l'onglet. Sert de traçabilité pour
 * le journal d'audit à la place d'une IP : l'app est une SPA statique sans backend capable
 * de capturer une IP, donc afficher une fausse IP serait mentir sur des données réelles.
 */
export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id = `sess-${crypto.randomUUID().slice(0, 8)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return 'sess-unknown';
  }
}
