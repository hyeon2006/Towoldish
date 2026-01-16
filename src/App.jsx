import { useState, useEffect, useCallback } from 'react';
import {
    Heart,
    Menu,
    X,
    Settings,
    Moon,
    Sun,
    Monitor,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Utensils,
    Mail,
    Calendar,
    RotateCcw,
} from 'lucide-react';

const ALLERGY_MAP = {
    1: '난류',
    2: '우유',
    3: '메밀',
    4: '땅콩',
    5: '대두',
    6: '밀',
    7: '고등어',
    8: '게',
    9: '새우',
    10: '돼지고기',
    11: '복숭아',
    12: '토마토',
    13: '아황산류',
    14: '호두',
    15: '닭고기',
    16: '쇠고기',
    17: '오징어',
    18: '조개류',
    19: '잣',
};

function App() {
    const [lunch, setLunch] = useState([]);
    const [dinner, setDinner] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(new Date().getMonth());

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
    const [selectedAllergies, setSelectedAllergies] = useState(
        JSON.parse(localStorage.getItem('myAllergies')) || [],
    );
    const [likes, setLikes] = useState({});

    const API_KEY = '376c66873c3845a485f42bc79baa29ce';
    const OFFICE_CODE = 'S10';
    const SCHOOL_CODE = '9010319';
    const SERVER_URL = '';

    const parseMenu = useCallback((text) => {
        if (!text) return [{ name: '정보 없음', codes: [], isNoInfo: true }];
        return text
            .split('<br/>')
            .map((item) => {
                const codes = item.match(/\d+/g)?.map(Number) || [];
                const name = item.replace(/\([0-9.]+\)/g, '').trim();
                return { name, codes, isNoInfo: false };
            })
            .filter((i) => i.name !== '');
    }, []);

    const fetchMeals = useCallback(
        async (dateStr) => {
            try {
                const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&KEY=${API_KEY}&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${dateStr}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.mealServiceDietInfo) {
                    const rows = data.mealServiceDietInfo[1].row;
                    setLunch(parseMenu(rows.find((m) => m.MMEAL_SC_CODE === '2')?.DDISH_NM));
                    setDinner(parseMenu(rows.find((m) => m.MMEAL_SC_CODE === '3')?.DDISH_NM));
                } else {
                    setLunch([{ name: '급식이 없습니다.', codes: [], isNoInfo: true }]);
                    setDinner([{ name: '석식이 없습니다.', codes: [], isNoInfo: true }]);
                }
            } catch (e) {
                console.error(e);
            }
        },
        [parseMenu],
    );

    const fetchLikes = useCallback(async () => {
        try {
            const res = await fetch(`${SERVER_URL}likes.php?mode=get`);
            if (res.ok) {
                const data = await res.json();
                setLikes(data);
            }
        } catch {
            setLikes({});
        }
    }, []);

    const getFormattedDate = useCallback((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }, []);

    useEffect(() => {
        const formattedDate = getFormattedDate(currentDate);
        fetchMeals(formattedDate);
        fetchLikes();
    }, [currentDate, fetchMeals, fetchLikes, getFormattedDate]);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('myAllergies', JSON.stringify(selectedAllergies));
    }, [selectedAllergies]);

    useEffect(() => {
        if (isCalendarOpen) {
            setCalYear(currentDate.getFullYear());
            setCalMonth(currentDate.getMonth());
        }
    }, [isCalendarOpen, currentDate]);

    const getDisplayDate = (date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const changeDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setCalYear(today.getFullYear());
        setCalMonth(today.getMonth());
    };

    const handleDateClick = (day) => {
        const newDate = new Date(calYear, calMonth, day);
        setCurrentDate(newDate);
        setIsCalendarOpen(false);
    };

    const handleLike = async (menuName) => {
        if (!isToday(currentDate)) return;

        const serverId = menuName;
        const dateStr = getFormattedDate(currentDate);
        const localKey = `like_${dateStr}_${menuName}`;
        const isLikedToday = localStorage.getItem(localKey) === 'liked';

        if (isLikedToday) {
            setLikes((prev) => ({ ...prev, [serverId]: Math.max((prev[serverId] || 0) - 1, 0) }));
            localStorage.removeItem(localKey);
            try {
                await fetch(`${SERVER_URL}likes.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `mode=unlike&id=${serverId}`,
                });
            } catch {
                setLikes((prev) => ({ ...prev, [serverId]: (prev[serverId] || 0) + 1 }));
                localStorage.setItem(localKey, 'liked');
            }
        } else {
            setLikes((prev) => ({ ...prev, [serverId]: (prev[serverId] || 0) + 1 }));
            localStorage.setItem(localKey, 'liked');
            try {
                await fetch(`${SERVER_URL}likes.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `mode=like&id=${serverId}`,
                });
            } catch {
                setLikes((prev) => ({ ...prev, [serverId]: (prev[serverId] || 0) - 1 }));
                localStorage.removeItem(localKey);
            }
        }
    };

    const toggleAllergy = (code) => {
        setSelectedAllergies((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
        );
    };

    const CustomCalendar = () => {
        const [view, setView] = useState('day');
        const [yearViewStart, setYearViewStart] = useState(Math.floor(calYear / 12) * 12);

        useEffect(() => {
            if (view === 'year') {
                setYearViewStart(Math.floor(calYear / 12) * 12);
            }
        }, [view]);

        const handlePrev = () => {
            if (view === 'day') {
                if (calMonth === 0) {
                    setCalYear(calYear - 1);
                    setCalMonth(11);
                } else {
                    setCalMonth(calMonth - 1);
                }
            } else if (view === 'year') {
                setYearViewStart((prev) => prev - 12);
            }
        };

        const handleNext = () => {
            if (view === 'day') {
                if (calMonth === 11) {
                    setCalYear(calYear + 1);
                    setCalMonth(0);
                } else {
                    setCalMonth(calMonth + 1);
                }
            } else if (view === 'year') {
                setYearViewStart((prev) => prev + 12);
            }
        };

        // 1. DAY VIEW
        const renderDays = () => {
            const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
            const days = [];

            for (let i = 0; i < firstDayOfWeek; i++) {
                days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const thisDate = new Date(calYear, calMonth, d);
                const isTodayDate = isToday(thisDate);
                const isSelected =
                    thisDate.getDate() === currentDate.getDate() &&
                    thisDate.getMonth() === currentDate.getMonth() &&
                    thisDate.getFullYear() === currentDate.getFullYear();

                days.push(
                    <button
                        key={d}
                        onClick={() => handleDateClick(d)}
                        className={`w-9 h-9 text-sm rounded-full flex items-center justify-center transition-all
                        ${
                            isSelected
                                ? 'bg-sky-400 text-white font-bold shadow-md scale-105'
                                : isTodayDate
                                  ? 'border-2 border-sky-300 text-sky-500 font-bold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {d}
                    </button>,
                );
            }
            return (
                <>
                    <div className="grid grid-cols-7 mb-2 text-center animate-fade-in">
                        {weekDays.map((day, idx) => (
                            <span
                                key={day}
                                className={`text-xs font-bold ${idx === 0 ? 'text-rose-400' : 'text-slate-400'}`}
                            >
                                {day}
                            </span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 place-items-center animate-fade-in">
                        {days}
                    </div>
                </>
            );
        };

        // 2. MONTH VIEW
        const renderMonths = () => {
            const months = [];
            for (let i = 0; i < 12; i++) {
                const isSelected = i === calMonth;
                months.push(
                    <button
                        key={i}
                        onClick={() => {
                            setCalMonth(i);
                            setView('day');
                        }}
                        className={`h-12 rounded-xl text-sm font-bold transition-all
                        ${
                            isSelected
                                ? 'bg-sky-400 text-white shadow-md'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {i + 1}월
                    </button>,
                );
            }
            return <div className="grid grid-cols-3 gap-3 animate-fade-in mt-2">{months}</div>;
        };

        // 3. YEAR VIEW
        const renderYears = () => {
            const years = [];
            for (let i = 0; i < 12; i++) {
                const y = yearViewStart + i;
                const isSelected = y === calYear;
                years.push(
                    <button
                        key={y}
                        onClick={() => {
                            setCalYear(y);
                            setView('month');
                        }}
                        className={`h-12 rounded-xl text-sm font-bold transition-all
                        ${
                            isSelected
                                ? 'bg-sky-400 text-white shadow-md'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {y}
                    </button>,
                );
            }
            return <div className="grid grid-cols-3 gap-3 animate-fade-in mt-2">{years}</div>;
        };

        return (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl w-72 border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4 min-h-[32px]">
                    <button
                        onClick={handlePrev}
                        className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 ${view === 'month' ? 'invisible' : ''}`}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-0 items-center justify-center flex-1">
                        <button
                            onClick={() => setView('year')}
                            className={`px-1 py-1 rounded-lg text-lg font-bold transition-colors 
                            ${
                                view === 'year'
                                    ? 'bg-sky-100 text-sky-600 dark:bg-slate-700 dark:text-sky-300'
                                    : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {view === 'year'
                                ? `${yearViewStart} - ${yearViewStart + 11}`
                                : `${calYear}년`}
                        </button>

                        {view !== 'year' && (
                            <button
                                onClick={() => setView('month')}
                                className={`px-1 py-1 rounded-lg text-lg font-bold transition-colors 
                                ${
                                    view === 'month'
                                        ? 'bg-sky-100 text-sky-600 dark:bg-slate-700 dark:text-sky-300'
                                        : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {calMonth + 1}월
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 ${view === 'month' ? 'invisible' : ''}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="min-h-[250px]">
                    {view === 'day' && renderDays()}
                    {view === 'month' && renderMonths()}
                    {view === 'year' && renderYears()}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                        onClick={() => setIsCalendarOpen(false)}
                        className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    };

    const MenuItem = ({ item }) => {
        const isDangerous = item.codes.some((code) => selectedAllergies.includes(code));
        const serverId = item.name;
        const likeCount = likes[serverId] || 0;

        const isTodayDate = isToday(currentDate);
        const dateStr = getFormattedDate(currentDate);
        const localKey = `like_${dateStr}_${item.name}`;
        const isMyLike = isTodayDate && localStorage.getItem(localKey) === 'liked';

        return (
            <li
                className={`flex items-center justify-between p-3 rounded-2xl mb-2 transition-all duration-300
        ${
            isDangerous
                ? 'bg-rose-50/80 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800'
                : 'bg-white/60 hover:bg-white/90 dark:bg-slate-700/40 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700'
        } backdrop-blur-sm`}
            >
                <div className="flex items-center gap-3">
                    {isDangerous && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
                    <span
                        className={`text-lg break-keep font-medium tracking-tight
            ${
                isDangerous
                    ? 'text-rose-400 font-bold dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300'
            }`}
                    >
                        {item.name}
                    </span>
                </div>

                {!item.isNoInfo && (
                    <button
                        onClick={() => handleLike(item.name)}
                        className={`group flex items-center gap-1.5 px-2 py-1 rounded-full transition active:scale-95 
              ${
                  isTodayDate
                      ? 'hover:bg-pink-50 dark:hover:bg-pink-900/20 cursor-pointer'
                      : 'opacity-50 cursor-default pointer-events-none'
              }`}
                    >
                        <Heart
                            size={18}
                            fill={isMyLike ? 'currentColor' : 'none'}
                            className={`transition-colors 
                ${
                    isMyLike
                        ? 'text-pink-300 drop-shadow-sm'
                        : isTodayDate
                          ? 'text-slate-300 group-hover:text-pink-300'
                          : 'text-slate-300'
                }`}
                        />
                        <span
                            className={`text-sm font-medium min-w-[1rem] text-center 
              ${
                  isMyLike
                      ? 'text-pink-400'
                      : isTodayDate
                        ? 'text-slate-400 group-hover:text-pink-300'
                        : 'text-slate-400'
              }`}
                        >
                            {likeCount}
                        </span>
                    </button>
                )}
            </li>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 font-sans flex flex-col">
            <header className="bg-sky-200/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-100 p-4 sticky top-0 z-20 shadow-sm backdrop-blur-md transition-colors duration-500">
                <div className="flex justify-between items-center max-w-4xl mx-auto relative">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-white/30 rounded-full transition"
                        >
                            <Menu size={24} className="text-slate-600 dark:text-slate-200" />
                        </button>
                        <h1 className="text-xl font-extrabold tracking-tighter text-slate-700 dark:text-white flex items-center gap-2">
                            <Utensils className="text-sky-500 dark:text-sky-300" size={20} />{' '}
                            토월급식
                        </h1>
                    </div>

                    <div className="flex items-center gap-1 bg-white/40 dark:bg-black/20 rounded-full px-2 py-1 shadow-sm relative">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-1.5 hover:bg-white/50 rounded-full transition text-slate-600 dark:text-slate-300"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="text-sm font-bold min-w-[5.5rem] text-center text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 transition"
                        >
                            {getDisplayDate(currentDate)}
                        </button>

                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="p-1.5 hover:bg-white/50 rounded-full transition text-slate-600 dark:text-slate-300"
                            title="달력 보기"
                        >
                            <Calendar size={16} />
                        </button>

                        <button
                            onClick={goToToday}
                            className="p-1.5 hover:bg-white/50 rounded-full transition text-slate-600 dark:text-slate-300"
                            title="오늘로 이동"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            onClick={() => changeDate(1)}
                            className="p-1.5 hover:bg-white/50 rounded-full transition text-slate-600 dark:text-slate-300"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {isCalendarOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsCalendarOpen(false)}
                    ></div>
                    <div className="relative z-10">
                        <CustomCalendar />
                    </div>
                </div>
            )}

            <div
                className={`fixed inset-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out`}
            >
                <div
                    className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
                <div className="relative bg-white/95 dark:bg-slate-800/95 w-80 h-full p-6 shadow-2xl overflow-y-auto border-r border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
                    >
                        <X />
                    </button>

                    <h2 className="text-2xl font-bold mb-8 text-slate-700 dark:text-white flex items-center gap-2">
                        <Settings className="text-sky-300" /> 설정
                    </h2>

                    <section className="mb-10">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">
                            Theme
                        </h3>
                        <div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-1.5 gap-1">
                            {['system', 'light', 'dark'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setTheme(m)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs transition-all duration-200 
                  ${
                      theme === m
                          ? 'bg-white dark:bg-slate-600 shadow-sm text-sky-500 dark:text-sky-300 font-bold scale-100'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 scale-95'
                  }`}
                                >
                                    {m === 'system' && <Monitor size={20} />}
                                    {m === 'light' && <Sun size={20} />}
                                    {m === 'dark' && <Moon size={20} />}
                                    <span className="mt-1">
                                        {m === 'system'
                                            ? '자동'
                                            : m === 'light'
                                              ? '라이트'
                                              : '다크'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest flex justify-between items-center">
                            Allergy Filter
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(ALLERGY_MAP).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => toggleAllergy(Number(code))}
                                    className={`py-2.5 px-3 rounded-xl text-sm text-left transition-all duration-200 border relative overflow-hidden
                    ${
                        selectedAllergies.includes(Number(code))
                            ? 'bg-rose-50 border-rose-100 text-rose-400 font-bold dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
                            : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 dark:bg-slate-700/30 dark:text-slate-400'
                    }`}
                                >
                                    {name}
                                    {selectedAllergies.includes(Number(code)) && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-300"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 space-y-6 pt-6 flex-grow w-full">
                {selectedAllergies.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1 animate-fade-in mb-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                            <AlertCircle size={12} className="mr-1.5" /> 주의
                        </span>
                        {selectedAllergies.map((code) => (
                            <span
                                key={code}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-rose-50 text-rose-400 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-100 dark:border-rose-800/30 shadow-sm"
                            >
                                {ALLERGY_MAP[code]}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-50 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none h-full">
                        <h2 className="text-slate-700 dark:text-slate-200 font-extrabold text-xl mb-6 flex items-center gap-3">
                            <span className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-2xl text-orange-300 dark:text-orange-400 shadow-sm">
                                ☀️
                            </span>
                            점심
                        </h2>
                        <ul className="space-y-1">
                            {lunch.map((item, i) => (
                                <MenuItem key={i} item={item} />
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-50 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none h-full">
                        <h2 className="text-slate-700 dark:text-slate-200 font-extrabold text-xl mb-6 flex items-center gap-3">
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-2xl text-indigo-300 dark:text-indigo-400 shadow-sm">
                                🌙
                            </span>
                            석식
                        </h2>
                        <ul className="space-y-1">
                            {dinner.map((item, i) => (
                                <MenuItem key={i} item={item} />
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            <footer className="w-full text-center py-8 opacity-70">
                <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                    <Mail size={14} />
                    문의:
                    <a
                        href="mailto:dltlgus06@kakao.com"
                        className="hover:text-sky-500 dark:hover:text-sky-300 transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4"
                    >
                        dltlgus06@kakao.com
                    </a>
                </p>
            </footer>
        </div>
    );
}

export default App;
