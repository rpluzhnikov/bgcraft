import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    // Backdrop with blur effect
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-description"
      >
        {/* Header with Logo */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-500 shadow-lg">
                <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                  <span className="font-bold text-blue-600">[BG]</span>
                  <span className="font-normal">Craft</span>
                </h1>
              </div>
            </div>
          </div>

          <h2
            id="welcome-modal-title"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Welcome aboard 👋
          </h2>
        </div>

        {/* Content */}
        <div
          id="welcome-modal-description"
          className="px-8 pb-6 space-y-5"
        >
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            This app is completely free - no trials, no hidden fees, no "upgrade" buttons.
          </p>

          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-5 shadow-md">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              💙 HELP TO GROW
            </div>
            <p className="text-base font-semibold text-blue-900 dark:text-blue-100 text-center mt-2">
              If you find it useful, share it with your community.
            </p>
          </div>

          <p className="text-base text-gray-700 dark:text-gray-300 font-medium text-center pt-1">
            Now, let's build something cool.
          </p>
        </div>

        {/* Footer with Action Button */}
        <div className="px-8 pb-8 pt-2">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Close welcome modal and start using the app"
          >
            Let's build something cool
          </button>
        </div>
      </div>
    </div>
  );
};
