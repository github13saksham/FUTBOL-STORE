import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0C] flex flex-col text-white">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24 w-full mt-10">
        <h1 className="text-4xl font-serif mb-8 text-white">Refund Policy</h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider text-xs">Unforeseen Unavailability</h2>
            <p>
              In the rare event that a jersey you ordered becomes unavailable due to unforeseen circumstances (e.g., stock shortage, quality control issues, or supply chain delays), we will notify you immediately via email.
            </p>
            <p className="mt-4">
              If your order cannot be processed or fulfilled for these reasons, a full refund process will be initiated automatically. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider text-xs">Refund Timeline</h2>
            <p>
              Once a refund is initiated from our end, please allow 5-7 business days for the amount to reflect back in your original payment method (Bank Account, UPI, or Credit/Debit Card). 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider text-xs">Personalized Items</h2>
            <p>
              Please note that jerseys customized with a custom name or number cannot be refunded or exchanged under normal circumstances, unless the item itself is defective or we are unable to fulfill the order due to stock unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider text-xs">Contact Support</h2>
            <p>
              If you have any questions regarding your refund status or if you haven't received your refund within the stipulated timeline, please reach out to our support team at <a href="mailto:support@futbolstore.com" className="text-white underline">support@futbolstore.com</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
