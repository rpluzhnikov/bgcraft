import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mail, Linkedin, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleEmailClick = () => {
    const subject = encodeURIComponent('LinkedIn Cover Generator Feedback');
    const body = encodeURIComponent('Hi,\n\nI would like to share feedback about the LinkedIn Cover Generator:\n\n');
    window.open(`mailto:pluzhnikov137@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setIsOpen(false);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('pluzhnikov137@gmail.com');
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/in/pluzhnikov-roman/', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium',
          isOpen && 'bg-gray-50'
        )}
        title="Send Feedback"
        aria-label="Send feedback"
        aria-expanded={isOpen}
      >
        <MessageSquare className="h-5 w-5" />
        <span>Feedback</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Send Feedback
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <button
              onClick={handleEmailClick}
              className="flex-1 text-left"
            >
              <div className="text-sm font-medium text-gray-900">Send Email</div>
              <div className="text-xs text-gray-500">pluzhnikov137@gmail.com</div>
            </button>
            <button
              onClick={handleCopyEmail}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0',
                copied ? 'bg-green-100' : 'bg-gray-100 hover:bg-gray-200'
              )}
              title={copied ? 'Email copied!' : 'Copy email'}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          <button
            onClick={handleLinkedInClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Linkedin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">LinkedIn Profile</div>
              <div className="text-xs text-gray-500">Connect with me</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
