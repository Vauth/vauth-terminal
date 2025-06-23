import React from 'react';
import { motion } from 'framer-motion';
import CyberGrid from './components/CyberGrid';
import NativeTerminal from './components/NativeTerminal';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-body overflow-hidden relative">
      {/* Subtle Grid Background */}
      <CyberGrid />
      
      {/* Main Content - Full Screen Terminal */}
      <motion.div 
        className="relative z-20 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full"
        >
          <NativeTerminal />
        </motion.div>
      </motion.div>
      
      {/* Minimal Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}

export default App;