"use client";

import React, { useState } from 'react';
import {
  PublicCableEndpoint,
  PublicPortEndpoint,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  Cable,
} from 'lucide-react';

interface CableConnectorWidgetProps {
  cables: PublicCableEndpoint[];
  ports: PublicPortEndpoint[];
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const CableConnectorWidget: React.FC<CableConnectorWidgetProps> = ({
  cables,
  ports,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [selectedEdgeIdx, setSelectedEdgeIdx] = useState<number | null>(null);

  const connections: Array<{ from: string; to: string }> = Array.isArray(state.connections)
    ? state.connections
    : [];

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleSelectPort = (portId: string) => {
    if (!selectedCableId) return;
    // Prevent duplicate exact same edge or self edge
    if (selectedCableId === portId) return;
    const exists = connections.some(
      (c) => c.from === selectedCableId && c.to === portId
    );
    if (exists) {
      setSelectedCableId(null);
      return;
    }

    onChangeState({
      ...state,
      connections: [...connections, { from: selectedCableId, to: portId }],
    });
    setSelectedCableId(null);
    setSelectedEdgeIdx(null);
  };

  const handleDeleteSelectedConnection = () => {
    if (selectedEdgeIdx === null) return;
    const next = connections.filter((_, idx) => idx !== selectedEdgeIdx);
    onChangeState({
      ...state,
      connections: next,
    });
    setSelectedEdgeIdx(null);
  };

  const handleDeleteByIndex = (idx: number) => {
    const next = connections.filter((_, i) => i !== idx);
    onChangeState({
      ...state,
      connections: next,
    });
    if (selectedEdgeIdx === idx) setSelectedEdgeIdx(null);
  };

  // Y positions in SVG for 4 cables and 4 ports
  const getY = (index: number) => 55 + index * 68;

  return (
    <div className="space-y-5">
      {/* Top Toolbar: Instructions & Bağlantıyı Sil button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
        <div className="text-xs sm:text-sm font-semibold text-slate-700">
          {selectedCableId
            ? 'Şimdi sağdaki uygun porta tıklayarak kabloyu bağlayın.'
            : 'Önce soldaki bir kablo ucuna, ardından sağdaki uygun porta tıklayın.'}
        </div>
        <button
          type="button"
          disabled={selectedEdgeIdx === null}
          onClick={handleDeleteSelectedConnection}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            selectedEdgeIdx !== null
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Bağlantıyı Sil</span>
        </button>
      </div>

      {/* Interactive SVG Connector Board */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
        <svg
          viewBox="0 0 680 315"
          className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 select-none"
          role="img"
          aria-label="Kablo uçları ve bağlantı portları eşleştirme şeması"
        >
          {/* Connection Lines */}
          {connections.map((conn, idx) => {
            const cIdx = cables.findIndex((c) => c.id === conn.from);
            const pIdx = ports.findIndex((p) => p.id === conn.to);
            if (cIdx === -1 || pIdx === -1) return null;
            const y1 = getY(cIdx);
            const y2 = getY(pIdx);
            const isSelected = selectedEdgeIdx === idx;

            return (
              <g
                key={`${conn.from}-${conn.to}-${idx}`}
                onClick={() =>
                  setSelectedEdgeIdx((prev) => (prev === idx ? null : idx))
                }
                className="cursor-pointer"
              >
                {/* Wider invisible hit area for touch/click */}
                <line
                  x1="230"
                  y1={y1}
                  x2="450"
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="18"
                />
                <line
                  x1="230"
                  y1={y1}
                  x2="450"
                  y2={y2}
                  stroke={isSelected ? '#EF4444' : '#F5A000'}
                  strokeWidth={isSelected ? '5' : '3.5'}
                />
                <circle
                  cx={(230 + 450) / 2}
                  cy={(y1 + y2) / 2}
                  r="10"
                  fill={isSelected ? '#EF4444' : '#1E1B38'}
                  stroke="#F5A000"
                  strokeWidth="2"
                />
                <text
                  x={(230 + 450) / 2}
                  y={(y1 + y2) / 2 + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}

          {/* Left Column: 4 Cable Endpoints */}
          {cables.map((cable, idx) => {
            const cy = getY(idx);
            const isSelected = selectedCableId === cable.id;
            return (
              <g
                key={cable.id}
                onClick={() =>
                  setSelectedCableId((prev) => (prev === cable.id ? null : cable.id))
                }
                className="cursor-pointer"
              >
                <rect
                  x="16"
                  y={cy - 24}
                  width="214"
                  height="48"
                  rx="10"
                  fill={isSelected ? '#F5A000' : '#1E293B'}
                  stroke={isSelected ? '#FFFFFF' : '#64748B'}
                  strokeWidth="2.5"
                />
                {/* Technical Shape Icon inside SVG (Not color-only!) */}
                {cable.connectorShape === 'usb-a' && (
                  <rect x="26" y={cy - 10} width="26" height="20" rx="2" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.5" />
                )}
                {cable.connectorShape === 'hdmi' && (
                  <polygon
                    points={`26,${cy - 9} 52,${cy - 9} 48,${cy + 9} 30,${cy + 9}`}
                    fill="#94A3B8"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                )}
                {cable.connectorShape === 'rj45' && (
                  <g>
                    <rect x="28" y={cy - 10} width="22" height="20" rx="2" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.5" />
                    <rect x="35" y={cy - 14} width="8" height="5" fill="#CBD5E1" />
                  </g>
                )}
                {cable.connectorShape === 'jack35' && (
                  <g>
                    <rect x="26" y={cy - 4} width="14" height="8" rx="2" fill="#64748B" />
                    <line x1="40" y1={cy} x2="52" y2={cy} stroke="#E2E8F0" strokeWidth="3.5" />
                  </g>
                )}

                <text
                  x="60"
                  y={cy - 4}
                  fill={isSelected ? '#1E1B38' : '#FFFFFF'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {cable.label}
                </text>
                <text
                  x="60"
                  y={cy + 13}
                  fill={isSelected ? '#1E1B38' : '#CBD5E1'}
                  fontSize="9.5"
                >
                  {cable.sublabel}
                </text>
                <circle
                  cx="230"
                  cy={cy}
                  r="7"
                  fill={isSelected ? '#FFFFFF' : '#F5A000'}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Right Column: 4 Port Endpoints */}
          {ports.map((port, idx) => {
            const py = getY(idx);
            return (
              <g
                key={port.id}
                onClick={() => handleSelectPort(port.id)}
                className="cursor-pointer"
              >
                <rect
                  x="450"
                  y={py - 24}
                  width="214"
                  height="48"
                  rx="10"
                  fill="#1E293B"
                  stroke={selectedCableId ? '#F5A000' : '#64748B'}
                  strokeWidth="2.5"
                />
                <circle
                  cx="450"
                  cy={py}
                  r="7"
                  fill="#6D28D9"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x="468"
                  y={py - 4}
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {port.label}
                </text>
                <text
                  x="468"
                  y={py + 13}
                  fill="#CBD5E1"
                  fontSize="9.5"
                >
                  {port.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible Click/Keyboard Pairing Panel & Current Connections List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <h4 className="font-bold text-sm text-slate-900 mb-2">
            Hızlı Eşleştirme Düğmeleri (Klavye ve Dokunmatik Dostu)
          </h4>
          <div className="space-y-2.5">
            {cables.map((cable) => {
              const currentConn = connections.find((c) => c.from === cable.id);
              const fb = feedbackByItem.get(cable.id);
              return (
                <div key={cable.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-[#6D28D9]" />
                    <span>{cable.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ports.map((p) => {
                      const active = currentConn?.to === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const filtered = connections.filter((c) => c.from !== cable.id);
                            onChangeState({
                              ...state,
                              connections: [...filtered, { from: cable.id, to: p.id }],
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            active
                              ? 'bg-[#1E1B38] text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {active ? `✓ ${p.label}` : p.label}
                        </button>
                      );
                    })}
                  </div>
                  {fb && (
                    <div
                      className={`mt-2 flex items-start gap-1.5 p-2 rounded-lg text-xs font-medium ${
                        fb.correct
                          ? 'bg-emerald-100 text-emerald-950'
                          : 'bg-amber-100 text-amber-950'
                      }`}
                    >
                      {fb.correct ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <span>{fb.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Connections List with Individual Delete */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <h4 className="font-bold text-sm text-slate-900 mb-2">
            Kurulan Bağlantılar ({connections.length} / 4)
          </h4>
          {connections.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              Henüz kablo bağlantısı kurulmadı.
            </p>
          ) : (
            <div className="space-y-2">
              {connections.map((conn, idx) => {
                const cObj = cables.find((c) => c.id === conn.from);
                const pObj = ports.find((p) => p.id === conn.to);
                const isSelected = selectedEdgeIdx === idx;
                return (
                  <div
                    key={`${conn.from}-${conn.to}-${idx}`}
                    onClick={() =>
                      setSelectedEdgeIdx((prev) => (prev === idx ? null : idx))
                    }
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">
                      {idx + 1}. {cObj?.label || conn.from} → {pObj?.label || conn.to}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteByIndex(idx);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bağlantıyı Sil</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
