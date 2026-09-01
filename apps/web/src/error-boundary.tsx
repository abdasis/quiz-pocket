import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Quiz Pocket Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    // Clear corrupted session states in localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('quiz_pocket_session_state_')) {
        localStorage.removeItem(key)
      }
    })
    window.location.reload()
  }

  handleFullReset = () => {
    localStorage.clear()
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-white dark:bg-[#111114] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-mono font-bold text-xl">
              !
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Terjadi Kendala Tampilan</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {this.state.error?.message || 'Data sesi atau state lokal kuis perlu disegarkan kembali.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full h-11 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Segarkan Sesi Kuis (Muat Ulang)
              </button>
              <button
                onClick={this.handleFullReset}
                className="w-full h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-200"
              >
                Reset Penyimpanan & Login Ulang
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
