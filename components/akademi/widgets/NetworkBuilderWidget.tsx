"use client";

import React, { useState, useEffect } from 'react';
import {
  ActivityPublicConfig,
  NetworkEdgeDraft,
  NetworkNodePublic,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  Cable,
  Wifi,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface NetworkBuilderProps {
  config?: ActivityPublicConfig;
  nodes?: NetworkNodePublic[];
  allowedConnectionTypes?: ('wired' | 'wireless')[];
  defaultConnectionType?: 'wired' | 'wireless';
  helperNote?: string;
  edges: NetworkEdgeDraft[];
  onEdgesChange: (nextEdges: NetworkEdgeDraft[]) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const NetworkBuilderCanvas: React.FC<NetworkBuilderProps> = ({
  nodes = [],
  allowedConnectionTypes = ['wired'],
  defaultConnectionType = 'wired',
  helperNote,
  edges,
  onEdgesChange,
  feedbackItems
}) => {
  const [selectedFirstNodeId, setSelectedFirstNodeId] = useState<string | null>(
    null
  );
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(
    null
  );
  const [connectionMode, setConnectionMode] = useState<'wired' | 'wireless'>(
    defaultConnectionType
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoords = (node: NetworkNodePublic) => {
    if (isMobileView) {
      return { x: node.mobileX, y: node.mobileY };
    }
    return { x: node.x, y: node.y };
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedEdgeIndex(null);
    setStatusNotice(null);

    if (!selectedFirstNodeId) {
      setSelectedFirstNodeId(nodeId);
      return;
    }

    if (selectedFirstNodeId === nodeId) {
      setStatusNotice('Bir cihazı kendi kendisine bağlayamazsın. Seçim iptal edildi.');
      setSelectedFirstNodeId(null);
      return;
    }

    // Check if an edge between these two nodes already exists
    const [a, b] = [selectedFirstNodeId, nodeId].sort();
    const existsIndex = edges.findIndex((e) => {
      const [ea, eb] = [e.from, e.to].sort();
      return ea === a && eb === b;
    });

    if (existsIndex !== -1) {
      setStatusNotice(
        'Bu iki cihaz arasında zaten bir bağlantı var. Türünü değiştirmek istersen önce mevcut çizgiyi seçip silebilirsin.'
      );
      setSelectedFirstNodeId(null);
      return;
    }

    const nextEdges: NetworkEdgeDraft[] = [
      ...edges,
      {
        from: selectedFirstNodeId,
        to: nodeId,
        connectionType: connectionMode
      }
    ];
    onEdgesChange(nextEdges);
    setSelectedFirstNodeId(null);
  };

  const handleDeleteEdge = (indexToRemove: number) => {
    const nextEdges = edges.filter((_, idx) => idx !== indexToRemove);
    onEdgesChange(nextEdges);
    setSelectedEdgeIndex(null);
  };

  const firstNodeObj = nodes.find((n) => n.id === selectedFirstNodeId);

  return (
    <div className="space-y-4">
      {helperNote && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-sm text-blue-950 font-medium">
          <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{helperNote}</span>
        </div>
      )}

      {/* Connection Type & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-brand-navy">
            Bağlantı Türü:
          </span>
          {allowedConnectionTypes.includes('wired') && (
            <button
              type="button"
              onClick={() => setConnectionMode('wired')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold border-2 transition-all ${
                connectionMode === 'wired'
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Cable className="w-4 h-4" aria-hidden="true" />
              <span>Kablolu (Düz Çizgi)</span>
            </button>
          )}
          {allowedConnectionTypes.includes('wireless') && (
            <button
              type="button"
              onClick={() => setConnectionMode('wireless')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold border-2 transition-all ${
                connectionMode === 'wireless'
                  ? 'bg-brand-purple text-white border-brand-purple'
                  : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Wifi className="w-4 h-4" aria-hidden="true" />
              <span>Kablosuz / Wi-Fi (Kesik Çizgi)</span>
            </button>
          )}
        </div>

        {/* Active selection prompt or delete edge button */}
        <div className="flex items-center gap-2">
          {firstNodeObj && (
            <div className="flex items-center gap-2 bg-purple-100 text-brand-purple px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border border-purple-300">
              <span>
                1. Cihaz: <strong>{firstNodeObj.label}</strong> → Şimdi bağlamak
                istediğin 2. cihaza tıkla
              </span>
              <button
                type="button"
                onClick={() => setSelectedFirstNodeId(null)}
                className="underline ml-1 text-xs font-extrabold"
              >
                İptal
              </button>
            </div>
          )}

          {selectedEdgeIndex !== null && edges[selectedEdgeIndex] && (
            <button
              type="button"
              onClick={() => handleDeleteEdge(selectedEdgeIndex)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-extrabold shadow-sm"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Seçili Bağlantıyı Sil</span>
            </button>
          )}
        </div>
      </div>

      {statusNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
          {statusNotice}
        </div>
      )}

      {/* Interactive SVG Network Diagram (Responsive: Desktop 700x410, Mobile vertical 360x530) */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3 shadow-inner">
        <svg
          viewBox={isMobileView ? '0 0 360 530' : '0 0 700 410'}
          className="w-full h-auto select-none"
          role="region"
          aria-label="Ağ Bağlantı Şeması"
        >
          {/* Background subtle grid */}
          <rect
            x="0"
            y="0"
            width={isMobileView ? 360 : 700}
            height={isMobileView ? 530 : 410}
            rx="12"
            fill="#F8FAFC"
          />

          {/* Drawn Edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const p1 = getCoords(fromNode);
            const p2 = getCoords(toNode);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const isSelected = selectedEdgeIndex === idx;
            const isWireless = edge.connectionType === 'wireless';

            return (
              <g
                key={`${edge.from}-${edge.to}-${idx}`}
                onClick={() => {
                  setSelectedFirstNodeId(null);
                  setSelectedEdgeIndex((prev) => (prev === idx ? null : idx));
                }}
                className="cursor-pointer"
              >
                {/* Invisible wider hit line for easy touch/click */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="22"
                />
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={
                    isSelected
                      ? '#DC2626'
                      : isWireless
                      ? '#6D28D9'
                      : '#1E1B38'
                  }
                  strokeWidth={isSelected ? '6' : '4'}
                  strokeDasharray={isWireless ? '8 6' : undefined}
                />
                {/* Label badge on midpoint */}
                <rect
                  x={midX - 38}
                  y={midY - 12}
                  width="76"
                  height="24"
                  rx="6"
                  fill={
                    isSelected
                      ? '#DC2626'
                      : isWireless
                      ? '#F3E8FF'
                      : '#E2E8F0'
                  }
                  stroke={
                    isSelected
                      ? '#991B1B'
                      : isWireless
                      ? '#6D28D9'
                      : '#1E1B38'
                  }
                  strokeWidth="1.5"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={
                    isSelected
                      ? '#FFFFFF'
                      : isWireless
                      ? '#5B21B6'
                      : '#1E1B38'
                  }
                >
                  {isSelected
                    ? 'Silmek İçin'
                    : isWireless
                    ? 'Kablosuz'
                    : 'Kablolu'}
                </text>
              </g>
            );
          })}

          {/* Device Nodes */}
          {nodes.map((node) => {
            const { x, y } = getCoords(node);
            const isSelected = selectedFirstNodeId === node.id;
            const isHub =
              node.deviceType === 'switch' ||
              node.deviceType === 'router' ||
              node.deviceType === 'ap';

            return (
              <g
                key={node.id}
                transform={`translate(${x - 62}, ${y - 36})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${node.label} cihazı`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(node.id);
                  }
                }}
              >
                <rect
                  x="0"
                  y="0"
                  width="124"
                  height="72"
                  rx="14"
                  fill={
                    isSelected
                      ? '#6D28D9'
                      : isHub
                      ? '#1E1B38'
                      : '#FFFFFF'
                  }
                  stroke={
                    isSelected
                      ? '#F5A000'
                      : isHub
                      ? '#F5A000'
                      : '#1E1B38'
                  }
                  strokeWidth={isSelected ? '4' : '2.5'}
                />
                <text
                  x="62"
                  y="32"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={isSelected || isHub ? '#FFFFFF' : '#1E1B38'}
                >
                  {node.label}
                </text>
                <text
                  x="62"
                  y="52"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={
                    isSelected
                      ? '#FDE68A'
                      : isHub
                      ? '#F5A000'
                      : '#475569'
                  }
                >
                  {isSelected
                    ? 'Seçildi (1. Cihaz)'
                    : node.deviceType.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible List of Current Connections with Delete buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2.5">
          Kurulan Bağlantılar ({edges.length})
        </h4>
        {edges.length === 0 ? (
          <p className="text-sm text-slate-500">
            Henüz bağlantı kurulmadı. Şemadaki iki cihaza sırayla tıklayarak
            bağlantı ekleyebilirsin.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {edges.map((edge, idx) => {
              const fromLabel =
                nodes.find((n) => n.id === edge.from)?.label || edge.from;
              const toLabel =
                nodes.find((n) => n.id === edge.to)?.label || edge.to;
              const isWireless = edge.connectionType === 'wireless';

              return (
                <div
                  key={`${edge.from}-${edge.to}-${idx}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                >
                  <div className="flex items-center gap-2 font-bold text-brand-navy">
                    <span>
                      {fromLabel} ↔ {toLabel}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                        isWireless
                          ? 'bg-purple-100 text-brand-purple'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isWireless ? 'Kablosuz (Kesik)' : 'Kablolu (Düz)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEdge(idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Bağlantıyı Sil</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback List */}
      {feedbackItems.length > 0 && (
        <div className="space-y-2">
          {feedbackItems.map((fb) => (
            <div
              key={fb.fieldId}
              className={`flex items-start gap-2 p-3 rounded-xl text-sm font-semibold ${
                fb.isCorrect
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-amber-50 text-amber-950 border border-amber-300'
              }`}
            >
              {fb.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{fb.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NetworkBuilderWidget: React.FC<{
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}> = ({ config, state, onChange, feedbackItems }) => {
  const nb = config.networkBuilder;
  if (!nb) return null;

  const edges: NetworkEdgeDraft[] = Array.isArray(state.edges) ? state.edges : [];

  return (
    <NetworkBuilderCanvas
      nodes={nb.nodes}
      allowedConnectionTypes={nb.allowedConnectionTypes}
      defaultConnectionType={nb.defaultConnectionType}
      helperNote={nb.helperNote}
      edges={edges}
      onEdgesChange={(nextEdges) => onChange({ ...state, edges: nextEdges })}
      feedbackItems={feedbackItems}
    />
  );
};
