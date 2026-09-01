'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default function ContactHelpdeskPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: '',
    department: 'General Enquiries',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans text-govText">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-saffron font-extrabold text-xs uppercase tracking-widest block">
            Official B2G Support Channel
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue">Contact UdyogSathi AI Helpdesk</h1>
          <p className="text-xs text-govMuted">
            Get technical assistance, report statutory workflow queries, or connect with Maharashtra MIDC/MPCB department nodal officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-govBlue flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-govBlue">Toll-Free Entrepreneur Helpline</h3>
              <p className="text-[11px] text-slate-600">1800-22-2613 (Mon-Sat, 9:00 AM - 6:00 PM IST)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-govBlue">Official Portal Email</h3>
              <p className="text-[11px] text-slate-600">helpdesk@udyogsathi.gov.in / support@midc.maharashtra.gov.in</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-govBlue">State Nodal Headquarters</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Directorate of Industries, 2nd Floor, New Administrative Building, Opposite Mantralaya, Mumbai - 400032, Maharashtra.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-govBorder shadow-sm space-y-6">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-saffron" /> Submit Official Query / Ticket
            </h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-300 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                <h3 className="font-extrabold text-sm text-green-900">Query Ticket Generated Successfully</h3>
                <p className="text-xs text-green-800">
                  Ticket reference number: <strong className="font-mono">TKT-2026-9901</strong>. A nodal officer will respond within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vijay Kulkarni"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 98220 12345"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Target Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    >
                      <option value="General Enquiries">General Portal Assistance</option>
                      <option value="MPCB">Maharashtra Pollution Control Board (MPCB)</option>
                      <option value="MIDC">MIDC Land & Planning</option>
                      <option value="DISH">DISH Industrial Safety</option>
                      <option value="Technical">Technical / Document Vault Bug</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of query"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Detailed Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant application reference codes or details..."
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold px-6 py-3 rounded-xl shadow flex items-center gap-2 text-xs"
                >
                  <Send className="w-4 h-4" /> Submit Query to Helpdesk
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
