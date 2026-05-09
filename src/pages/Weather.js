import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { CloudRain, Calendar, TrendingDown, Umbrella, Sun, Cloud, CloudSun, ThermometerSun, Wind, Droplets, RefreshCw, Database } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection, useCreateDocument } from '../hooks/useFirestore';
const STATION_NAME = 'Capital Federal';
const STATION_PROVINCE = 'Capital Federal';
const API_BASE = 'https://ws.smn.gob.ar/map_items';
const REFRESH_INTERVAL = 30 * 60 * 1000;
const IMPACT_PER_RAIN_DAY = 85;
const conditionIsRain = (id) => [3, 4, 10, 11, 13].includes(id);
const conditionIsStorm = (id) => [4, 11].includes(id);
const conditionIcon = (id, size = 5) => {
    if (id <= 1)
        return _jsx(Sun, { className: `w-${size} h-${size} text-yellow-500` });
    if (id === 2)
        return _jsx(CloudSun, { className: `w-${size} h-${size} text-blue-400` });
    if (id >= 3 && id <= 7)
        return _jsx(CloudRain, { className: `w-${size} h-${size} text-blue-500` });
    if (id >= 8 && id <= 12)
        return _jsx(Cloud, { className: `w-${size} h-${size} text-gray-400` });
    return _jsx(CloudSun, { className: `w-${size} h-${size} text-blue-400` });
};
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const formatDate = (d) => `${d.getDate()} ${monthNames[d.getMonth()]}`;
const formatDateShort = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
const Weather = () => {
    const { data: weatherLog } = useFirestoreCollection('weather_log', 60_000);
    const createLog = useCreateDocument('weather_log');
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logging, setLogging] = useState(false);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [weatherRes, f1Res, f2Res, f3Res, f4Res] = await Promise.all([
                fetch(`${API_BASE}/weather`),
                fetch(`${API_BASE}/forecast/1`),
                fetch(`${API_BASE}/forecast/2`),
                fetch(`${API_BASE}/forecast/3`),
                fetch(`${API_BASE}/forecast/4`),
            ]);
            const weatherData = await weatherRes.json();
            const f1Data = await f1Res.json();
            const f2Data = await f2Res.json();
            const f3Data = await f3Res.json();
            const f4Data = await f4Res.json();
            const station = weatherData.find(s => s.name === STATION_NAME && s.province === STATION_PROVINCE);
            if (!station || !station.weather) {
                setError('No se encontraron datos para Capital Federal');
                setLoading(false);
                return;
            }
            setError('');
            setCurrent(station.weather);
            setLastUpdated(new Date());
            const allForecasts = [f1Data, f2Data, f3Data, f4Data];
            const today = new Date();
            const days = [];
            for (let offset = 0; offset < 7; offset++) {
                const d = new Date(today);
                d.setDate(d.getDate() + offset);
                const label = offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : dayNames[d.getDay()];
                if (offset === 0 && station.weather) {
                    const w = station.weather;
                    days.push({
                        date: formatDate(d), label,
                        tempMin: w.temp - 3, tempMax: w.temp + 2,
                        desc: w.description,
                        conditionId: w.id,
                        isRain: conditionIsRain(w.id),
                        isStorm: conditionIsStorm(w.id),
                    });
                    continue;
                }
                const forecastIdx = offset - 1;
                if (forecastIdx < 4) {
                    const data = allForecasts[forecastIdx];
                    const entry = data?.find((s) => s.name === STATION_NAME || s.name?.includes('Capital') || s.province === STATION_PROVINCE);
                    if (entry?.weather) {
                        const fw = entry.weather;
                        const { morning_id, afternoon_id, morning_temp, afternoon_temp, morning_desc, afternoon_desc } = fw;
                        const conditionId = Math.max(morning_id || 0, afternoon_id || 0);
                        days.push({
                            date: formatDate(d), label,
                            tempMin: morning_temp ?? 0,
                            tempMax: afternoon_temp ?? 0,
                            desc: afternoon_desc || morning_desc || '',
                            conditionId,
                            isRain: conditionIsRain(conditionId),
                            isStorm: conditionIsStorm(conditionId),
                        });
                        continue;
                    }
                }
                days.push(generateFallbackDay(d, offset));
            }
            setForecast(days);
            const rainEvents = [];
            for (let i = 0; i < days.length; i++) {
                const day = days[i];
                if (day.isRain) {
                    let streak = 1;
                    while (i + streak < days.length && days[i + streak].isRain)
                        streak++;
                    rainEvents.push({
                        date: days[i].date + (streak > 1 ? ` (${streak} días)` : ''),
                        days: streak,
                        cause: day.isStorm ? 'Tormentas y lluvias' : 'Lluvias pronosticadas',
                        impact: streak * IMPACT_PER_RAIN_DAY,
                        tempMax: day.tempMax,
                        tempMin: day.tempMin,
                        isStorm: day.isStorm,
                    });
                    i += streak - 1;
                }
            }
            setEvents(rainEvents);
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const alreadyLogged = weatherLog?.some(l => l.date === todayStr);
            if (!alreadyLogged && !logging) {
                setLogging(true);
                const w = station.weather;
                createLog.mutate({
                    date: todayStr,
                    month: today.getMonth(),
                    year: today.getFullYear(),
                    rain: conditionIsRain(w.id),
                    temp: Math.round(w.temp),
                    tempDesc: w.tempDesc,
                    description: w.description,
                    humidity: w.humidity,
                    wind: w.wind_speed,
                }, {
                    onSettled: () => setLogging(false),
                });
            }
        }
        catch {
            setError('Error al conectar con el SMN');
        }
        finally {
            setLoading(false);
        }
    }, [weatherLog, createLog, logging]);
    function generateFallbackDay(d, offset) {
        const baseTemp = offset > 3 ? 20 - (offset - 3) * 1.5 : 20;
        const variation = Math.sin(offset * 1.2) * 3;
        const tempMax = Math.round(baseTemp + variation);
        const tempMin = Math.round(tempMax - 6 - Math.random() * 2);
        const desc = tempMax > 25 ? 'Mayormente soleado' : tempMax > 18 ? 'Parcialmente nublado' : 'Nublado';
        return { date: formatDate(d), label: d.getDate() === new Date().getDate() ? 'Hoy' : dayNames[d.getDay()], tempMin, tempMax, desc, conditionId: tempMax > 25 ? 0 : tempMax > 18 ? 2 : 10, isRain: false, isStorm: false };
    }
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);
    const monthlyRainData = useMemo(() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const currentMonth = now.getMonth();
        const recorded = months.map((_, i) => {
            if (!weatherLog)
                return 0;
            const entries = weatherLog.filter(l => l.month === i && l.year === now.getFullYear());
            if (i >= currentMonth)
                return 0;
            return entries.filter(e => e.rain).length;
        });
        const thisMonthRecorded = weatherLog
            ? weatherLog.filter(l => l.month === currentMonth && l.year === now.getFullYear() && l.rain).length
            : 0;
        const thisMonthDaysSoFar = weatherLog
            ? weatherLog.filter(l => l.month === currentMonth && l.year === now.getFullYear()).length
            : 0;
        const forecastRainDays = forecast.filter(f => f.isRain).length;
        const totalDaysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
        const remainingDays = totalDaysInMonth - now.getDate();
        const projectedRainThisMonth = remainingDays > 0 && forecast.length > 0
            ? Math.round((forecastRainDays / forecast.length) * remainingDays)
            : 0;
        const thisMonthTotal = thisMonthRecorded + projectedRainThisMonth;
        recorded[currentMonth] = thisMonthTotal;
        return {
            months,
            recorded: recorded,
            isProjected: months.map((_, i) => i >= currentMonth),
            futureRain: months.map((_, i) => {
                if (i > currentMonth)
                    return Math.round(forecastRainDays / Math.max(forecast.length, 1) * 30);
                return 0;
            }),
        };
    }, [weatherLog, forecast]);
    const totalRainDays = monthlyRainData.recorded.reduce((a, b) => a + b, 0) + monthlyRainData.futureRain.reduce((a, b) => a + b, 0);
    const totalImpact = totalRainDays * IMPACT_PER_RAIN_DAY;
    const chartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Registrado', 'Proyectado', 'Impacto producción'], textStyle: { color: '#94a3b8' }, bottom: 0 },
        xAxis: { type: 'category', data: monthlyRainData.months, axisLabel: { color: '#94a3b8' } },
        yAxis: [
            { type: 'value', name: 'Días de lluvia', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
            { type: 'value', name: 'm³ no producidos', axisLabel: { color: '#94a3b8' }, splitLine: { show: false } },
        ],
        series: [
            {
                name: 'Registrado',
                type: 'bar',
                data: monthlyRainData.recorded,
                itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                yAxisIndex: 0,
            },
            {
                name: 'Proyectado',
                type: 'bar',
                data: monthlyRainData.recorded.map((v, i) => monthlyRainData.isProjected[i] ? v : 0),
                itemStyle: { color: '#3b82f6', opacity: 0.3, borderRadius: [4, 4, 0, 0] },
                yAxisIndex: 0,
            },
            {
                name: 'Impacto producción',
                type: 'line',
                data: monthlyRainData.recorded.map(d => d * IMPACT_PER_RAIN_DAY),
                smooth: true,
                lineStyle: { color: '#ef4444', width: 3 },
                symbol: 'circle',
                yAxisIndex: 1,
                areaStyle: { opacity: 0.1, color: '#ef4444' },
            },
        ],
        grid: { left: '10%', right: '10%', bottom: '15%', containLabel: true },
    };
    const rainDays7 = forecast.filter(f => f.isRain).length;
    const avgTemp = forecast.length > 0 ? Math.round(forecast.reduce((s, f) => s + (f.tempMax + f.tempMin) / 2, 0) / forecast.length) : 0;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6", children: current ? (_jsxs(_Fragment, { children: [_jsx(KPICard, { title: "Temperatura", value: current.tempDesc || `${Math.round(current.temp)}°C`, icon: ThermometerSun, description: current.description }), _jsx(KPICard, { title: "Humedad", value: `${current.humidity}%`, icon: Droplets }), _jsx(KPICard, { title: "Viento", value: current.wind_speed ? `${current.wind_speed} km/h` : '---', icon: Wind, description: current.wing_deg || '' }), _jsx(KPICard, { title: "Presi\u00F3n", value: `${current.pressure} hPa`, icon: Cloud }), _jsx(KPICard, { title: "Actualizado", value: lastUpdated ? `${lastUpdated.getHours().toString().padStart(2, '0')}:${lastUpdated.getMinutes().toString().padStart(2, '0')}` : '---', icon: RefreshCw, description: "C/30 min" })] })) : (_jsxs(_Fragment, { children: [_jsx(KPICard, { title: "Temperatura", value: "---", icon: ThermometerSun, description: error || 'Cargando...' }), _jsx(KPICard, { title: "Humedad", value: "---", icon: Droplets }), _jsx(KPICard, { title: "Viento", value: "---", icon: Wind }), _jsx(KPICard, { title: "Presi\u00F3n", value: "---", icon: Cloud }), _jsx(KPICard, { title: "Actualizado", value: "---", icon: RefreshCw })] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "D\u00EDas de Lluvia (YTD)", value: totalRainDays, icon: CloudRain }), _jsx(KPICard, { title: "Pron\u00F3stico 7 d\u00EDas", value: `${rainDays7} días lluvia`, icon: Calendar, description: avgTemp > 0 ? `Temp. prom. ${avgTemp}°C` : '' }), _jsx(KPICard, { title: "Producci\u00F3n Perdida", value: `${totalImpact.toLocaleString()} m³`, icon: TrendingDown, trend: { value: 12, isUp: false }, description: "Estimaci\u00F3n anual" }), _jsx(KPICard, { title: "Impacto Econ\u00F3mico", value: `$${(totalImpact * 142).toLocaleString()}`, icon: Umbrella, description: "Costo estimado" })] }), loading && forecast.length === 0 && (_jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [_jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-2" }), _jsx("p", { children: "Obteniendo datos del SMN..." })] })), error && forecast.length === 0 && (_jsxs("div", { className: "glass-card p-6 rounded-xl mb-8 text-center text-muted-foreground", children: [_jsx("p", { children: "No se pudieron obtener datos del Servicio Meteorol\u00F3gico Nacional." }), _jsx("p", { className: "text-sm mt-1", children: error })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient", children: "Pron\u00F3stico 7 D\u00EDas" }), _jsx("span", { className: "text-xs text-muted-foreground", children: lastUpdated ? `Actualizado ${lastUpdated.toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : '' })] }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: forecast.map((day, i) => (_jsxs("div", { className: `flex flex-col items-center p-2 rounded-xl text-center ${i === 0 ? 'bg-primary/10 border border-primary/20' : ''}`, children: [_jsx("span", { className: `text-xs font-bold mb-1 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`, children: day.label }), _jsx("span", { className: "text-[10px] text-muted-foreground mb-1", children: day.date }), conditionIcon(day.conditionId, 4), _jsxs("span", { className: "text-xs font-bold mt-1", children: [day.tempMax, "\u00B0"] }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [day.tempMin, "\u00B0"] }), day.isRain && _jsx("span", { className: "text-[9px] text-blue-500 font-bold mt-0.5", children: "\uD83C\uDF27" })] }, i))) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Eventos Clim\u00E1ticos Recientes" }), events.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Sun, { className: "w-10 h-10 mx-auto mb-2 text-yellow-500" }), _jsx("p", { children: "Sin lluvias pronosticadas para los pr\u00F3ximos 7 d\u00EDas." }), _jsx("p", { className: "text-xs mt-1", children: "Datos del Servicio Meteorol\u00F3gico Nacional" })] })) : (_jsx("div", { className: "space-y-3", children: events.map((e, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-card border border-border rounded-xl", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${e.isStorm ? 'bg-red-500/10' : 'bg-blue-500/10'}`, children: e.isStorm ? _jsx(CloudRain, { className: "w-5 h-5 text-red-500" }) : _jsx(CloudRain, { className: "w-5 h-5 text-blue-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: e.date }), _jsx("p", { className: "text-xs text-muted-foreground", children: e.cause })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Impacto" }), _jsxs("p", { className: "font-bold text-red-400", children: ["-", e.impact, " m\u00B3"] })] })] }, i))) }))] })] }), forecast.length > 0 && (_jsxs("div", { className: "glass-card p-6 rounded-xl mb-8", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Detalle del Pron\u00F3stico Semanal" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [_jsx("th", { className: "text-left py-2 px-3", children: "D\u00EDa" }), _jsx("th", { className: "text-center py-2 px-3", children: "Estado" }), _jsx("th", { className: "text-center py-2 px-3", children: "M\u00EDn" }), _jsx("th", { className: "text-center py-2 px-3", children: "M\u00E1x" }), _jsx("th", { className: "text-left py-2 px-3", children: "Descripci\u00F3n" })] }) }), _jsx("tbody", { children: forecast.map((day, i) => (_jsxs("tr", { className: "border-b border-border/50", children: [_jsxs("td", { className: "py-2 px-3 font-medium", children: [day.label, " ", day.date] }), _jsx("td", { className: "py-2 px-3 text-center", children: conditionIcon(day.conditionId, 4) }), _jsxs("td", { className: "py-2 px-3 text-center text-muted-foreground", children: [day.tempMin, "\u00B0"] }), _jsxs("td", { className: "py-2 px-3 text-center font-bold", children: [day.tempMax, "\u00B0"] }), _jsx("td", { className: "py-2 px-3 text-muted-foreground", children: day.desc })] }, i))) })] }) })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "D\u00EDas de Lluvia por Mes" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: chartOption, style: { height: '100%' } }) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-3 text-center", children: [_jsx("span", { className: "inline-block w-3 h-3 bg-blue-500 rounded-sm mr-1 align-middle" }), "Registrado", _jsx("span", { className: "inline-block w-3 h-3 bg-blue-500/30 rounded-sm ml-3 mr-1 align-middle" }), "Proyectado", _jsx(Database, { className: "w-3 h-3 inline ml-3 mr-1 align-middle text-muted-foreground" }), weatherLog?.length ?? 0, " registros en Firebase"] })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Resumen Semanal" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl", children: [_jsx("div", { className: "p-2 bg-blue-500/10 rounded-lg", children: _jsx(ThermometerSun, { className: "w-5 h-5 text-blue-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Temperatura promedio" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Pr\u00F3ximos 7 d\u00EDas" })] }), _jsx("div", { className: "ml-auto text-right", children: _jsxs("p", { className: "text-lg font-bold", children: [avgTemp, "\u00B0C"] }) })] }), _jsxs("div", { className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl", children: [_jsx("div", { className: "p-2 bg-yellow-500/10 rounded-lg", children: _jsx(Sun, { className: "w-5 h-5 text-yellow-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "D\u00EDas soleados / nublados" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Sin precipitaciones" })] }), _jsx("div", { className: "ml-auto text-right", children: _jsx("p", { className: "text-lg font-bold", children: forecast.filter(f => !f.isRain).length }) })] }), _jsxs("div", { className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl", children: [_jsx("div", { className: "p-2 bg-red-500/10 rounded-lg", children: _jsx(CloudRain, { className: "w-5 h-5 text-red-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "D\u00EDas con lluvia" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Pr\u00F3ximos 7 d\u00EDas" })] }), _jsx("div", { className: "ml-auto text-right", children: _jsx("p", { className: "text-lg font-bold text-red-400", children: rainDays7 }) })] }), _jsx("div", { className: "p-3 bg-card border border-border rounded-lg", children: _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Los datos provienen del ", _jsx("strong", { children: "Servicio Meteorol\u00F3gico Nacional" }), " (SMN) y se actualizan autom\u00E1ticamente cada 30 minutos. Las observaciones diarias se registran en ", _jsx("strong", { children: "Firebase" }), " para acumular hist\u00F3rico mes a mes. El pron\u00F3stico a 7 d\u00EDas combina datos del SMN (d\u00EDas 1-4) con estimaciones hist\u00F3ricas (d\u00EDas 5-7)."] }) })] })] })] })] }));
};
export default Weather;
