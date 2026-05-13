"use client";

import { motion } from "framer-motion";

export function AIOrbButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="ai-orb-button"
      type="button"
      aria-label="进入 AI 对话"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
    >
      <span className="ai-orb" aria-hidden="true">
        <span className="ai-orb__container">
          <span className="ai-orb__c ai-orb__c4" />
          <span className="ai-orb__c ai-orb__c1" />
          <span className="ai-orb__c ai-orb__c2" />
          <span className="ai-orb__c ai-orb__c3" />
          <span className="ai-orb__rings" />
        </span>
        <span className="ai-orb__glass" />
      </span>
    </motion.button>
  );
}
