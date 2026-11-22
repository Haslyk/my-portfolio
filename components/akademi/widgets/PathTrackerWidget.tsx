"use client";
import React, { useState } from 'react';
import {
  ActivityPublicConfig,
  NetworkNodePublic,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Cloud
} from 'lucide-react';

interface PathSelectorSubProps {
  missionId: string;
  title: string;
  description: string;
  nodes: NetworkNodePublic[];
  selectedPath: string[];
  onPathChange: (nextPath: string[]) => void;
  feedback?: ValidationFeedbackItem;
}

export const OrderedPathSelector: React.FC<PathSelectorSubProps> = ({
  title,
  description,
  nodes,
  selectedPath,
  onPathChange,
  feedback
}) => {
  const handleToggleNode = (nodeId: string) => {
    // Do not include decorative cloud in required device sequence if clicked, or allow toggling
    const existingIdx = selectedPath.indexOf(nodeId);
    if (existingIdx !== -1) {
      // Remove from this point onwards or remove just this node
      onPathChange(selectedPath.filter((id) => id !== nodeId));
    } else {
      onPathChange([...selectedPath, nodeId]);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 transition-all ${
        feedback
          ? feedback.isCorrect
            ? 'border-emerald-500'
            : 'border-amber-500'
          : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-extrabold text-brand-navy text-base sm:text-lg">
            {title}
          </h4>
          <p className="text-sm text-slate-600 mt-0.5">{description}</p>
        </div>
        {selectedPath.length > 0 && (
          <button
            type="button"
            onClick={() => onPathChange([])}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bu Yolu Temizle</span>
          </button>
        )}
      </div>

      {/* Clickable Device Buttons */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        {nodes
          .filter((n) => n.deviceType !== 'cloud')
          .map((node) => {
            const stepIndex = selectedPath.indexOf(node.id);
            const isSelected = stepIndex !== -1;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleToggleNode(node.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-brand-orange text-brand-navy font-extrabold text-xs flex items-center justify-center">
                    {stepIndex + 1}
                  </span>
                )}
                <span>{node.label}</span>
              </button>
            );
          })}
      </div>

      {/* Selected Path Breadcrumb */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          SeÃ§tiÄŸin Yol SÄ±ralamasÄ±:
        </div>
        {selectedPath.length === 0 ? (
          <p className="text-sm text-slate-500 font-medium">
            HenÃ¼z cihaz seÃ§ilmedi. YukarÄ±daki cihaz dÃ¼ÄŸmelerine paketin
            izleyeceÄŸi sÄ±rayla tÄ±kla.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {selectedPath.map((nodeId, idx) => {
              const node = nodes.find((n) => n.id === nodeId);
              return (
                <React.Fragment key={`${nodeId}_${idx}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs sm:text-sm font-extrabold">
                    <span>
                      {idx + 1}. {node?.label || nodeId}
                    </span>
                  </span>
                  {idx < selectedPath.length - 1 && (
                    <ArrowRight
                      className="w-4 h-4 text-slate-500"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-sm font-semibold ${
            feedback.isCorrect
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-amber-50 text-amber-950 border border-amber-300'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export const PathTrackerWidget: React.FC<{
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}> = ({ config, state, onChange, feedbackItems }) => {
  const pt = config.pathTracker;
  const [activeMissionId, setActiveMissionId] = useState<string>('local_path');
  if (!pt) return null;

  const paths: Record<string, string[]> =
    state.paths && typeof state.paths === 'object' ? state.paths : {};

  const activePath = Array.isArray(paths[activeMissionId])
    ? paths[activeMissionId]
    : [];

  return (
    <div className="space-y-6">
      {/* Reference Topology SVG with simplified WAN Cloud */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs sm:text-sm font-extrabold text-brand-navy">
            Referans AÄŸ ÅemasÄ± (DiÄŸer aÄŸlar sadeleÅŸtirilmiÅŸ bulutla gÃ¶sterilmiÅŸtir)
          </span>
          <div className="flex items-center gap-2">
            {pt.missions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMissionId(m.id)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                  activeMissionId === m.id
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Åemada GÃ¶ster: {m.id === 'local_path' ? '1. Yerel Yol' : '2. DÄ±ÅŸ AÄŸ Yolu'}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox="0 0 700 260"
          className="w-full h-auto bg-slate-900 rounded-xl border border-slate-700"
          role="img"
          aria-label="Yerel aÄŸ ve dÄ±ÅŸ aÄŸ topolojisi"
        >
          {/* LAN Zone Box */}
          <rect
            x="15"
            y="20"
            width="315"
            height="220"
            rx="14"
            fill="#1E293B"
            stroke="#475569"
            strokeDasharray="6 4"
          />
          <text
            x="30"
            y="42"
            fill="#94A3B8"
            fontSize="11"
            fontWeight="bold"
          >
            YEREL AÄ (LAN - 192.168.1.0/24)
          </text>

          {/* Connections */}
          <line
            x1="130"
            y1="105"
            x2="200"
            y2="105"
            stroke={
              activePath.includes('pc') && activePath.includes('switch')
                ? '#F5A000'
                : '#64748B'
            }
            strokeWidth="4"
          />
          <line
            x1="255"
            y1="135"
            x2="255"
            y2="170"
            stroke={
              activePath.includes('switch') && activePath.includes('printer')
                ? '#10B981'
                : '#64748B'
            }
            strokeWidth="4"
          />
          <line
            x1="310"
            y1="105"
            x2="370"
            y2="105"
            stroke={
              activePath.includes('switch') && activePath.includes('router')
                ? '#F5A000'
                : '#64748B'
            }
            strokeWidth="4"
          />
          <line
            x1="485"
            y1="105"
            x2="585"
            y2="105"
            stroke={
              activePath.includes('router') &&
              activePath.includes('remote_server')
                ? '#F5A000'
                : '#64748B'
            }
            strokeWidth="4"
            strokeDasharray="7 5"
          />

          {/* PC */}
          <g transform="translate(30, 72)">
            <rect
              x="0"
              y="0"
              width="100"
              height="65"
              rx="10"
              fill={activePath.includes('pc') ? '#6D28D9' : '#1E1B38'}
              stroke="#F5A000"
              strokeWidth="2.5"
            />
            <text
              x="50"
              y="28"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              Bilgisayar
            </text>
            <text x="50" y="46" textAnchor="middle" fill="#FDE68A" fontSize="10">
              192.168.1.10
            </text>
          </g>

          {/* Switch */}
          <g transform="translate(200, 75)">
            <rect
              x="0"
              y="0"
              width="110"
              height="60"
              rx="10"
              fill={activePath.includes('switch') ? '#6D28D9' : '#334155'}
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />
            <text
              x="55"
              y="34"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Switch
            </text>
          </g>

          {/* Printer */}
          <g transform="translate(195, 170)">
            <rect
              x="0"
              y="0"
              width="120"
              height="55"
              rx="10"
              fill={activePath.includes('printer') ? '#059669' : '#1E1B38'}
              stroke="#10B981"
              strokeWidth="2.5"
            />
            <text
              x="60"
              y="24"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              Yerel YazÄ±cÄ±
            </text>
            <text x="60" y="42" textAnchor="middle" fill="#A7F3D0" fontSize="10">
              192.168.1.20
            </text>
          </g>

          {/* Router */}
          <g transform="translate(370, 72)">
            <rect
              x="0"
              y="0"
              width="115"
              height="65"
              rx="10"
              fill={activePath.includes('router') ? '#6D28D9' : '#1E1B38'}
              stroke="#F5A000"
              strokeWidth="2.5"
            />
            <text
              x="57"
              y="28"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              YÃ¶nlendirici
            </text>
            <text x="57" y="46" textAnchor="middle" fill="#DDD6FE" fontSize="10">
              GeÃ§it: 192.168.1.1
            </text>
          </g>

          {/* Simplified Other Networks Cloud */}
          <g transform="translate(495, 42)">
            <ellipse
              cx="42"
              cy="20"
              rx="42"
              ry="18"
              fill="#334155"
              stroke="#94A3B8"
              strokeDasharray="4 3"
            />
            <text
              x="42"
              y="24"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="10"
              fontWeight="bold"
            >
              DiÄŸer AÄŸlar (Bulut)
            </text>
          </g>

          {/* Remote Server */}
          <g transform="translate(585, 72)">
            <rect
              x="0"
              y="0"
              width="100"
              height="65"
              rx="10"
              fill={
                activePath.includes('remote_server') ? '#6D28D9' : '#1E1B38'
              }
              stroke="#F5A000"
              strokeWidth="2.5"
            />
            <text
              x="50"
              y="28"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              Uzak Sunucu
            </text>
            <text x="50" y="46" textAnchor="middle" fill="#FDE68A" fontSize="10">
              DÄ±ÅŸ AÄŸ
            </text>
          </g>
        </svg>
      </div>

      {/* Mission Selectors */}
      <div className="space-y-4">
        {pt.missions.map((mission) => (
          <OrderedPathSelector
            key={mission.id}
            missionId={mission.id}
            title={mission.title}
            description={mission.description}
            nodes={pt.nodes}
            selectedPath={
              Array.isArray(paths[mission.id]) ? paths[mission.id] : []
            }
            onPathChange={(nextPath) => {
              setActiveMissionId(mission.id);
              onChange({
                ...state,
                paths: {
                  ...paths,
                  [mission.id]: nextPath
                }
              });
            }}
            feedback={feedbackItems.find((f) => f.fieldId === mission.id)}
          />
        ))}
      </div>
    </div>
  );
};

