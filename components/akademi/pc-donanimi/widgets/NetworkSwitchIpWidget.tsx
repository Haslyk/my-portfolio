"use client";

import React, { useState } from 'react';
import { ValidationFeedbackItem } from '@/lib/akademi/pc-donanimi';
import {
  Network,
  Trash2,
  Activity,
  CheckCircle2,
  AlertCircle,
  Monitor,
} from 'lucide-react';

interface NetworkSwitchIpWidgetProps {
  networkConfig?: {
    mask: string;
    devices: {
      id: string;
      label: string;
      portId: string;
      portLabel: string;
      ipOptions?: string[];
    }[];
    switchPorts: { id: string; label: string }[];
  };
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const NetworkSwitchIpWidget: React.FC<NetworkSwitchIpWidgetProps> = ({
  networkConfig,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [selectedEdgeIdx, setSelectedEdgeIdx] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const connections: Array<{ from: string; to: string; type: 'wired' | 'wireless' }> =
    Array.isArray(state.connections) ? state.connections : [];
  const pc1Ip: string = state.pc1Ip || '';
  const pc2Ip: string = state.pc2Ip || '';

  const mask = networkConfig?.mask || '255.255.255.0';

  const normalizePair = (a: string, b: string) => (a < b ? `${a}--${b}` : `${b}--${a}`);

  const handleClickEndpoint = (endpointId: string) => {
    if (!selectedEndpoint) {
      setSelectedEndpoint(endpointId);
      return;
    }

    // Prevent self-connection
    if (selectedEndpoint === endpointId) {
      setSelectedEndpoint(null);
      return;
    }

    // Prevent duplicate of same edge
    const targetPair = normalizePair(selectedEndpoint, endpointId);
    const alreadyExists = connections.some(
      (c) => normalizePair(c.from, c.to) === targetPair
    );
    if (alreadyExists) {
      setSelectedEndpoint(null);
      return;
    }

    onChangeState({
      ...state,
      connections: [
        ...connections,
        { from: selectedEndpoint, to: endpointId, type: 'wired' },
      ],
    });
    setSelectedEndpoint(null);
    setSelectedEdgeIdx(null);
    setTestResult(null);
  };

  const handleDeleteSelectedEdge = () => {
    if (selectedEdgeIdx === null) return;
    const next = connections.filter((_, idx) => idx !== selectedEdgeIdx);
    onChangeState({
      ...state,
      connections: next,
    });
    setSelectedEdgeIdx(null);
    setTestResult(null);
  };

  const handleTestConnection = () => {
    // Local pedagogical check for Bağlantıyı Test Et button
    if (connections.length < 2) {
      setTestResult({
        ok: false,
        message:
          'Bağlantı testi başarısız: Önce PC1 ve PC2 ağ portlarını switch üzerindeki iki ayrı porta kabloyla bağlamalısın.',
      });
      return;
    }

    if (!pc1Ip || !pc2Ip) {
      setTestResult({
        ok: false,
        message: 'Lütfen hem PC1 hem de PC2 için listeden birer IP adresi seçin.',
      });
      return;
    }

    if (pc1Ip === pc2Ip) {
      setTestResult({
        ok: false,
        message:
          'Adres çakışması! PC1 ve PC2 için aynı IP adresi (192.168.1.10) seçilmiş. Bu örnek yerel ağda cihazların konuşabilmesi için PC2’ye farklı olan 192.168.1.11 adresini seçin.',
      });
      return;
    }

    // Check if both PCs are connected to distinct switch ports
    const usedPorts = new Map<string, number>();
    connections.forEach((c) => {
      usedPorts.set(c.from, (usedPorts.get(c.from) || 0) + 1);
      usedPorts.set(c.to, (usedPorts.get(c.to) || 0) + 1);
    });
    const reused = Array.from(usedPorts.values()).some((cnt) => cnt > 1);
    if (reused || connections.length !== 2) {
      setTestResult({
        ok: false,
        message:
          'Kablo bağlantısını kontrol edin: Her bilgisayar switch üzerinde ayrı bir porta bağlanmalı ve fazladan bağlantı olmamalıdır.',
      });
      return;
    }

    setTestResult({
      ok: true,
      message:
        'Yerel Bağlantı Testi Başarılı! (Eğitim modeli): PC1 (192.168.1.10) ve PC2 (192.168.1.11) switch üzerinden birbirine veri paketi gönderebiliyor. Şimdi "Kontrol Et"e basarak etkinliği tamamlayabilirsin.',
    });
    onChangeState({
      ...state,
      testedSuccessfully: true,
    });
  };

  const endpointCoordinates: Record<string, { x: number; y: number; label: string }> = {
    pc1_eth0: { x: 135, y: 175, label: 'PC1 Ağ Portu' },
    pc2_eth0: { x: 545, y: 175, label: 'PC2 Ağ Portu' },
    sw_port1: { x: 295, y: 95, label: 'Switch Port 1' },
    sw_port2: { x: 385, y: 95, label: 'Switch Port 2' },
  };

  return (
    <div className="space-y-5">
      {/* Toolbar & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-1 bg-[#F5A000] inline-block rounded" />
            <span>Düz Çizgi: Kablolu Ağ Bağlantısı</span>
          </span>
          <span className="inline-flex items-center gap-2 text-slate-500">
            <span className="w-6 h-0.5 border-b-2 border-dashed border-slate-400 inline-block" />
            <span>Kesik Çizgi: Kablosuz (Bu görevde kablolu kullanılır)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-purple-800 text-white text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Bağlantıyı Test Et</span>
          </button>

          <button
            type="button"
            disabled={selectedEdgeIdx === null}
            onClick={handleDeleteSelectedEdge}
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
      </div>

      {/* Test Connection Result Banner */}
      {testResult && (
        <div
          role="status"
          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-xs sm:text-sm font-semibold ${
            testResult.ok
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
              : 'bg-amber-50 border-[#F5A000] text-amber-950'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Fixed-position Network Topology SVG */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-600 mb-2">
          {selectedEndpoint
            ? `Seçili Port: ${endpointCoordinates[selectedEndpoint]?.label} → Bağlamak istediğiniz ikinci porta tıklayın.`
            : 'Bir porta tıklayıp ardından hedef porta tıklayarak kablolu bağlantı kurun.'}
        </div>

        <svg
          viewBox="0 0 680 260"
          className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 select-none"
          role="img"
          aria-label="PC1, Switch ve PC2 yerel ağ bağlantı şeması"
        >
          {/* Drawn Edges */}
          {connections.map((edge, idx) => {
            const p1 = endpointCoordinates[edge.from];
            const p2 = endpointCoordinates[edge.to];
            if (!p1 || !p2) return null;
            const isSelected = selectedEdgeIdx === idx;

            return (
              <g
                key={`${edge.from}-${edge.to}-${idx}`}
                onClick={() =>
                  setSelectedEdgeIdx((prev) => (prev === idx ? null : idx))
                }
                className="cursor-pointer"
              >
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="18"
                />
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSelected ? '#EF4444' : '#F5A000'}
                  strokeWidth={isSelected ? '5' : '3.5'}
                  strokeDasharray={edge.type === 'wireless' ? '6 6' : undefined}
                />
                {/* Educational Packet Dot Animation when test succeeded */}
                {testResult?.ok && (
                  <circle
                    cx={(p1.x + p2.x) / 2}
                    cy={(p1.y + p2.y) / 2}
                    r="6"
                    fill="#4ADE80"
                  />
                )}
              </g>
            );
          })}

          {/* Switch Box (Top Center) */}
          <g>
            <rect
              x="230"
              y="22"
              width="220"
              height="95"
              rx="12"
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="2.5"
            />
            <text x="340" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
              Ağ Anahtarı (Switch)
            </text>

            {/* Switch Port 1 */}
            <g
              onClick={() => handleClickEndpoint('sw_port1')}
              className="cursor-pointer"
            >
              <rect
                x="250"
                y="62"
                width="82"
                height="42"
                rx="8"
                fill={selectedEndpoint === 'sw_port1' ? '#F5A000' : '#0F172A'}
                stroke="#F5A000"
                strokeWidth="2"
              />
              <text
                x="291"
                y="87"
                textAnchor="middle"
                fill={selectedEndpoint === 'sw_port1' ? '#1E1B38' : '#FFFFFF'}
                fontSize="11"
                fontWeight="bold"
              >
                1. Port
              </text>
            </g>

            {/* Switch Port 2 */}
            <g
              onClick={() => handleClickEndpoint('sw_port2')}
              className="cursor-pointer"
            >
              <rect
                x="348"
                y="62"
                width="82"
                height="42"
                rx="8"
                fill={selectedEndpoint === 'sw_port2' ? '#F5A000' : '#0F172A'}
                stroke="#F5A000"
                strokeWidth="2"
              />
              <text
                x="389"
                y="87"
                textAnchor="middle"
                fill={selectedEndpoint === 'sw_port2' ? '#1E1B38' : '#FFFFFF'}
                fontSize="11"
                fontWeight="bold"
              >
                2. Port
              </text>
            </g>
          </g>

          {/* PC1 Box (Bottom Left) */}
          <g>
            <rect
              x="35"
              y="135"
              width="200"
              height="105"
              rx="12"
              fill="#1E3A5F"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />
            <text x="135" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
              PC1 ({pc1Ip || 'IP Seçilmedi'})
            </text>
            <g
              onClick={() => handleClickEndpoint('pc1_eth0')}
              className="cursor-pointer"
            >
              <rect
                x="70"
                y="174"
                width="130"
                height="44"
                rx="8"
                fill={selectedEndpoint === 'pc1_eth0' ? '#F5A000' : '#0F172A'}
                stroke="#F5A000"
                strokeWidth="2"
              />
              <text
                x="135"
                y="200"
                textAnchor="middle"
                fill={selectedEndpoint === 'pc1_eth0' ? '#1E1B38' : '#FFFFFF'}
                fontSize="11.5"
                fontWeight="bold"
              >
                PC1 Ağ Portu
              </text>
            </g>
          </g>

          {/* PC2 Box (Bottom Right) */}
          <g>
            <rect
              x="445"
              y="135"
              width="200"
              height="105"
              rx="12"
              fill="#3B0764"
              stroke="#C084FC"
              strokeWidth="2.5"
            />
            <text x="545" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
              PC2 ({pc2Ip || 'IP Seçilmedi'})
            </text>
            <g
              onClick={() => handleClickEndpoint('pc2_eth0')}
              className="cursor-pointer"
            >
              <rect
                x="480"
                y="174"
                width="130"
                height="44"
                rx="8"
                fill={selectedEndpoint === 'pc2_eth0' ? '#F5A000' : '#0F172A'}
                stroke="#F5A000"
                strokeWidth="2"
              />
              <text
                x="545"
                y="200"
                textAnchor="middle"
                fill={selectedEndpoint === 'pc2_eth0' ? '#1E1B38' : '#FFFFFF'}
                fontSize="11.5"
                fontWeight="bold"
              >
                PC2 Ağ Portu
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* IP Selection & Quick Cable Controls (Mobile & Keyboard Accessible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC1 Configuration Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Monitor className="w-5 h-5 text-sky-700" />
              <span>PC1 Ağ ve IP Ayarları</span>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              Maske: {mask} (Sabit)
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5">
              1. PC1 Kablo Bağlantısı:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sw_port1', label: 'Switch 1. Porta Bağla' },
                { id: 'sw_port2', label: 'Switch 2. Porta Bağla' },
              ].map((sw) => {
                const active = connections.some(
                  (c) =>
                    (c.from === 'pc1_eth0' && c.to === sw.id) ||
                    (c.to === 'pc1_eth0' && c.from === sw.id)
                );
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => {
                      const withoutPc1 = connections.filter(
                        (c) => c.from !== 'pc1_eth0' && c.to !== 'pc1_eth0'
                      );
                      onChangeState({
                        ...state,
                        connections: [
                          ...withoutPc1,
                          { from: 'pc1_eth0', to: sw.id, type: 'wired' },
                        ],
                      });
                      setTestResult(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${
                      active
                        ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {active ? `✓ ${sw.label}` : sw.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5">
              2. PC1 IP Adresi Listesi:
            </div>
            <div className="flex flex-wrap gap-2">
              {['192.168.1.10'].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => {
                    onChangeState({
                      ...state,
                      pc1Ip: ip,
                    });
                    setTestResult(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold border-2 transition ${
                    pc1Ip === ip
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  {pc1Ip === ip ? `✓ ${ip}` : ip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PC2 Configuration Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Network className="w-5 h-5 text-purple-700" />
              <span>PC2 Ağ ve IP Ayarları</span>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              Maske: {mask} (Sabit)
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5">
              1. PC2 Kablo Bağlantısı:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sw_port1', label: 'Switch 1. Porta Bağla' },
                { id: 'sw_port2', label: 'Switch 2. Porta Bağla' },
              ].map((sw) => {
                const active = connections.some(
                  (c) =>
                    (c.from === 'pc2_eth0' && c.to === sw.id) ||
                    (c.to === 'pc2_eth0' && c.from === sw.id)
                );
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => {
                      const withoutPc2 = connections.filter(
                        (c) => c.from !== 'pc2_eth0' && c.to !== 'pc2_eth0'
                      );
                      onChangeState({
                        ...state,
                        connections: [
                          ...withoutPc2,
                          { from: 'pc2_eth0', to: sw.id, type: 'wired' },
                        ],
                      });
                      setTestResult(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${
                      active
                        ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {active ? `✓ ${sw.label}` : sw.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5">
              2. PC2 IP Adresi Listesi (PC1’den farklı olanı seçin):
            </div>
            <div className="flex flex-wrap gap-2">
              {['192.168.1.10', '192.168.1.11'].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => {
                    onChangeState({
                      ...state,
                      pc2Ip: ip,
                    });
                    setTestResult(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold border-2 transition ${
                    pc2Ip === ip
                      ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  {pc2Ip === ip ? `✓ ${ip}` : ip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Edges List with Individual Delete */}
      {connections.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Kurulan Kablo Bağlantıları (Silmek için çizgiyi seçip Bağlantıyı Sil düğmesine basabilirsiniz):
          </div>
          <div className="flex flex-wrap gap-2">
            {connections.map((conn, idx) => (
              <div
                key={`${conn.from}-${conn.to}-${idx}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold"
              >
                <span>
                  {endpointCoordinates[conn.from]?.label || conn.from} ↔{' '}
                  {endpointCoordinates[conn.to]?.label || conn.to}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = connections.filter((_, i) => i !== idx);
                    onChangeState({ ...state, connections: next });
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedbackItems && feedbackItems.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-2">
          {feedbackItems.map((fb) => (
            <div
              key={fb.itemId}
              className={`flex items-start gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                fb.correct
                  ? 'bg-emerald-50 text-emerald-950'
                  : 'bg-amber-50 text-amber-950'
              }`}
            >
              {fb.correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              )}
              <span>{fb.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
