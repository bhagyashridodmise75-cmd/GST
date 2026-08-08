import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  HelpCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Invoice, BusinessProfile, FilingPeriod, AIChatMessage } from '../../types';
import { processSahayakQuery } from '../../services/aiAssistantService';

interface GSTSahayakProps {
  profile: BusinessProfile;
  invoices: Invoice[];
  filingPeriods: FilingPeriod[];
}

export const GSTSahayak: React.FC<GSTSahayakProps> = ({
  profile,
  invoices,
  filingPeriods,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Namaste **${profile.ownerName}**! I am **GST Sahayak**, your AI-powered tax assistant for **${profile.businessName}**.\n\nHow can I assist you with your GST calculations, Input Tax Credit, invoice errors, or filing deadlines today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How much GST do I need to pay?',
        'Show invoices with errors.',
        'Why is my GST payable high?',
        'How much input tax credit do I have?',
        'Show my sales for this month.',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');

  const handleSend = (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const res = processSahayakQuery(queryText, invoices, profile, filingPeriods);

    const botMsg: AIChatMessage = {
      id: `bot_${Date.now()}`,
      sender: 'assistant',
      text: res.replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: res.suggestedFollowups,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">GST Sahayak — AI Tax Assistant</h2>
          <p className="text-xs text-purple-200 mt-0.5">
            Ask questions about your live GST liability, ITC eligibility, error audit findings, and filing dates.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <span className="text-[9px] opacity-60 block mt-1 text-right">{msg.timestamp}</span>

                {/* Prompt Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/20 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask GST Sahayak a question (e.g. 'How much GST do I need to pay?')"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
