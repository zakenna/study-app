import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import TipsFlashcards from "./TipsPage.Flashcards";
import TipsList from "./TipsPage.List";

/** 꿀팁 모음: 목록(검색·필터·연결 문제) ↔ 🎴 암기 카드 모드 */
function TipsPage() {
  const [mode, setMode] = useState<"list" | "cards">("list");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {mode === "list" ? (
          <TipsList onStartCards={() => setMode("cards")} />
        ) : (
          <TipsFlashcards onExit={() => setMode("list")} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default TipsPage;
