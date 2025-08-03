import React, { useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="bg-blue-500 text-white p-8 min-h-screen flex flex-col items-center justify-center">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="h-16 w-16 hover:opacity-80 transition-opacity" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="h-16 w-16 hover:opacity-80 transition-opacity animate-spin" alt="React logo" />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold mb-8">Vite + React + TypeScript + Tailwind v4!</h1>
      
      <div className="bg-white bg-opacity-20 p-6 rounded-lg backdrop-blur-sm">
        <button 
          onClick={() => setCount((count: number) => count + 1)}
          className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors mb-4"
        >
          count is {count}
        </button>
        <p className="text-blue-100">
          Edit <code className="bg-black bg-opacity-30 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <p className="text-blue-200 mt-8 text-center">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;