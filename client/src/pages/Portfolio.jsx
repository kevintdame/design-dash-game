import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

function overallOf(s) {
  return Math.round((s.value_score + s.creativity_score + s.uniqueness_score) / 3);
}

export default function Portfolio() {
  const [sessions, setSessions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("API error");
        const list = await res.json();
        setSessions(list.sort((a, b) => Number(b.id) - Number(a.id)));
      } catch (err) {
        console.error(err);
        setSessions([]);
      }
    })();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-transparent">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="h-9 w-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 shadow-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-extrabold font-display text-white">My Portfolio</h1>
        </div>

        {sessions === null ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No saved concepts yet.</p>
            <Button onClick={() => navigate("/")} className="mt-4 bg-accent text-white hover:bg-accent/90 font-bold rounded-lg px-6 h-11">
              Play a game
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                  to={`/portfolio/${s.id}`}
                  className="block rounded-3xl overflow-hidden border border-white/5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
                >
                  {/* Top Half: Dark Header displaying concept name */}
                  <div className="bg-[#1b143c] p-5 select-none text-center flex flex-col justify-center min-h-[110px]">
                    <h2 className="text-white font-display font-extrabold text-lg sm:text-xl uppercase tracking-wider leading-tight truncate">
                      {s.concept_name || "Concept Name"}
                    </h2>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">
                      {s.domain}
                    </p>
                  </div>
                  {/* Bottom Half: White Summary and Score */}
                  <div className="bg-white p-5 flex flex-col justify-between min-h-[120px] border-t border-slate-100">
                    <div>
                      <p className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed line-clamp-2">
                        {s.solution_overview}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-wider">
                        For {s.customer_name} • {s.challenge_title}
                      </p>
                    </div>
                    {/* Concept overall score display */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                      <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Overall Score</span>
                      <span className="text-accent font-display font-extrabold text-base bg-accent/10 px-3 py-0.5 rounded-full">
                        {overallOf(s)} pts
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}