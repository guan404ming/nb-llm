import React, { JSX } from 'react';

export default function Popup(): JSX.Element {
  return (
    <div id='my-ext' className='container bg-slate-950 min-h-screen p-4 w-[1200px] h-[600px]' data-theme='dark'>
      <div className="bg-gray-800 shadow-xl rounded-lg p-4 max-w-md mx-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-400 text-center mb-6">User Guide</h2>
          <ol className="space-y-6 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-blue-500">
            <li className="pl-10 relative">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">1</span>
              </div>
              <p className="font-medium text-white">Open ChatGPT</p>
            </li>
            <li className="pl-10 relative">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">2</span>
              </div>
              <p className="font-medium text-white">Copy the prompt template</p>
              <div className="mt-2 bg-blue-900/50 border border-blue-700 rounded-md p-3 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="text-blue-400 w-6 h-6 mr-2 flex-shrink-0"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-white">Get template from <a href="https://raw.githubusercontent.com/guan404ming/nb-llm/refs/heads/main/prompt-template.txt" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">this link</a></span>
              </div>
            </li>
            <li className="pl-10 relative">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">3</span>
              </div>
              <p className="font-medium text-white">Paste the template into ChatGPT and start chatting</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
