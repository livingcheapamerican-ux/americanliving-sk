import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Eye, MousePointer, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { sk } from "date-fns/locale";
import { formatDuration, safeFormat, getDeviceIcon, getTagColor, isSessionOnline, formatLocation } from "./sessionUtils";
import SessionDetailTabs from "./SessionDetailTabs";

export default function SessionRow({ session, title, expanded, onToggle, onOpenClickMap }) {
  const online = isSessionOnline(session);

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-colors ${expanded ? 'border-indigo-300' : 'border-slate-200'}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full text-left p-4 flex justify-between items-start gap-4 transition-colors ${expanded ? 'bg-slate-50' : 'hover:bg-slate-50/70'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-extrabold text-slate-900 text-sm truncate">
              {title || session.user_name || session.user_email || 'Anonymný návštevník'}
            </h3>
            {online && <Badge className="bg-green-600 hover:bg-green-600 text-white text-[9px] font-black">ONLINE</Badge>}
            {session.engagement_score > 70 && (
              <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[9px] font-black">ZÁUJEM {session.engagement_score}</Badge>
            )}
            {session.session_tags?.map(tag => (
              <Badge key={tag} className={`text-[9px] font-bold hover:opacity-90 ${getTagColor(tag)}`}>{tag}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] text-slate-600 font-bold mt-2">
            <span className="flex items-center gap-1 truncate"><Clock className="w-3.5 h-3.5 text-slate-400" />{safeFormat(session.start_time, 'dd.MM. HH:mm', { locale: sk })}</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-slate-400" />{formatDuration(session.duration_seconds)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" />{session.pages_visited?.length || 0} strán</span>
            <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5 text-slate-400" />{session.clicks?.length || 0} klikov</span>
            <span className="flex items-center gap-1 capitalize">
              {getDeviceIcon(session.device_info?.device_type)}
              {session.device_info?.device_type || 'desktop'}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {formatLocation(session.location_info)}
            </span>
          </div>
        </div>
        <span className="text-slate-400 shrink-0 mt-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {expanded && (
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <SessionDetailTabs session={session} onOpenClickMap={onOpenClickMap} />
        </div>
      )}
    </div>
  );
}