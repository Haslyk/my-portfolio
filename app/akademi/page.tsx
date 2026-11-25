"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Network,
  Cpu,
  Code2,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  LogOut,
  User,
  GraduationCap,
  Lock,
  Sparkles,
  Clock,
  RefreshCw
} from 'lucide-react';
import { AnimatedCanvasBackground } from '@/components/animated-canvas-background';
import {
  AKADEMI_COURSES_CATALOG,
  CourseCatalogItem
} from '@/lib/akademi/shared';
import {
  ApiError,
  apiRequest,
  clearAllClientDraftsAndCache
} from '@/lib/akademi/apiClient';

interface StudentSessionInfo {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  classLevel?: number;
  section?: string;
  approvalStatus?: string;
  visibleCourses: string[];
}

export default function AkademiPortalPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSessionInfo | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [classLevel, setClassLevel] = useState<number>(2);
  const [section, setSection] = useState<'A' | 'B'>('A');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMismatchError, setIsMismatchError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  const refreshApprovalStatus = async () => {
    setCheckingApproval(true);
    try {
      const res = await apiRequest<{ student: StudentSessionInfo }>(
        '/api/akademi/student/me'
      );
      setStudent(res.student);
    } catch {
      // If rejected and deleted by admin, log out to join screen
      setStudent(null);
    } finally {
      setCheckingApproval(false);
    }
  };

  useEffect(() => {
    if (!student || student.approvalStatus === 'APPROVED') return;
    const timer = setInterval(() => {
      refreshApprovalStatus();
    }, 10000);
    return () => clearInterval(timer);
  }, [student]);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const res = await apiRequest<{ student: StudentSessionInfo }>(
          '/api/akademi/student/me'
        );
        if (mounted) {
          setStudent(res.student);
          sessionStorage.setItem(
            'ag_atolyem_active_student_id',
            res.student.id
          );
        }
      } catch {
        if (mounted) setStudent(null);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNumberChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '');
    setStudentNumber(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsMismatchError(false);
    setIsLoading(true);

    try {
      const res = await apiRequest<{
        student: StudentSessionInfo;
      }>('/api/akademi/student/join', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          studentNumber,
          classLevel,
          section
        })
      });

      const lastStudentId = sessionStorage.getItem(
        'ag_atolyem_active_student_id'
      );
      if (lastStudentId && lastStudentId !== res.student.id) {
        clearAllClientDraftsAndCache();
      }
      sessionStorage.setItem('ag_atolyem_active_student_id', res.student.id);

      setStudent(res.student);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
        if (err.code === 'STUDENT_NUMBER_NAME_MISMATCH') {
          setIsMismatchError(true);
        }
      } else {
        setErrorMsg(
          'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/akademi/student/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAllClientDraftsAndCache();
      setStudent(null);
      setFirstName('');
      setLastName('');
      setStudentNumber('');
    }
  };

  const getCourseIcon = (code: CourseCatalogItem['code']) => {
    switch (code) {
      case 'ag-temelleri':
        return <Network className="w-7 h-7 text-teal-400" />;
      case 'pc-donanimi':
        return <Cpu className="w-7 h-7 text-cyan-400" />;
      case 'gorsel-programlama':
        return <Code2 className="w-7 h-7 text-sky-400" />;
    }
  };

  if (checkingSession) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-slate-100">
        <AnimatedCanvasBackground />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
          <p className="text-sm font-mono tracking-wider text-slate-300">
            HALİM AKADEMİ YÜKLENİYOR...
          </p>
        </div>
      </div>
    );
  }

  const allowedSet = new Set(student?.visibleCourses || []);
  const visibleCatalog = AKADEMI_COURSES_CATALOG.filter((c) =>
    allowedSet.has(c.code)
  );

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-teal-500/30 selection:text-teal-200 text-slate-100 overflow-hidden">
      <AnimatedCanvasBackground />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 flex items-center justify-center font-extrabold shadow-[0_0_25px_rgba(45,212,191,0.3)]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Halimaslyk Akademi
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                DERS PORTALI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              halimasliyuksek.com/akademi · Etkileşimli Ders ve Laboratuvar
              Sistemi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {student && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md text-xs sm:text-sm">
              <User className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-white">
                {student.firstName} {student.lastName}
              </span>
              <span className="font-mono text-xs text-slate-400">
                ({student.studentNumber})
              </span>
              {student.classLevel && student.section && (
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-[11px]">
                  {student.classLevel}-{student.section}
                </span>
              )}
            </div>
          )}

          {student && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10 flex-1 flex items-center justify-center">
        {!student ? (
          /* STEP 1: Student Identification Form (Ad, Soyad, Okul Numarası) */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Info Section */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Adım 1: Öğrenci Girişi → Adım 2: Ders Seçimi</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ders Panellerine ve Uygulama Atölyelerine Katıl
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Ders anlatımlarına paralel olarak hazırlanan haftalık
                simülasyonlara, ağ ve donanım laboratuvarlarına ve değerlendirme
                modüllerine erişmek için ad, soyad ve öğrenci numaranla giriş
                yap.
              </p>

              <ul className="space-y-3 text-sm text-slate-300 pt-2">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>
                    E-posta veya şifre gerekmez; okul numaranla tüm
                    çalışmaların otomatik kaydedilir.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>
                    Giriş yaptıktan sonra adına tanımlı dersleri seçerek ilgili
                    eğitim paneline geçebilirsin.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>
                    Tekrar giriş yaptığında kaldığın haftadan ve etkinlikten
                    devam edersin.
                  </span>
                </li>
              </ul>
            </div>

            {/* Right Login Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-slate-900/80 border border-white/[0.12] backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
                  Öğrenci Girişi
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mb-6">
                  Bilgilerini girerek ders seçim ekranına ilerle.
                </p>

                {errorMsg && (
                  <div
                    role="alert"
                    className={`mb-5 p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-medium ${
                      isMismatchError
                        ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                        : 'bg-red-950/70 border-red-500/60 text-red-200'
                    }`}
                  >
                    {isMismatchError ? (
                      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold mb-0.5">
                        {isMismatchError
                          ? 'Bilgi Uyuşmazlığı Tespit Edildi'
                          : 'Giriş Yapılamadı'}
                      </div>
                      <div>{errorMsg}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5"
                    >
                      Ad
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      autoComplete="given-name"
                      placeholder="Örn: Ayşe"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-sm sm:text-base font-medium text-white placeholder:text-slate-500 focus:border-teal-400 focus:bg-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5"
                    >
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      placeholder="Örn: Yılmaz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-sm sm:text-base font-medium text-white placeholder:text-slate-500 focus:border-teal-400 focus:bg-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="studentNumber"
                      className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5"
                    >
                      Okul / Öğrenci Numarası
                    </label>
                    <input
                      id="studentNumber"
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Örn: 0240100123"
                      value={studentNumber}
                      onChange={(e) => handleNumberChange(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-sm sm:text-base font-mono font-bold text-white placeholder:text-slate-500 focus:border-teal-400 focus:bg-slate-900 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Yalnızca rakam giriniz (5–15 hane). Baştaki sıfırlar
                      otomatik korunur.
                    </p>
                  </div>

                  {/* Sınıf ve Şube / Grup Seçimi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                        Sınıf
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setClassLevel(cls)}
                            className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                              classLevel === cls
                                ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm'
                                : 'bg-white/[0.04] border-white/[0.12] text-slate-300 hover:bg-white/[0.08]'
                            }`}
                          >
                            {cls}. Sınıf
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                        Şube / Grup
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['A', 'B'] as const).map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setSection(sec)}
                            className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                              section === sec
                                ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm'
                                : 'bg-white/[0.04] border-white/[0.12] text-slate-300 hover:bg-white/[0.08]'
                            }`}
                          >
                            {sec} Grubu
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-sm sm:text-base font-extrabold shadow-[0_0_25px_rgba(45,212,191,0.3)] transition-all disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Giriş Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Devam Et ve Ders Seç</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : student.approvalStatus !== 'APPROVED' ? (
          /* STEP 1.5: Pending Admin Approval Screen */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="rounded-3xl bg-slate-900/85 border border-amber-500/40 backdrop-blur-xl p-7 sm:p-9 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  Onay Bekleniyor
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Kayıt İsteğiniz Gönderildi
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Kayıt talebiniz ders öğretmeninize iletildi. Öğretmeniniz
                  onayladığında dersleriniz bu ekranda otomatik olarak
                  açılacaktır.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.1] p-4 text-left space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ad Soyad:</span>
                  <span className="font-bold text-white">
                    {student.firstName} {student.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Okul Numarası:</span>
                  <span className="font-mono font-bold text-teal-300">
                    {student.studentNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sınıf / Grup:</span>
                  <span className="font-bold text-white">
                    {student.classLevel ?? 2}. Sınıf - {student.section || 'A'}{' '}
                    Grubu
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={checkingApproval}
                  onClick={refreshApprovalStatus}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm transition disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      checkingApproval ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Durumu Kontrol Et</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-slate-200 font-bold text-xs sm:text-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* STEP 2: Course Selection Screen (Filtered by Admin Visibility) */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full space-y-8"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Hoş Geldin, {student.firstName}!</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                Çalışmak İstediğin Dersi Seç
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Aşağıda senin için aktif edilen ders panelleri listelenmektedir.
                İlgili derse tıklayarak haftalık uygulamalara geçebilirsin.
              </p>
            </div>

            {visibleCatalog.length === 0 ? (
              <div className="max-w-lg mx-auto rounded-3xl bg-slate-900/80 border border-white/[0.1] p-8 text-center space-y-3">
                <Lock className="w-10 h-10 text-amber-400 mx-auto" />
                <h2 className="text-lg font-bold text-white">
                  Henüz Tanımlı Ders Bulunmuyor
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Öğretmeniniz tarafından hesabınıza henüz görünür bir ders
                  atanmamış. Lütfen ders öğretmeninizle iletişime geçin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleCatalog.map((course) => {
                  const isReady = course.isReady;
                  return (
                    <div
                      key={course.code}
                      className={`group relative rounded-3xl p-6 flex flex-col justify-between border backdrop-blur-xl transition-all ${
                        isReady
                          ? 'bg-slate-900/85 border-teal-500/40 hover:border-teal-400 shadow-[0_0_35px_rgba(45,212,191,0.12)] hover:scale-[1.01]'
                          : 'bg-slate-900/50 border-white/[0.08] opacity-85'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-5">
                          <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.1]">
                            {getCourseIcon(course.code)}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              isReady
                                ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {course.badgeText}
                          </span>
                        </div>

                        <h2 className="text-xl font-extrabold text-white mb-1">
                          {course.shortTitle}
                        </h2>
                        <div className="text-xs font-semibold text-teal-400/90 mb-3">
                          {course.subtitle}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                          {course.description}
                        </p>
                      </div>

                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => router.push(course.href)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-md"
                        >
                          <span>Ders Paneline Git</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed">
                          <Lock className="w-4 h-4" />
                          <span>Yakında Eklenecek</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 text-center text-xs text-slate-500 border-t border-white/[0.05]">
        © {new Date().getFullYear()} Halim Aslıyüksek · Halimaslyk Akademi Eğitim
        Portalı
      </footer>
    </div>
  );
}
