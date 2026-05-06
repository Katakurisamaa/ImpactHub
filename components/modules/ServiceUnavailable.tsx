"use client";

import { AlertCircle } from "lucide-react";

export default function ServiceUnavailable({
  title = "Service non disponible",
  message = "Ce service n'est pas disponible pour le moment. Veuillez nous en excuser."
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-white/5 rounded-2xl">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="text-red-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60">
        {message}
      </p>
    </div>
  );
}
