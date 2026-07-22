import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ConundrumStartScreen from "@/components/conundrum/ConundrumStartScreen";
import ConundrumDiscoveryScreen from "@/components/conundrum/ConundrumDiscoveryScreen";
import ConundrumPlanScreen from "@/components/conundrum/ConundrumPlanScreen";
import ConundrumOutcomeScreen from "@/components/conundrum/ConundrumOutcomeScreen";
import VibeBackground from "@/components/designGame/VibeBackground";
import conundrums from "@/data/conundrums.json";

export default function ConundrumGame() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("select"); // select | discovery | plan | outcome
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  function handleSelectScenario(scenario) {
    setSelectedScenario(scenario);
    setQuestions([]);
    setInventory(scenario.initialItems || []);
    setEvaluation(null);
    setStage("discovery");
  }

  function handleGoToPlan(qaList, currentInventory) {
    setQuestions(qaList);
    setInventory(currentInventory);
    setStage("plan");
  }

  async function handleSubmitPlan(planText) {
    try {
      const res = await fetch("/api/conundrum/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: selectedScenario,
          questions,
          plan: planText
        })
      });
      const data = await res.json();
      setEvaluation(data);
      setStage("outcome");
    } catch (err) {
      console.error("Evaluation error:", err);
    }
  }

  function handleNextScenario() {
    const currentIndex = conundrums.findIndex((c) => c.id === selectedScenario?.id);
    const nextIndex = (currentIndex + 1) % conundrums.length;
    handleSelectScenario(conundrums[nextIndex]);
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground overflow-x-hidden p-4 sm:p-6">
      <VibeBackground mode="organic" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {stage === "select" && (
            <ConundrumStartScreen
              key="select"
              onSelectScenario={handleSelectScenario}
              onBack={() => navigate("/")}
            />
          )}

          {stage === "discovery" && selectedScenario && (
            <ConundrumDiscoveryScreen
              key="discovery"
              scenario={selectedScenario}
              onGoToPlan={handleGoToPlan}
              onBack={() => setStage("select")}
            />
          )}

          {stage === "plan" && selectedScenario && (
            <ConundrumPlanScreen
              key="plan"
              scenario={selectedScenario}
              inventory={inventory}
              onSubmitPlan={handleSubmitPlan}
              onBack={() => setStage("discovery")}
            />
          )}

          {stage === "outcome" && selectedScenario && evaluation && (
            <ConundrumOutcomeScreen
              key="outcome"
              scenario={selectedScenario}
              evaluation={evaluation}
              onReplay={() => handleSelectScenario(selectedScenario)}
              onNextScenario={handleNextScenario}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
