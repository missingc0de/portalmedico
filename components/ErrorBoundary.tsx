import React from 'react';

export interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

export interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900">
              {this.props.fallbackTitle || 'Se produjo un error inesperado'}
            </h2>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              La aplicación ha detectado un problema al cargar el contenido. Puedes intentar recargar la página o reiniciar la sesión.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-left max-h-28 overflow-y-auto">
                <p className="text-[11px] font-mono text-rose-700 break-words font-semibold">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex-1 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Reiniciar sesión
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
