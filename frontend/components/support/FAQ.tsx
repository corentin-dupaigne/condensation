"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How do I redeem a game key?",
    answer:
      "After purchasing, your key will appear in your order history. Copy the key, then open the relevant platform (Steam, Epic, GOG, etc.), go to \"Activate a Product\" or \"Redeem Code,\" and paste your key. The game will be added to your library instantly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, PayPal, Apple Pay, Google Pay, and select cryptocurrencies (BTC, ETH). All transactions are secured with 256-bit SSL encryption.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If your key has not been redeemed, you can request a full refund within 14 days of purchase. Redeemed keys are non-refundable per our digital goods policy. To start a refund, go to My Orders and click \"Request Refund\" on the relevant order.",
  },
  {
    question: "Why is my key not working?",
    answer:
      "First, double-check that you're activating it on the correct platform (e.g., Steam vs. Epic). Ensure there are no extra spaces when pasting. If the issue persists, check if the game has regional restrictions. Contact support with your order number if the problem continues.",
  },
  {
    question: "Are the game keys legitimate?",
    answer:
      "Yes. All keys sold on Condensation are sourced from authorized distributors and verified sellers. Every transaction is backed by our Buyer Protection guarantee. If a key is invalid, we'll replace it or issue a full refund.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most keys are delivered instantly after payment confirmation. In rare cases, manual verification may add 5-15 minutes. You'll receive an email notification as soon as your key is ready.",
  },
  {
    question: "Do you offer region-locked keys?",
    answer:
      "Some keys may have regional restrictions set by the publisher. Region information is clearly displayed on each product page before purchase. If you're unsure, check the \"Region\" field or contact support.",
  },
  {
    question: "How do I become a seller?",
    answer:
      "Apply through our Seller Portal. You'll need to verify your identity and agree to our seller terms. Once approved, you can list game keys, set prices, and receive payouts to your preferred method.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl divide-y divide-outline-variant/20">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-on-surface">
                    {faq.question}
                  </span>
                  <svg
                    className={`shrink-0 text-on-surface-variant transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="pb-5">
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
