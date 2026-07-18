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
        setSessions(list);
      } catch {
        setSessions([]);
      }
    })();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-transparent">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="h-9 w-9 rounded-lg bg-cyan-400 text-[#20262e] flex items-center justify-center hover:bg-cyan-300 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-extrabold font-display text-white">My Portfolio</h1>
        </div>

        {sessions === null ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No saved concepts yet.</p>
            <Button onClick={() => navigate("/")} className="mt-4 bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg">
              Play a game
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                  to={`/portfolio/${s.id}`}
                  className="block bg-card rounded-2xl p-4 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-cyan-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">{s.domain}</div>
                      <h3 className="text-card-foreground font-bold text-sm leading-snug truncate">{s.challenge_title}</h3>
                      <p className="text-slate-500 text-xs mt-1">for {s.customer_name}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-2xl font-extrabold font-display text-gradient">{overallOf(s)}</div>
                      <div className="text-slate-400 text-[10px]">score</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {(s.features || []).slice(0, 3).map((f, i) => (
                      <div key={i} className="h-10 w-10 rounded-lg bg-black/5 overflow-hidden">
                        {f.image_url && <img src={f.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    ))}
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