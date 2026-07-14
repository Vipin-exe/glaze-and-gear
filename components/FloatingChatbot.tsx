"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChatOption {
  label: string;
  action: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  options?: ChatOption[];
  products?: any[];
  promos?: any[];
  isTyping?: boolean;
}

type InputMode = 'NONE' | 'ORDER_TRACKING' | 'COMPLAINT_ORDER_ID' | 'COMPLAINT_TEXT';

const WHATSAPP_NUMBER = "919876543210"; // Placeholder

const INITIAL_OPTIONS: ChatOption[] = [
  { label: "🛍️ Shop & Recommendations", action: "SHOP_MENU" },
  { label: "📦 Track My Order", action: "TRACK_ORDER" },
  { label: "🎧 Customer Support & Returns", action: "SUPPORT_MENU" },
  { label: "🎁 Current Offers & Promos", action: "PROMOS" },
];

const SHOP_OPTIONS: ChatOption[] = [
  { label: "🍵 Premium Ceramics (Glaze)", action: "SHOP_GLAZE" },
  { label: "🚗 Automotive Gifts (Gear)", action: "SHOP_GEAR" },
  { label: "💰 Gifts under ₹1,000", action: "SHOP_UNDER_1000" },
  { label: "🏠 Main Menu", action: "MAIN_MENU" },
];

const SUPPORT_OPTIONS: ChatOption[] = [
  { label: "💔 Report Damaged Product", action: "REPORT_DAMAGE" },
  { label: "🔄 Return/Exchange Policy", action: "RETURN_POLICY" },
  { label: "🚚 Shipping Information", action: "SHIPPING_INFO" },
  { label: "💬 Speak to a Human", action: "SPEAK_HUMAN" },
  { label: "🏠 Main Menu", action: "MAIN_MENU" },
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isDarkPage = pathname?.includes('/gears');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('NONE');
  const [inputText, setInputText] = useState("");
  
  // State for the complaint flow
  const [complaintOrderId, setComplaintOrderId] = useState<string | null>(null);
  const [complaintProductId, setComplaintProductId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: "Hello! Welcome to Glaze & Gear. How can I assist you today?",
          options: INITIAL_OPTIONS
        }
      ]);
    }
  }, [messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const addBotMessage = (msg: Omit<ChatMessage, 'id' | 'sender'>, delay = 600) => {
    const typingId = Date.now().toString() + '-typing';
    setMessages(prev => [...prev, { id: typingId, sender: 'bot', isTyping: true }]);
    
    setTimeout(() => {
      setMessages(prev => {
        const filtered = prev.filter(p => p.id !== typingId);
        return [...filtered, { id: Date.now().toString(), sender: 'bot', ...msg }];
      });
    }, delay);
  };

  const handleOptionClick = async (option: ChatOption) => {
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: option.label }]);

    switch (option.action) {
      case "MAIN_MENU":
        setInputMode('NONE');
        addBotMessage({ text: "What else can I help you with?", options: INITIAL_OPTIONS });
        break;
      
      case "SHOP_MENU":
        addBotMessage({ text: "I'd love to help you find the perfect item. What are you looking for?", options: SHOP_OPTIONS });
        break;
      
      case "SUPPORT_MENU":
        addBotMessage({ text: "We're here to help. What seems to be the issue?", options: SUPPORT_OPTIONS });
        break;
      
      case "TRACK_ORDER":
        setInputMode('ORDER_TRACKING');
        addBotMessage({ text: "Sure thing! Please type your Order ID below (e.g., 64ab3c...). You can find this in your confirmation email." });
        break;
      
      case "REPORT_DAMAGE":
        setInputMode('COMPLAINT_ORDER_ID');
        addBotMessage({ text: "I can help with that. Our return window for damaged items is 7 days from delivery. Please enter your Order ID to verify eligibility:" });
        break;
      
      case "RETURN_POLICY":
        addBotMessage({ 
          text: "We accept returns within 7 days of delivery for unused items in their original packaging. Custom/personalized items cannot be returned unless damaged. Would you like to initiate a return?",
          options: [{ label: "💬 Yes, chat on WhatsApp", action: "SPEAK_HUMAN" }, { label: "🏠 Main Menu", action: "MAIN_MENU" }]
        });
        break;
      
      case "SHIPPING_INFO":
        addBotMessage({ 
          text: "We ship across India! Standard delivery takes 5-7 business days. Express shipping is available for select pin codes.",
          options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }]
        });
        break;
      
      case "SPEAK_HUMAN":
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I need help with my order.")}`, '_blank');
        addBotMessage({ text: "I've opened WhatsApp for you! A team member will respond shortly.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] });
        break;
      
      case "SHOP_GLAZE":
        await fetchAndShowProducts("?category=glaze", "Here are some of our premium ceramics!");
        break;
      
      case "SHOP_GEAR":
        await fetchAndShowProducts("?category=gear", "Here are some of our best automotive gifts!");
        break;
      
      case "SHOP_UNDER_1000":
        await fetchAndShowProducts("?maxPrice=1000", "Here are some great options under ₹1,000!");
        break;
      
      if (option.action.startsWith("SELECT_COMPLAINT_PRODUCT_")) {
        const productId = option.action.replace("SELECT_COMPLAINT_PRODUCT_", "");
        setComplaintProductId(productId);
        setInputMode('COMPLAINT_TEXT');
        addBotMessage({ text: "Got it. Please briefly describe the damage (e.g., 'handle broken', 'scratched surface'):" }, 400);
      }
    }
  };

  const fetchAndShowProducts = async (queryString: string, introText: string) => {
    addBotMessage({ text: "Let me check our inventory for you..." }, 200);
    try {
      const res = await fetch(`/api/products${queryString}`);
      const data = await res.json();
      if (data && data.length > 0) {
        // Show up to 4 products in carousel
        addBotMessage({ text: introText, products: data.slice(0, 4), options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      } else {
        addBotMessage({ text: "Sorry, I couldn't find any products matching that right now.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      }
    } catch {
      addBotMessage({ text: "Sorry, I'm having trouble connecting to our store.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
    }
  };

  const fetchAndShowPromos = async () => {
    addBotMessage({ text: "Checking our active offers..." }, 200);
    try {
      const res = await fetch(`/api/promos`);
      const data = await res.json();
      const activePromos = data.filter((p: any) => p.isActive);
      
      if (activePromos.length > 0) {
        addBotMessage({ text: "Everybody loves a good deal! Here are our active promotions:", promos: activePromos, options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      } else {
        addBotMessage({ text: "We don't have any active promotions at the moment. Check back later!", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      }
    } catch {
      addBotMessage({ text: "Sorry, I couldn't fetch the offers.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setInputText("");

    if (inputMode === 'ORDER_TRACKING') {
      setInputMode('NONE');
      addBotMessage({ text: "Looking up your order..." }, 200);
      
      try {
        const res = await fetch(`/api/chatbot/order-status?orderId=${encodeURIComponent(userText)}`);
        const data = await res.json();
        
        if (res.ok && data) {
          addBotMessage({ 
            text: `Order found! Your order is currently **${data.status}**. ${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}`,
            options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }]
          }, 1000);
        } else {
          addBotMessage({ 
            text: "I couldn't find an order with that ID. Would you like to speak to a human?",
            options: [{ label: "💬 Chat on WhatsApp", action: "SPEAK_HUMAN" }, { label: "🏠 Main Menu", action: "MAIN_MENU" }]
          }, 1000);
        }
      } catch {
        addBotMessage({ text: "Error looking up order.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      }

    } else if (inputMode === 'COMPLAINT_ORDER_ID') {
      setInputMode('NONE');
      addBotMessage({ text: "Checking order eligibility..." }, 200);
      
      try {
        const res = await fetch(`/api/chatbot/order-eligibility?orderId=${encodeURIComponent(userText)}`);
        const data = await res.json();
        
        if (res.ok && data.isEligible) {
          setComplaintOrderId(data.order.id);
          
          const productOptions = data.order.items.map((item: any) => ({
            label: item.product.name,
            action: `SELECT_COMPLAINT_PRODUCT_${item.product.id}`
          }));

          addBotMessage({ 
            text: "Order verified! Here are the items from that order. Which one arrived damaged?",
            options: productOptions
          }, 1000);
        } else {
          addBotMessage({ 
            text: data.error || "I couldn't verify an eligible order with that ID.",
            options: [{ label: "💬 Speak to a Human", action: "SPEAK_HUMAN" }, { label: "🏠 Main Menu", action: "MAIN_MENU" }]
          }, 1000);
        }
      } catch {
        addBotMessage({ text: "Error verifying order.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      }
      
    } else if (inputMode === 'COMPLAINT_TEXT') {
      setInputMode('NONE');
      addBotMessage({ text: "Submitting your complaint..." }, 200);
      
      try {
        const res = await fetch('/api/chatbot/complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: complaintOrderId,
            productId: complaintProductId,
            description: userText
          })
        });
        
        if (res.ok) {
          addBotMessage({ 
            text: "✅ Your complaint has been successfully registered! Our support team will review it and get back to you shortly.",
            options: [{ label: "💬 Follow up on WhatsApp", action: "SPEAK_HUMAN" }, { label: "🏠 Main Menu", action: "MAIN_MENU" }]
          }, 1000);
        } else {
          throw new Error('Failed');
        }
      } catch {
        addBotMessage({ text: "Sorry, I couldn't submit your complaint right now.", options: [{ label: "🏠 Main Menu", action: "MAIN_MENU" }] }, 1000);
      }
    }
  };

  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <>
      {/* Floating Button */}
      {isDarkPage ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_30px_rgb(0,255,255,0.15)] flex items-center justify-center hover:scale-110 transition-transform z-[9000] bg-white border border-gray-200 ${isOpen ? 'rotate-90 scale-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'}`}
          aria-label="Chat with us"
        >
          <img src="/g_g_logo_bg-removebg-preview.png" alt="Chat" className="w-full h-full object-contain drop-shadow-xl p-1 invert" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center hover:scale-110 transition-transform z-[9000] bg-white ${isOpen ? 'rotate-90 scale-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'}`}
          aria-label="Chat with us"
        >
          <img src="/g_g_logo_bg-removebg-preview.png" alt="Chat" className="w-full h-full object-contain drop-shadow-xl p-1" />
        </button>
      )}

      {/* Chat Window */}
      <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[380px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9001] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-[#98202E] p-4 flex justify-between items-center text-white shrink-0 shadow-md z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-inner overflow-hidden">
              <img src="/g_g_logo_bg-removebg-preview.png" alt="Support" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Glaze & Gear Support</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              
              {/* Text Bubble */}
              {msg.text && !msg.isTyping && (
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#0a0a0a] text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </div>
              )}

              {/* Typing Indicator */}
              {msg.isTyping && (
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}

              {/* Product Carousel */}
              {msg.products && (
                <div className="mt-2 w-full flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
                  {msg.products.map(p => (
                    <div key={p.id} className="min-w-[140px] max-w-[140px] bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm shrink-0 snap-start flex flex-col">
                      <div className="h-28 bg-gray-100 relative">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="p-2 flex flex-col flex-1">
                        <p className="font-bold text-[11px] leading-tight line-clamp-2 mb-1">{p.name}</p>
                        <p className="text-xs text-[#98202E] font-black mt-auto">₹{p.price}</p>
                        <Link href={`/products/${p.slug}`} className="mt-2 w-full text-center bg-gray-100 hover:bg-gray-200 text-xs py-1.5 rounded-lg font-medium transition-colors">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Promo List */}
              {msg.promos && (
                <div className="mt-2 flex flex-col gap-2 w-full">
                  {msg.promos.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{p.code}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        {p.discountType === 'PERCENTAGE' ? `${p.discountPercent}% OFF` : `₹${p.flatDiscountAmount} OFF`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Options */}
              {msg.options && (
                <div className="mt-3 flex flex-col gap-1.5 items-end">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(opt)}
                      className="bg-white hover:bg-gray-50 border border-[#98202E]/20 text-[#98202E] text-xs font-medium px-4 py-2 rounded-xl shadow-sm transition-colors text-right max-w-full"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Only visible when inputMode !== 'NONE') */}
        {inputMode !== 'NONE' && (
          <form onSubmit={handleInputSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={inputMode === 'ORDER_TRACKING' || inputMode === 'COMPLAINT_ORDER_ID' ? "Enter Order ID..." : "Type here..."}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#98202E]/20"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-[#0a0a0a] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <div className="mt-2 text-center">
              <button 
                type="button" 
                onClick={() => { setInputMode('NONE'); handleOptionClick({ label: "Cancel", action: "MAIN_MENU" }); }}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-medium uppercase tracking-widest"
              >
                Cancel & Go Back
              </button>
            </div>
          </form>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}
