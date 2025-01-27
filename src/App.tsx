import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthForm } from './components/AuthForm';
import { Chat } from './components/Chat';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add debugging
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  console.log('App rendering, isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-900">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthForm onLogin={setIsAuthenticated} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Chat onLogout={() => setIsAuthenticated(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
