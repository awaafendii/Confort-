import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Filet de sécurité racine : sans ceci, une exception non gérée dans n'importe
 * quelle page laisse React démonter tout l'arbre et affiche un écran blanc —
 * le pire résultat possible pour un utilisateur. `componentDidCatch`/
 * `getDerivedStateFromError` ne sont disponibles que sur un composant classe.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Confort+ — erreur non gérée :', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title="Une erreur est survenue"
          description="Quelque chose s'est mal passé. Rechargez la page pour réessayer."
          actionLabel="Recharger"
          onAction={() => window.location.reload()}
          className="w-full"
        />
      </div>
    );
  }
}
